import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Order Confirmed",
  robots: { index: false, follow: false },
};

export default function SuccessPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-navy px-6 text-center">
      <div className="text-6xl">🦕</div>
      <h1 className="mt-4 font-display text-4xl text-white">
        Order Confirmed!
      </h1>
      <p className="mt-3 text-xl text-aqua">
        Your Dangerous Dino Driver is on the way.
      </p>
      <p className="mt-4 max-w-md text-white/60">
        We&apos;ll email you a shipping confirmation with tracking once it
        leaves the workshop.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-xl bg-purple px-6 py-3 font-bold text-white transition-colors hover:bg-blue"
      >
        Back to the store
      </Link>
    </div>
  );
}
