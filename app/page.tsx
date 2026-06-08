import Image from "next/image";
import type { PrintifyProduct } from "@/lib/types";
import { getProduct, toClientProduct } from "@/lib/printify";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { PurchaseProvider } from "@/components/store/PurchaseProvider";
import { HeroPurchase } from "@/components/store/HeroPurchase";
import { BuyButton } from "@/components/store/BuyButton";
import { StickyBuyBar } from "@/components/store/StickyBuyBar";
import { Faq } from "@/components/store/Faq";
import { Stars } from "@/components/store/Stars";
import { EmailCapture } from "@/components/store/EmailCapture";
import { SubscribePopup } from "@/components/store/SubscribePopup";
import { STORE, TRUST_BADGES, BENEFITS, FOUNDER } from "@/lib/content";
import { getApprovedReviews, type Review } from "@/lib/reviews";

// Cache the homepage (Printify product + approved reviews) for 1 hour, so the
// Supabase reviews read isn't hit on every request. New approvals appear within
// the window (or on the next deploy).
export const revalidate = 3600;

function SocialProofPill({ rating, count }: { rating: number; count: number }) {
  if (count > 0) {
    return (
      <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm">
        <Stars rating={rating} />
        <span className="font-semibold text-white">{rating.toFixed(1)}</span>
        <span className="text-white/50">
          · {count.toLocaleString()} happy dino{" "}
          {count === 1 ? "family" : "families"}
        </span>
      </div>
    );
  }
  // Honest cold-start signal until real reviews exist.
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-aqua/30 bg-aqua/10 px-3 py-1 text-sm font-semibold text-aqua">
      🦕 Brand-new — be one of our first dino families
    </div>
  );
}

function Hero({
  product,
  rating,
  count,
}: {
  product: PrintifyProduct;
  rating: number;
  count: number;
}) {
  const img = product.images.find((i) => i.is_default) ?? product.images[0];
  return (
    <section className="mx-auto grid max-w-5xl gap-8 px-6 py-10 md:grid-cols-2 md:items-center md:gap-12 md:py-16">
      <div className="relative order-1 aspect-square w-full overflow-hidden rounded-3xl bg-white/5 ring-1 ring-white/10 md:order-2">
        {img ? (
          <Image
            src={img.src}
            alt={product.title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-contain"
            priority
          />
        ) : (
          <div className="flex h-full items-center justify-center text-7xl">
            🦕
          </div>
        )}
      </div>

      <div className="order-2 md:order-1">
        <SocialProofPill rating={rating} count={count} />
        <h1 className="mt-4 font-display text-3xl leading-tight text-white sm:text-4xl md:text-5xl">
          Bedtime just got
          <br />
          <span className="text-aqua">dangerously fun</span>
        </h1>
        <p className="mt-4 text-lg text-white/70">
          Soft, vibrant pillowcases starring dinosaurs behind the wheel — the
          gift dino-obsessed kids actually beg for.
        </p>
        <ul className="mt-5 space-y-2 text-white/80">
          <li>✅ Silky-soft microfiber, gentle on little cheeks</li>
          <li>✅ Machine-washable — colors stay bright</li>
          <li>✅ Bold double-sided dino art kids show off</li>
        </ul>
        <div className="mt-7">
          <HeroPurchase />
        </div>
        <p className="mt-3 text-center text-xs text-white/50 md:text-left">
          🚚 {STORE.shippingNote} · ↩️ {STORE.guaranteeDays}-day money-back
          guarantee
        </p>
      </div>
    </section>
  );
}

function TrustBar() {
  return (
    <section className="border-y border-white/10 bg-white/[0.03]">
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 px-6 py-5 text-center text-sm text-white/80 sm:grid-cols-4">
        {TRUST_BADGES.map((b) => (
          <div key={b.label} className="flex flex-col items-center gap-1">
            <span className="text-2xl" aria-hidden>
              {b.icon}
            </span>
            <span>{b.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function Benefits() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-14">
      <h2 className="text-center font-display text-2xl text-white sm:text-3xl">
        Why kids (and parents) love it
      </h2>
      <div className="mt-8 grid gap-6 sm:grid-cols-3">
        {BENEFITS.map((b) => (
          <div
            key={b.title}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center"
          >
            <div className="text-4xl" aria-hidden>
              {b.icon}
            </div>
            <h3 className="mt-3 font-display text-lg text-aqua">{b.title}</h3>
            <p className="mt-2 text-sm leading-6 text-white/70">{b.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Gallery({ product }: { product: PrintifyProduct }) {
  const imgs = product.images.slice(0, 2);
  return (
    <section className="mx-auto max-w-5xl px-6 py-2">
      <div className="grid gap-4 sm:grid-cols-3">
        {imgs.map((im, i) => (
          <div
            key={im.src}
            className="relative aspect-square overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/10"
          >
            <Image
              src={im.src}
              alt={`${product.title} view ${i + 1}`}
              fill
              sizes="(max-width: 640px) 100vw, 33vw"
              className="object-contain"
            />
          </div>
        ))}
        {/* PLACEHOLDER: swap for a real lifestyle photo (kid holding the pillow / on a bed). */}
        <div className="flex aspect-square items-center justify-center rounded-2xl border-2 border-dashed border-white/15 bg-white/[0.02] p-4 text-center text-sm text-white/50">
          📸 Add a real lifestyle photo here
        </div>
      </div>
    </section>
  );
}

function FounderStory() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-14">
      <div className="grid items-center gap-8 md:grid-cols-[1fr_1.4fr]">
        {/* PLACEHOLDER: swap for a real founder/kid photo — faces build huge trust. */}
        <div className="flex aspect-square items-center justify-center rounded-3xl border-2 border-dashed border-white/15 bg-white/[0.02] p-4 text-center text-sm text-white/50">
          📸 Add a founder photo (you + your kid)
        </div>
        <div>
          <h2 className="font-display text-2xl text-white sm:text-3xl">
            {FOUNDER.heading}
          </h2>
          <p className="mt-4 leading-7 text-white/70">{FOUNDER.body}</p>
          <p className="mt-4 font-semibold text-aqua">{FOUNDER.signature}</p>
        </div>
      </div>
    </section>
  );
}

function Reviews({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) return null;
  return (
    <section className="mx-auto max-w-5xl px-6 py-14">
      <h2 className="text-center font-display text-2xl text-white sm:text-3xl">
        What dino families are saying
      </h2>
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {reviews.map((r) => (
          <figure
            key={r.id}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
          >
            <Stars rating={r.rating} />
            {r.photo_url && (
              <div className="relative mt-3 h-40 w-full overflow-hidden rounded-xl bg-white/5">
                <Image
                  src={r.photo_url}
                  alt={`Photo from ${r.name}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                />
              </div>
            )}
            <blockquote className="mt-3 text-sm leading-6 text-white/80">
              “{r.body}”
            </blockquote>
            <figcaption className="mt-4 text-sm font-semibold text-white">
              {r.name}
              {r.location && (
                <span className="font-normal text-white/50"> · {r.location}</span>
              )}
            </figcaption>
          </figure>
        ))}
      </div>
      <p className="mt-6 text-center text-sm">
        <a href="/review" className="text-aqua hover:underline">
          Bought one? Leave a review →
        </a>
      </p>
    </section>
  );
}

function Guarantee() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-12">
      <div className="rounded-3xl border border-aqua/20 bg-aqua/5 p-8 text-center">
        <div className="text-5xl" aria-hidden>
          🛡️
        </div>
        <h2 className="mt-4 font-display text-2xl text-white">
          The 100% Happy Kid Guarantee
        </h2>
        <p className="mt-3 text-white/70">
          If your little one isn’t obsessed, we’ll make it right or refund every
          penny within {STORE.guaranteeDays} days. Buying for a tiny human should
          be risk-free.
        </p>
      </div>
    </section>
  );
}

function FaqSection() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-14">
      <h2 className="text-center font-display text-2xl text-white sm:text-3xl">
        Questions, answered
      </h2>
      <div className="mt-8">
        <Faq />
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-16 text-center">
      <h2 className="font-display text-3xl text-white sm:text-4xl">
        Make bedtime their favorite part of the day
      </h2>
      <p className="mt-4 text-white/70">One soft, roar-worthy pillowcase away.</p>
      <div className="mx-auto mt-7 max-w-sm">
        <BuyButton />
      </div>
    </section>
  );
}

function SetupNotice({ message }: { message: string }) {
  return (
    <div className="flex flex-1 flex-col bg-navy">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <div className="text-6xl">🦕</div>
        <h1 className="mt-4 font-display text-2xl text-white">Almost there</h1>
        <p className="mt-2 max-w-md text-white/60">{message}</p>
      </main>
      <SiteFooter />
    </div>
  );
}

export default async function Home() {
  let product: PrintifyProduct;
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

  const { reviews, count, avgRating } = await getApprovedReviews();

  return (
    <PurchaseProvider product={toClientProduct(product)}>
      <div className="flex flex-1 flex-col bg-navy pb-24 lg:pb-0">
        <SiteHeader />
        <main className="flex-1">
          <Hero product={product} rating={avgRating} count={count} />
          <TrustBar />
          <Benefits />
          <Gallery product={product} />
          <FounderStory />
          <Guarantee />
          <Reviews reviews={reviews} />
          <FaqSection />
          <EmailCapture />
          <FinalCta />
        </main>
        <SiteFooter />
      </div>
      <StickyBuyBar />
      <SubscribePopup />
    </PurchaseProvider>
  );
}
