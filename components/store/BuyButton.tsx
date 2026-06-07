"use client";

import { usePurchase } from "./PurchaseProvider";

function formatPrice(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function BuyButton({
  label,
  size = "lg",
  showError = false,
}: {
  label?: string;
  size?: "lg" | "md";
  showError?: boolean;
}) {
  const { buy, loading, totalCents, error } = usePurchase();

  return (
    <div>
      <button
        type="button"
        onClick={buy}
        disabled={loading}
        className={`w-full rounded-2xl bg-purple font-bold text-white shadow-lg shadow-purple/20 transition-colors hover:bg-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aqua disabled:cursor-not-allowed disabled:opacity-60 ${
          size === "lg" ? "px-8 py-4 text-xl" : "px-6 py-3.5 text-lg"
        }`}
      >
        {loading ? "Starting checkout…" : (label ?? `Buy Now — ${formatPrice(totalCents)}`)}
      </button>
      {showError && error && (
        <p className="mt-2 text-center text-sm font-medium text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
