import { type NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { createPrintifyOrder } from "@/lib/printify";
import { getSupabase } from "@/lib/supabase";
import { sendEmail } from "@/lib/resend";
import { orderConfirmationEmail, merchantSaleEmail } from "@/lib/emails";
import { BUNDLES, SHIPPING_OPTIONS, STORE } from "@/lib/content";

// Node runtime so Stripe's synchronous signature verification (Node crypto) works.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return new NextResponse("Webhook secret not configured", { status: 500 });
  }

  // Raw, unparsed body is required for signature verification — do NOT JSON.parse.
  const rawBody = await req.text();
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return new NextResponse("Missing stripe-signature", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(rawBody, sig, secret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    return new NextResponse(`Webhook Error: ${message}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    // Only fulfill once payment is actually captured. Card/wallet checkouts are
    // "paid" on completion; this also guards async/delayed methods if ever enabled.
    if (session.payment_status !== "paid") {
      return NextResponse.json({ received: true, fulfilled: false });
    }

    // v22: the collected SHIPPING address lives here — NOT session.shipping_details
    // (which doesn't exist) and NOT customer_details.address (that's billing).
    const shipping = session.collected_information?.shipping_details;
    const email = session.customer_details?.email ?? session.customer_email;
    const variantId = session.metadata?.variant_id;
    const addr = shipping?.address;

    // Missing required data is a PERMANENT problem (immutable session) — ack with
    // 200 so Stripe doesn't retry a doomed event. region/state intentionally not
    // required (legitimately empty for some countries; Printify accepts empty).
    if (
      !shipping ||
      !email ||
      !variantId ||
      !addr?.line1 ||
      !addr.city ||
      !addr.postal_code ||
      !addr.country
    ) {
      console.error("checkout.session.completed missing required fields", {
        hasShipping: !!shipping,
        hasEmail: !!email,
        variantId,
        hasAddress: !!addr?.line1,
      });
      return NextResponse.json({ received: true, fulfilled: false });
    }

    // Re-validate quantity against the bundle allowlist (defense in depth).
    const quantity =
      BUNDLES.find((b) => b.qty === Number(session.metadata?.quantity))?.qty ?? 1;
    // Map what the buyer paid for shipping to a Printify fulfillment method.
    const shippingPaidCents = session.shipping_cost?.amount_total ?? 0;
    const shippingMethod =
      SHIPPING_OPTIONS.find((o) => o.amountCents === shippingPaidCents)
        ?.printifyMethod ?? 1;

    // ── Idempotency gate ───────────────────────────────────────────────────────
    // Claim this order by inserting a row keyed on the unique stripe_session_id
    // BEFORE we create the Printify order. If the row already exists (a Stripe
    // retry or a concurrent delivery), the insert fails with unique_violation and
    // we skip — so a session can never produce two Printify orders.
    const supabase = getSupabase();
    let claimed = false;
    if (supabase) {
      const { error } = await supabase.from("orders").insert({
        stripe_session_id: session.id,
        email,
        name: shipping.name,
        amount_total: session.amount_total,
        quantity,
      });
      if (error) {
        if (error.code === "23505") {
          // Already processed/processing — do NOT create another Printify order.
          console.log(`Order ${session.id} already handled — skipping.`);
          return NextResponse.json({ received: true, duplicate: true });
        }
        // Non-unique DB error (e.g. transient outage): log and proceed so we don't
        // lose the sale. (Slightly weakens dedup for the rare concurrent-retry case.)
        console.error("orders insert failed (proceeding without claim)", error);
      } else {
        claimed = true;
      }
    }

    // ── Fulfillment (the only step Stripe should retry on failure) ─────────────
    try {
      await createPrintifyOrder({
        externalId: session.id, // also passed to Printify as its reference
        variantId: Number(variantId),
        quantity,
        shippingMethod,
        email,
        name: shipping.name,
        phone: session.customer_details?.phone ?? undefined,
        address: {
          line1: addr.line1,
          line2: addr.line2,
          city: addr.city,
          state: addr.state,
          postalCode: addr.postal_code,
          country: addr.country,
        },
      });
    } catch (err) {
      console.error("Printify order creation failed", err);
      // Release the claim so a Stripe retry can cleanly re-attempt fulfillment.
      if (claimed && supabase) {
        await supabase
          .from("orders")
          .delete()
          .eq("stripe_session_id", session.id);
      }
      return new NextResponse("Order fulfillment failed", { status: 500 });
    }

    // ── Notifications (best-effort: never block, never trigger a retry) ──
    const firstName = shipping.name.trim().split(/\s+/)[0];
    const itemName =
      session.metadata?.item_name ?? "Dangerous Dino Driver Pillowcase";
    const totalCents = session.amount_total ?? 0;

    // Customer order confirmation
    try {
      const conf = orderConfirmationEmail({
        firstName,
        quantity,
        itemName,
        totalCents,
      });
      await sendEmail({ to: email, subject: conf.subject, html: conf.html });
    } catch (err) {
      console.error("order confirmation email failed (non-fatal)", err);
    }

    // Merchant "you made a sale!" alert
    try {
      const alert = merchantSaleEmail({
        itemName,
        quantity,
        totalCents,
        customerName: shipping.name,
        customerEmail: email,
        city: addr.city,
        state: addr.state,
      });
      await sendEmail({
        to: STORE.contactEmail,
        subject: alert.subject,
        html: alert.html,
      });
    } catch (err) {
      console.error("merchant sale alert failed (non-fatal)", err);
    }
  }

  return NextResponse.json({ received: true });
}
