# Dangerous Dino Drivers — Store Build Guide

## Stack
- **Next.js 16** (App Router, Turbopack) — note: 16, not 14; route-handler APIs differ
- **Stripe** (`stripe` v22) — payments + hosted Checkout
- **Printify API** (v1) — product + order fulfillment
- **Vercel** — deployment
- **Domain** — dangerousdinodrivers.com (already on Vercel)

---

## Step 1 — Create the Project ✅ done
Scaffolded with `create-next-app` (TypeScript, ESLint, Tailwind v4, App Router).

## Step 2 — Install Dependencies ✅ done
```bash
npm install stripe @stripe/stripe-js
```
Installed: `stripe@^22.2.0`, `@stripe/stripe-js@^9.7.0`.

---

## Step 3 — Environment Variables  ← you
Create `.env.local` in the project root (it's gitignored; `.env.example` is the committed template):

```env
# Stripe — add once the site is reachable (test keys are fine first)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Printify (Account > Connections > API)
PRINTIFY_API_KEY=...
PRINTIFY_SHOP_ID=...      # printify.com/app/shop/{SHOP_ID}
PRINTIFY_PRODUCT_ID=...   # printify.com/app/products/{PRODUCT_ID}

# App — localhost for dev, the live domain in production
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

> The app works with **only the Printify keys** set — the product page loads and
> checkout shows a clear error until the Stripe keys are added.

---

## Steps 4–8 — App Code ✅ implemented

Built against the **installed** Stripe/Printify/Next versions (not the v14-era
snippets this guide originally had). File map:

```
lib/
  types.ts                       Printify product/variant/image types
  stripe.ts                      getStripe() — lazy singleton (no apiVersion; see note)
  printify.ts                    getProduct() + createPrintifyOrder()
app/
  page.tsx                       product page (server component, ISR 1h)
  success/page.tsx               order confirmation
  api/
    product/route.ts             GET product
    checkout/route.ts            POST → Stripe Checkout session
    webhooks/stripe/route.ts     POST → verify signature, create Printify order
components/
  ProductView.tsx                client: gallery + variant picker + Buy button
next.config.ts                   images.remotePatterns for Printify CDNs
```

### Corrections vs the original v14 plan (important)
1. **Shipping address** is read from `session.collected_information.shipping_details`
   (`.name` + `.address.{line1,line2,city,state,postal_code,country}`).
   The old `session.shipping_details` **does not exist** in Stripe v22 — using it
   ships every order to `undefined`. Buyer email = `customer_details.email ?? customer_email`.
   (`customer_details.address` is *billing* — never use it for fulfillment.)
2. **No `export const config = { api: { bodyParser } }`** — that's Pages-Router only
   and is silently ignored in the App Router. Raw body comes from `await req.text()`.
3. **Webhook** pins `runtime = 'nodejs'` (for sync signature verification) and
   `dynamic = 'force-dynamic'`.
4. **Price is derived server-side** in `/api/checkout` from the Printify variant —
   the browser only sends a `variantId`, never a price (prevents $0.01 exploits).
5. **Printify prices are in cents** → used directly as Stripe `unit_amount`.
6. **`apiVersion` is omitted** on `new Stripe()` (the only type-safe literal for v22
   is `"2026-05-27.dahlia"`; omitting stays correct across upgrades).
7. **`address_to`** uses Printify's exact keys: `first_name, last_name, email, phone,
   country` (ISO alpha-2), `region` (state code; may be empty for e.g. GB), `address1,
   address2, city, zip`.

---

## Step 9 — Stripe Webhook Setup
1. Install Stripe CLI: `brew install stripe/stripe-cli/stripe`
2. Login: `stripe login`
3. Local testing: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
4. Copy the `whsec_...` it prints into `.env.local` as `STRIPE_WEBHOOK_SECRET`
   (this is a *different* secret from the dashboard one — use the CLI's for local).
5. Production: add a webhook in the Stripe dashboard → `https://dangerousdinodrivers.com/api/webhooks/stripe`,
   subscribe to `checkout.session.completed`, and put *that* signing secret in Vercel's env.

---

## Step 10 — Deploy to Vercel
```bash
git add . && git commit -m "Dangerous Dino Drivers storefront"
```
Push to GitHub, then on vercel.com: import the repo, add every `.env.local` var to
the project's Environment Variables, and assign `dangerousdinodrivers.com`.

---

## Step 11 — Test End to End
1. `npm run dev` (runs on **localhost:3000**)
2. In another tab: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
   (fulfillment only fires if this is running locally)
3. Use Stripe **test** keys (`sk_test_` / `pk_test_`) and card `4242 4242 4242 4242`, any future date/CVC
4. After payment, the order appears in Printify **"on hold"** (it is NOT charged yet)
5. ⚠️ **Printify has no sandbox** — every order is real. It auto-sends to production
   ~24h after creation (or via the send-to-production endpoint), and *that* is when
   you're charged. During testing, **cancel the on-hold order in Printify** before the
   window closes so you aren't charged for a test.
6. Swap to live keys before launch.

---

## Brand Colors
Defined as Tailwind v4 tokens in `app/globals.css` → use `bg-navy`, `text-aqua`, `bg-purple`, `bg-blue`.
```
Navy:   #111827
Purple: #7C3AED
Blue:   #1D4ED8
Aqua:   #00FFD1
```

---

## Launch Checklist
- [ ] `.env.local` filled with live keys (+ same vars in Vercel)
- [ ] Stripe production webhook configured for `checkout.session.completed`
- [ ] Test order placed, verified in Printify, then cancelled (no sandbox)
- [ ] Domain pointing to the Vercel deployment
- [ ] Social links in footer pointing to @dangerousdinodrivers
- [ ] Privacy policy + terms page (required for Stripe)
