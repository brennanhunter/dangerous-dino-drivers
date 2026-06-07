// Google Analytics 4 helpers. No-ops until NEXT_PUBLIC_GA_ID is set and gtag has
// loaded. Uses GA4's recommended ecommerce events (view_item / begin_checkout /
// purchase). Values are in major currency units.

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

function gaEvent(name: string, params: Record<string, unknown>) {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", name, params);
}

const dollars = (cents: number) => +(cents / 100).toFixed(2);

export function gaViewItem(p: {
  id: string;
  name: string;
  valueCents: number;
}) {
  gaEvent("view_item", {
    currency: "USD",
    value: dollars(p.valueCents),
    items: [{ item_id: p.id, item_name: p.name, price: dollars(p.valueCents) }],
  });
}

export function gaBeginCheckout(p: {
  id: string;
  valueCents: number;
  quantity: number;
}) {
  gaEvent("begin_checkout", {
    currency: "USD",
    value: dollars(p.valueCents),
    items: [
      { item_id: p.id, quantity: p.quantity, price: dollars(p.valueCents) },
    ],
  });
}

export function gaPurchase(p: { transactionId?: string; valueCents: number }) {
  gaEvent("purchase", {
    transaction_id: p.transactionId, // GA dedupes purchases by this
    currency: "USD",
    value: dollars(p.valueCents),
  });
}
