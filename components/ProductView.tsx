"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import type { PrintifyProduct, PrintifyVariant } from "@/lib/types";

function formatPrice(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export default function ProductView({ product }: { product: PrintifyProduct }) {
  const sellable = useMemo(
    () => product.variants.filter((v) => v.is_enabled && v.is_available),
    [product.variants],
  );

  const [variant, setVariant] = useState<PrintifyVariant>(
    sellable.find((v) => v.is_default) ?? sellable[0],
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const heroImage =
    product.images.find(
      (i) => i.variant_ids.includes(variant.id) && i.is_default,
    ) ??
    product.images.find((i) => i.variant_ids.includes(variant.id)) ??
    product.images.find((i) => i.is_default) ??
    product.images[0];

  async function handleBuy() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId: variant.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Checkout failed");
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="grid w-full max-w-5xl gap-10 md:grid-cols-2 md:gap-14">
      {/* Image */}
      <div className="relative aspect-square w-full overflow-hidden rounded-3xl bg-white/5 ring-1 ring-white/10">
        {heroImage ? (
          <Image
            src={heroImage.src}
            alt={product.title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-contain"
            priority
          />
        ) : (
          <div className="flex h-full items-center justify-center text-6xl">
            🦕
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex flex-col">
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          {product.title}
        </h1>

        <p className="mt-3 text-3xl font-bold text-aqua">
          {formatPrice(variant.price)}
        </p>

        {sellable.length > 1 && (
          <div className="mt-6">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-white/60">
              Options
            </p>
            <div className="flex flex-wrap gap-2">
              {sellable.map((v) => {
                const active = v.id === variant.id;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setVariant(v)}
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
        )}

        <button
          type="button"
          onClick={handleBuy}
          disabled={loading}
          className="mt-8 w-full rounded-xl bg-purple px-8 py-4 text-xl font-bold text-white transition-colors hover:bg-blue disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Starting checkout…" : `Buy Now — ${formatPrice(variant.price)}`}
        </button>

        {error && (
          <p className="mt-3 text-sm font-medium text-red-400">{error}</p>
        )}

        <p className="mt-3 text-center text-xs text-white/40">
          Secure checkout with Stripe · Ships in 3–7 business days
        </p>

        {product.description && (
          <div
            className="mt-8 border-t border-white/10 pt-6 text-sm leading-6 text-white/70 [&_h1]:text-base [&_h1]:font-bold [&_li]:ml-4 [&_li]:list-disc"
            // Description is our own Printify product copy (trusted source).
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
        )}
      </div>
    </div>
  );
}
