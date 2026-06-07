// TikTok Pixel helpers. Every call is a safe no-op unless the base pixel has
// loaded (window.ttq), which only happens when NEXT_PUBLIC_TIKTOK_PIXEL_ID is set.
// TikTok expects `value` as a number in major currency units, so we convert cents.

declare global {
  interface Window {
    ttq?: {
      page: () => void;
      track: (event: string, params?: Record<string, unknown>) => void;
      load: (id: string) => void;
    };
  }
}

export const TIKTOK_PIXEL_ID = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID;

function track(event: string, params: Record<string, unknown>) {
  if (typeof window === "undefined" || !window.ttq) return;
  window.ttq.track(event, params);
}

const dollars = (cents: number) => +(cents / 100).toFixed(2);

export function trackViewContent(p: {
  contentId: string;
  valueCents: number;
  contentName?: string;
}) {
  track("ViewContent", {
    content_type: "product",
    content_id: p.contentId,
    content_name: p.contentName,
    currency: "USD",
    value: dollars(p.valueCents),
  });
}

export function trackInitiateCheckout(p: {
  contentId: string;
  valueCents: number;
  quantity: number;
}) {
  track("InitiateCheckout", {
    content_type: "product",
    content_id: p.contentId,
    currency: "USD",
    value: dollars(p.valueCents),
    quantity: p.quantity,
  });
}

export function trackPurchase(p: {
  valueCents: number;
  currency?: string;
  contentId?: string;
  quantity?: number;
}) {
  // TikTok's purchase event is "CompletePayment".
  track("CompletePayment", {
    content_type: "product",
    content_id: p.contentId,
    currency: p.currency ?? "USD",
    value: dollars(p.valueCents),
    quantity: p.quantity,
  });
}
