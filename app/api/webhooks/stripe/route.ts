import { type NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { createPrintifyOrder } from "@/lib/printify";

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
    // "paid" on completion; this also guards against async/delayed methods
    // (e.g. bank debits) if they're ever enabled.
    if (session.payment_status !== "paid") {
      return NextResponse.json({ received: true, fulfilled: false });
    }

    // v22: the collected SHIPPING address lives here — NOT session.shipping_details
    // (which doesn't exist) and NOT customer_details.address (that's billing).
    const shipping = session.collected_information?.shipping_details;
    const email = session.customer_details?.email ?? session.customer_email;
    const variantId = session.metadata?.variant_id;
    const addr = shipping?.address;

    // Stripe's shipping_address_collection enforces address completeness, so
    // these are present for real sessions. If a required field is missing it's a
    // PERMANENT problem (retrying won't fix immutable session data) — so we ack
    // with 200 instead of 500 to stop Stripe from retrying a doomed event.
    // region/state is intentionally NOT required: it's legitimately empty for
    // some countries (e.g. GB) and Printify accepts an empty region.
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

    try {
      await createPrintifyOrder({
        externalId: session.id, // idempotency key
        variantId: Number(variantId),
        email,
        name: shipping.name,
        phone: session.customer_details?.phone ?? undefined,
        address: {
          line1: shipping.address.line1,
          line2: shipping.address.line2,
          city: shipping.address.city,
          state: shipping.address.state,
          postalCode: shipping.address.postal_code,
          country: shipping.address.country,
        },
      });
    } catch (err) {
      console.error("Printify order creation failed", err);
      // Payment already succeeded — return 500 so Stripe retries delivery.
      return new NextResponse("Order fulfillment failed", { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
