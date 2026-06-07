import type { PrintifyProduct } from "./types";

const PRINTIFY_BASE = "https://api.printify.com/v1";

function printifyConfig() {
  const apiKey = process.env.PRINTIFY_API_KEY;
  const shopId = process.env.PRINTIFY_SHOP_ID;
  const productId = process.env.PRINTIFY_PRODUCT_ID;
  if (!apiKey || !shopId || !productId) {
    throw new Error(
      "Printify is not configured. Set PRINTIFY_API_KEY, PRINTIFY_SHOP_ID, and PRINTIFY_PRODUCT_ID in .env.local.",
    );
  }
  return { apiKey, shopId, productId };
}

export async function getProduct(): Promise<PrintifyProduct> {
  const { apiKey, shopId, productId } = printifyConfig();
  const res = await fetch(
    `${PRINTIFY_BASE}/shops/${shopId}/products/${productId}.json`,
    {
      headers: { Authorization: `Bearer ${apiKey}` },
      // Cache the product for an hour; the fetch cache is independent of the
      // route's dynamic-ness, so this works inside a dynamic Route Handler too.
      next: { revalidate: 3600 },
    },
  );
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Printify product fetch failed (${res.status}): ${body}`);
  }
  return res.json() as Promise<PrintifyProduct>;
}

export interface CreateOrderInput {
  externalId: string; // Stripe session id — used for idempotency / reconciliation
  variantId: number;
  quantity?: number;
  email: string;
  name: string;
  phone?: string;
  address: {
    line1: string | null;
    line2: string | null;
    city: string | null;
    state: string | null;
    postalCode: string | null;
    country: string | null;
  };
}

export async function createPrintifyOrder(input: CreateOrderInput) {
  const { apiKey, shopId, productId } = printifyConfig();

  const trimmed = input.name.trim();
  const spaceIdx = trimmed.indexOf(" ");
  const firstName = spaceIdx === -1 ? trimmed : trimmed.slice(0, spaceIdx);
  // Single-token names ("Madonna") keep an empty last name rather than
  // duplicating the full name into both fields.
  const lastName = spaceIdx === -1 ? "" : trimmed.slice(spaceIdx + 1);

  const order = {
    external_id: input.externalId,
    label: `DDD ${input.externalId}`,
    line_items: [
      {
        product_id: productId,
        variant_id: input.variantId,
        quantity: input.quantity ?? 1,
      },
    ],
    shipping_method: 1, // 1 = standard
    send_shipping_notification: true,
    // NOTE: the order is created "on hold" and is NOT charged until it is sent
    // to production (Printify auto-sends ~24h later by default). We deliberately
    // do NOT call send_to_production here, leaving a safety window to verify or
    // cancel during testing. Printify has no sandbox — orders are real.
    address_to: {
      first_name: firstName,
      last_name: lastName,
      email: input.email,
      ...(input.phone ? { phone: input.phone } : {}),
      country: input.address.country ?? "", // ISO 3166-1 alpha-2
      region: input.address.state ?? "", // state/province code
      address1: input.address.line1 ?? "",
      address2: input.address.line2 ?? "",
      city: input.address.city ?? "",
      zip: input.address.postalCode ?? "",
    },
  };

  const res = await fetch(`${PRINTIFY_BASE}/shops/${shopId}/orders.json`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(order),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Printify order create failed (${res.status}): ${body}`);
  }
  return res.json();
}
