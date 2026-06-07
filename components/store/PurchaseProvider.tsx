"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { PrintifyProduct, PrintifyVariant } from "@/lib/types";
import {
  BUNDLES,
  bundleTotalCents,
  PRODUCT_PRICE_CENTS,
  type Bundle,
} from "@/lib/content";
import { trackInitiateCheckout, trackViewContent } from "@/lib/tiktok";

type PurchaseContextValue = {
  product: PrintifyProduct;
  sellable: PrintifyVariant[];
  variant: PrintifyVariant;
  setVariant: (v: PrintifyVariant) => void;
  bundles: Bundle[];
  bundle: Bundle;
  setBundle: (b: Bundle) => void;
  unitPriceCents: number; // live single-unit price
  totalCents: number; // total for the selected bundle
  buy: () => Promise<void>;
  loading: boolean;
  error: string | null;
};

const PurchaseContext = createContext<PurchaseContextValue | null>(null);

export function usePurchase() {
  const ctx = useContext(PurchaseContext);
  if (!ctx) {
    throw new Error("usePurchase must be used within a PurchaseProvider");
  }
  return ctx;
}

export function PurchaseProvider({
  product,
  children,
}: {
  product: PrintifyProduct;
  children: ReactNode;
}) {
  const sellable = useMemo(
    () => product.variants.filter((v) => v.is_enabled && v.is_available),
    [product.variants],
  );
  const [variant, setVariant] = useState<PrintifyVariant>(
    sellable.find((v) => v.is_default) ?? sellable[0],
  );
  const [bundle, setBundle] = useState<Bundle>(BUNDLES[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const unitPriceCents = PRODUCT_PRICE_CENTS;
  const totalCents = bundleTotalCents(bundle, unitPriceCents);

  useEffect(() => {
    trackViewContent({
      contentId: String(product.id),
      valueCents: PRODUCT_PRICE_CENTS,
      contentName: product.title,
    });
    // Fire once when the product page mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function buy() {
    setLoading(true);
    setError(null);
    try {
      trackInitiateCheckout({
        contentId: String(product.id),
        valueCents: totalCents,
        quantity: bundle.qty,
      });
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId: variant.id, qty: bundle.qty }),
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
    <PurchaseContext.Provider
      value={{
        product,
        sellable,
        variant,
        setVariant,
        bundles: BUNDLES,
        bundle,
        setBundle,
        unitPriceCents,
        totalCents,
        buy,
        loading,
        error,
      }}
    >
      {children}
    </PurchaseContext.Provider>
  );
}
