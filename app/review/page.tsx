import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { ReviewForm } from "@/components/store/ReviewForm";

export const metadata: Metadata = {
  title: "Leave a Review",
  robots: { index: false },
};

export default async function ReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;
  return (
    <div className="flex flex-1 flex-col bg-navy">
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-12">
        <h1 className="font-display text-3xl text-white sm:text-4xl">
          Leave a review
        </h1>
        <p className="mt-2 text-white/60">
          Tell other dino families what you think — it takes 30 seconds, and a
          photo makes our day.
        </p>
        <div className="mt-8">
          <ReviewForm orderId={order} />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
