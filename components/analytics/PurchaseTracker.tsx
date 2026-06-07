"use client";

import { useEffect, useRef } from "react";
import { trackPurchase } from "@/lib/tiktok";

// Fires the TikTok CompletePayment event once per order. De-dupes across page
// refreshes and back/forward navigation using the Stripe session id, so a
// purchase is never counted twice. (Server-side Events API with a shared
// event_id remains the gold-standard upgrade for ad-blocker/iOS accuracy.)
export function PurchaseTracker({
  valueCents,
  eventId,
}: {
  valueCents: number;
  eventId?: string;
}) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current || valueCents <= 0) return;

    const key = eventId ? `ddd_purchase_${eventId}` : null;
    try {
      if (key && sessionStorage.getItem(key)) return;
      if (key) sessionStorage.setItem(key, "1");
    } catch {
      // sessionStorage unavailable (e.g. private mode) — fall back to once-per-mount.
    }

    fired.current = true;
    trackPurchase({ valueCents });
  }, [valueCents, eventId]);

  return null;
}
