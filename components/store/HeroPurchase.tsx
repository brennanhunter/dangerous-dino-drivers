"use client";

import { usePurchase } from "./PurchaseProvider";
import { VariantPicker } from "./VariantPicker";
import { BundlePicker } from "./BundlePicker";
import { BuyButton } from "./BuyButton";

function formatPrice(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function HeroPurchase() {
  const { totalCents } = usePurchase();

  return (
    <div className="w-full">
      <p className="text-4xl font-bold text-aqua">{formatPrice(totalCents)}</p>
      <VariantPicker />
      <div className="mt-5">
        <BundlePicker />
      </div>
      <div className="mt-5">
        <BuyButton showError />
      </div>
      <p className="mt-3 text-center text-xs text-white/50">
        Apple Pay &amp; Google Pay at checkout · Secure payment by Stripe
      </p>
    </div>
  );
}
