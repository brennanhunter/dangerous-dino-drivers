"use client";

import { usePurchase } from "./PurchaseProvider";

export function VariantPicker() {
  const { sellable, variant, setVariant } = usePurchase();
  if (sellable.length <= 1) return null;

  return (
    <div className="mt-5">
      <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-white/60">
        Size
      </p>
      <div className="flex flex-wrap gap-2">
        {sellable.map((v) => {
          const active = v.id === variant.id;
          return (
            <button
              key={v.id}
              type="button"
              onClick={() => setVariant(v)}
              aria-pressed={active}
              className={`rounded-xl border px-4 py-2 text-sm font-semibold transition-colors ${
                active
                  ? "border-aqua bg-aqua text-navy"
                  : "border-white/15 bg-white/5 text-white hover:border-white/40"
              }`}
            >
              {v.title}
            </button>
          );
        })}
      </div>
    </div>
  );
}
