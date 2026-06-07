import Stripe from "stripe";

// Lazy singleton so importing this module never throws — the Stripe constructor
// errors if no key is set, and we don't want that to crash routes that merely
// import it (or the whole app) before the keys exist in .env.local.
let stripeSingleton: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeSingleton) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error("STRIPE_SECRET_KEY is not set. Add it to .env.local.");
    }
    // apiVersion is intentionally omitted: stripe@22.2.0 pins the version it was
    // built against, and the only type-safe literal would be "2026-05-27.dahlia".
    // Omitting keeps it correct across SDK upgrades.
    stripeSingleton = new Stripe(key);
  }
  return stripeSingleton;
}
