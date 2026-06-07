import { type NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getProduct } from "@/lib/printify";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { variantId } = await req.json();
    if (variantId === undefined || variantId === null) {
      return NextResponse.json({ error: "Missing variantId" }, { status: 400 });
    }
    const variantIdNum = Number(variantId);

    // Derive price + title from Printify SERVER-SIDE. Never trust a price sent
    // from the browser — otherwise a buyer could pay $0.01 for anything.
    const product = await getProduct();
    const variant = product.variants.find((v) => v.id === variantIdNum);
    if (!variant) {
      return NextResponse.json({ error: "Unknown variant" }, { status: 400 });
    }
    if (!variant.is_enabled || !variant.is_available) {
      return NextResponse.json(
        { error: "That option is currently unavailable" },
        { status: 409 },
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? req.nextUrl.origin;
    const heroImage =
      product.images.find((i) => i.is_default)?.src ?? product.images[0]?.src;

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${product.title} — ${variant.title}`,
              ...(heroImage ? { images: [heroImage] } : {}),
            },
            unit_amount: variant.price, // cents, straight from Printify
          },
          quantity: 1,
        },
      ],
      shipping_address_collection: {
        allowed_countries: ["US", "CA", "GB", "AU"],
      },
      phone_number_collection: { enabled: true },
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            display_name: "Standard Shipping",
            fixed_amount: { amount: 599, currency: "usd" },
            delivery_estimate: {
              minimum: { unit: "business_day", value: 3 },
              maximum: { unit: "business_day", value: 7 },
            },
          },
        },
      ],
      metadata: {
        variant_id: String(variant.id),
        printify_product_id: product.id,
      },
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    // Intentional client-facing errors (bad/unavailable variant) are returned
    // above with 400/409. This catch is for unexpected failures — log the real
    // error, return a generic message so we don't leak internals to the client.
    console.error("POST /api/checkout failed", err);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}
