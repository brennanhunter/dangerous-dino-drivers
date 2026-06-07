"use client";

import Image from "next/image";
import { usePurchase } from "./PurchaseProvider";

function formatPrice(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

// Always-visible buy bar on mobile (hidden on lg+, where the inline CTAs suffice).
export function StickyBuyBar() {
  const { product, variant, buy, loading } = usePurchase();
  const img =
    product.images.find((i) => i.variant_ids.includes(variant.id) && i.is_default) ??
    product.images.find((i) => i.is_default) ??
    product.images[0];

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-navy/95 backdrop-blur lg:hidden">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
        {img && (
          <Image
            src={img.src}
            alt=""
            width={48}
            height={48}
            className="h-12 w-12 rounded-lg bg-white/5 object-contain"
          />
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white">
            {product.title}
          </p>
          <p className="text-sm font-bold text-aqua">{formatPrice(variant.price)}</p>
        </div>
        <button
          type="button"
          onClick={buy}
          disabled={loading}
          className="shrink-0 rounded-xl bg-purple px-6 py-3 font-bold text-white transition-colors hover:bg-blue disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "…" : "Buy"}
        </button>
      </div>
    </div>
  );
}
