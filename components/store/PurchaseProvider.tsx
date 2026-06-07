"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { PrintifyProduct, PrintifyVariant } from "@/lib/types";

type PurchaseContextValue = {
  product: PrintifyProduct;
  sellable: PrintifyVariant[];
  variant: PrintifyVariant;
  setVariant: (v: PrintifyVariant) => void;
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function buy() {
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
      setLoading(false); // keep loading=true on success so the button stays disabled through redirect
    }
  }

  return (
    <PurchaseContext.Provider
      value={{ product, sellable, variant, setVariant, buy, loading, error }}
    >
      {children}
    </PurchaseContext.Provider>
  );
}
