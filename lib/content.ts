// Central copy + content for the landing page. Edit here — not in the JSX.
// Items marked PLACEHOLDER must be replaced with real content before launch.

export const STORE = {
  contactEmail: "dangerousdinodrivers@gmail.com",
  phone: "386-610-3000",
  social: "@dangerousdinodrivers",
  shippingNote: "Free shipping · arrives in 5–10 days",
  guaranteeDays: 30,
};

// YOUR selling price for one pillowcase, in cents. THIS is what the store charges.
// Printify's price field is ignored — Printify is purely your supplier (cost +
// fulfillment). Change your price here, then redeploy.
export const PRODUCT_PRICE_CENTS = 3499; // $34.99

// Shipping tiers shown at checkout. Standard is free (you absorb Printify's
// standard cost); express is a flat fee the customer pays that covers Printify's
// expedited rate (priority ≈ $28.99 flat for this product). printifyMethod maps
// to Printify shipping_method: 1=standard, 2=priority, 3=express.
export type ShippingOption = {
  key: string;
  label: string;
  amountCents: number;
  printifyMethod: number;
  minDays: number;
  maxDays: number;
};

export const SHIPPING_OPTIONS: ShippingOption[] = [
  {
    key: "standard",
    label: "Free Shipping",
    amountCents: 0,
    printifyMethod: 1,
    minDays: 5,
    maxDays: 10,
  },
  {
    key: "express",
    label: "Express Shipping",
    amountCents: 2999,
    printifyMethod: 2,
    minDays: 2,
    maxDays: 5,
  },
];

export const TRUST_BADGES = [
  { icon: "🚚", label: "Free shipping" },
  { icon: "↩️", label: "30-day returns" },
  { icon: "🧺", label: "Machine washable" },
  { icon: "🔒", label: "Secure checkout" },
];

export const BENEFITS = [
  {
    icon: "🛋️",
    title: "Ridiculously Soft",
    text: "Silky-soft microfiber that’s gentle on little cheeks and made for cuddles.",
  },
  {
    icon: "🧺",
    title: "Survives Real Kids",
    text: "Machine-washable and fade-resistant — the colors stay bold wash after wash.",
  },
  {
    icon: "🦖",
    title: "Designs Kids Show Off",
    text: "Bold, double-sided dino art so good your kid gives you the bedroom tour.",
  },
];

export const FAQS = [
  {
    q: "How long does shipping take?",
    a: "Shipping is free. Each pillowcase is made to order, then arrives within 5–10 business days — you’ll get tracking by email as soon as it’s on the way.",
  },
  {
    q: "How do I wash it?",
    a: "Machine wash cold (gentle cycle, mild detergent) and tumble dry low. The print is fade-resistant, so the colors stay bright wash after wash.",
  },
  {
    q: "What’s it made of?",
    a: "Silky-soft microfiber — 100% polyester with quick-dry, split fibers. The dino is printed all over on both sides, and a reinforced 3.25\" hemmed cuff keeps the edges crisp. Lightweight, gentle on skin, and holds its bright colors wash after wash.",
  },
  {
    q: "What size is it?",
    a: "Two sizes: 20\" × 30\" (fits standard/queen pillows) and 20\" × 40\" (fits king pillows). It’s the pillowcase only — pillow insert not included.",
  },
  {
    q: "What’s your return policy?",
    a: "If your kid isn’t obsessed, reach out within 30 days and we’ll make it right or refund you. No drama.",
  },
  {
    q: "Is checkout secure?",
    a: "Yes. Payments are handled by Stripe with bank-level encryption, and Apple Pay & Google Pay are available. We never see your card details.",
  },
];

// Bundle offers. Multi-packs are a % off PRODUCT_PRICE_CENTS (your configured
// price), so they always track it. Shipping is free, so buying more is cheaper
// per item at no extra delivery cost.
export type Bundle = {
  qty: number;
  label: string;
  discountPct: number; // % off the live per-unit price (0 = single, full price)
  badge: string | null;
};

export const BUNDLES: Bundle[] = [
  { qty: 1, label: "Single", discountPct: 0, badge: null },
  { qty: 2, label: "2-Pack", discountPct: 10, badge: "Most popular" },
  { qty: 3, label: "3-Pack", discountPct: 15, badge: "Best value" },
];

// Bundle total derived from the live single-unit price. Multi-packs round to a
// clean .99. Server and client both use this so the displayed and charged
// prices always match.
export function bundleTotalCents(bundle: Bundle, unitCents: number): number {
  if (!Number.isFinite(unitCents) || unitCents < 0) return 0;
  if (bundle.qty <= 1 || bundle.discountPct <= 0) return unitCents * bundle.qty;
  const raw = unitCents * bundle.qty * (1 - bundle.discountPct / 100);
  return Math.max(Math.round(raw / 100) * 100 - 1, 0);
}

export const FOUNDER = {
  heading: "Made by a dad, for dino kids",
  body: "Dangerous Dino Drivers started on a living-room floor in DeLand, Florida — a dad and a dinosaur-obsessed kid who figured every triceratops deserves a monster truck. We couldn’t find pillowcases that were actually fun, so we made our own: soft enough for real bedtimes, bold enough that kids show them off. Every order is printed and shipped from the US, and a real human answers your emails.",
  signature: "— The Dangerous Dino Drivers family",
};
