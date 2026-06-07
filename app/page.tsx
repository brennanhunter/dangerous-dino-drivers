import ProductView from "@/components/ProductView";
import { getProduct } from "@/lib/printify";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col bg-navy">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <span className="text-lg font-extrabold tracking-tight text-aqua">
            DANGEROUS DINO DRIVERS
          </span>
          <span className="hidden text-sm font-medium text-white/50 sm:block">
            Dinos behind the wheel 🦕🏎️
          </span>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center px-6 py-12 sm:py-16">
        {children}
      </main>
      <footer className="border-t border-white/10">
        <div className="mx-auto max-w-5xl px-6 py-6 text-center text-xs text-white/40">
          © Dangerous Dino Drivers · @dangerousdinodrivers
        </div>
      </footer>
    </div>
  );
}

function SetupNotice({ message }: { message: string }) {
  return (
    <Shell>
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <div className="text-6xl">🦕</div>
        <h1 className="mt-4 text-2xl font-bold text-white">Almost there</h1>
        <p className="mt-2 max-w-md text-white/60">{message}</p>
      </div>
    </Shell>
  );
}

export default async function Home() {
  let product;
  try {
    product = await getProduct();
  } catch {
    return (
      <SetupNotice message="Add your Printify keys (PRINTIFY_API_KEY, PRINTIFY_SHOP_ID, PRINTIFY_PRODUCT_ID) to .env.local to load the product." />
    );
  }

  const hasSellable = product.variants.some(
    (v) => v.is_enabled && v.is_available,
  );
  if (!hasSellable) {
    return (
      <SetupNotice message="This product has no enabled, in-stock variants yet. Enable at least one variant in the Printify dashboard." />
    );
  }

  return (
    <Shell>
      <ProductView product={product} />
    </Shell>
  );
}
