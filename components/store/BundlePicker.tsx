"use client";

import { usePurchase } from "./PurchaseProvider";
import { bundleTotalCents } from "@/lib/content";

function formatPrice(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function BundlePicker() {
  const { bundles, bundle, setBundle, unitPriceCents } = usePurchase();
  if (bundles.length <= 1) return null;

  return (
    <div className="grid gap-2">
      {bundles.map((b) => {
        const total = bundleTotalCents(b, unitPriceCents);
        const perUnit = total / b.qty;
        const savings = unitPriceCents * b.qty - total;
        const active = b.qty === bundle.qty;
        return (
          <button
            key={b.qty}
            type="button"
            onClick={() => setBundle(b)}
            aria-pressed={active}
            className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aqua ${
              active
                ? "border-aqua bg-aqua/10"
                : "border-white/15 bg-white/5 hover:border-white/40"
            }`}
          >
            <span className="flex items-center gap-3">
              <span
                aria-hidden
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                  active ? "border-aqua" : "border-white/40"
                }`}
              >
                {active && <span className="h-2.5 w-2.5 rounded-full bg-aqua" />}
              </span>
              <span>
                <span className="block font-semibold text-white">
                  {b.qty === 1 ? "Single pillowcase" : b.label}
                  {b.badge && (
                    <span className="ml-2 align-middle rounded-full bg-purple px-2 py-0.5 text-xs font-bold text-white">
                      {b.badge}
                    </span>
                  )}
                </span>
                <span className="block text-xs text-white/50">
                  {formatPrice(perUnit)} each
                  {savings > 0 ? ` · save ${formatPrice(savings)}` : ""}
                </span>
              </span>
            </span>
            <span className="shrink-0 font-bold text-aqua">
              {formatPrice(total)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
