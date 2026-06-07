// Central copy + content for the landing page. Edit here — not in the JSX.
// Items marked PLACEHOLDER must be replaced with real content before launch.

export const STORE = {
  // PLACEHOLDER — set a real inbox you monitor (trust signal + Stripe requirement).
  contactEmail: "hello@dangerousdinodrivers.com",
  social: "@dangerousdinodrivers",
  shippingNote: "Ships in 3–7 business days",
  guaranteeDays: 30,
};

// PLACEHOLDER social proof. Leave count at 0 until you have REAL reviews — the
// hero shows an honest "brand-new" badge while count is 0, and switches to a
// star rating once count > 0. Never display fabricated numbers (FTC 16 CFR 465).
export const SOCIAL_PROOF = { rating: 4.9, count: 0 };

export const TRUST_BADGES = [
  { icon: "🚚", label: "Ships in 3–7 days" },
  { icon: "↩️", label: "30-day returns" },
  { icon: "🧺", label: "Machine washable" },
  { icon: "🔒", label: "Secure checkout" },
];

export const BENEFITS = [
  {
    icon: "🛋️",
    title: "Ridiculously Soft",
    text: "Brushed, cozy fabric that’s gentle on little cheeks and built for cuddles.",
  },
  {
    icon: "🧺",
    title: "Survives Real Kids",
    text: "Machine-washable and fade-resistant — the colors stay bold wash after wash.",
  },
  {
    icon: "🦖",
    title: "Designs Kids Show Off",
    text: "Original dino-driver art so good your kid will give you the bedroom tour.",
  },
];

// PLACEHOLDER reviews — REPLACE with real customer reviews before launch.
// Publishing fabricated reviews violates the FTC's rule on fake reviews
// (16 CFR Part 465). These exist only to design the section.
export const REVIEWS = [
  {
    name: "Sample Reviewer",
    location: "Austin, TX",
    rating: 5,
    text: "My son refuses to sleep without it now. The print is vivid and it’s held up to a dozen washes already.",
  },
  {
    name: "Sample Reviewer",
    location: "Columbus, OH",
    rating: 5,
    text: "Bought it as a birthday gift and it stole the show. Super soft and the dino is hilarious.",
  },
  {
    name: "Sample Reviewer",
    location: "San Jose, CA",
    rating: 5,
    text: "Exactly like the photos, shipped fast, and my daughter is obsessed. Already ordering another.",
  },
];

export const FAQS = [
  {
    q: "How long does shipping take?",
    a: "Each pillowcase is made to order, then ships and typically arrives within 3–7 business days. You’ll get tracking by email as soon as it’s on the way.",
  },
  {
    q: "How do I wash it?",
    a: "Machine wash cold and tumble dry low. The print is fade-resistant, so the colors stay bold wash after wash.",
  },
  {
    q: "What size is it?",
    a: "Standard 20\" × 30\", which fits standard and queen pillows. It’s the pillowcase only — pillow insert not included.",
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
