# Emails & Reviews — Build Roadmap (Resend + Supabase)

We'll work through this together, one phase at a time. **Phase 0 is yours** (provision
accounts). Phases 1–5 are mine (build). Everything is written to be **graceful when
keys are missing** — the store keeps working; emails/DB just no-op until configured.

> **Status:** ✅ Phase 0 · ✅ Phase 1 · ✅ Phase 2 · ✅ Phase 3 · ✅ Phase 4 (audited) · ✅ Phase 5 —
> all built and verified locally against live Supabase + Resend. Remaining: **Phase 6** —
> deploy to Vercel (add env incl. `CRON_SECRET` + `NEXT_PUBLIC_BASE_URL`, set the production
> Stripe webhook) and run one Stripe **test** purchase to confirm the full live flow.

## Architecture
- **Resend** → sends emails: order confirmation, Dino Club welcome, review request.
- **Supabase (Postgres)** → stores: `subscribers`, `orders`, `reviews`.
- **Printify** → still sends the shipping/tracking email (unchanged).
- All DB/email access is **server-side only** (service-role key never hits the browser).

```
Customer pays ─▶ Stripe webhook ─▶ Printify order (fulfillment)
                                 ├▶ Supabase: insert order
                                 └▶ Resend: order confirmation email
~12 days later ─▶ Vercel cron ─▶ Resend: review request ─▶ /review form ─▶ Supabase: review (pending)
                                                                   you approve ─▶ shows on site
Dino Club form ─▶ Supabase: subscriber ─▶ Resend: welcome email
```

---

## Phase 0 — You provision (do these first) 🔴

### Supabase
- [x] Create a project at supabase.com ✅
- [x] SQL Editor → run the **schema below** — orders / reviews / subscribers created ✅
- [ ] (Optional, for review photos) Storage → create a **public** bucket named `review-photos`
- [ ] Settings → **API Keys** → copy the **Project URL** and a **Secret key** (`sb_secret_…`).
      This is Supabase's new key format (replaces the legacy `service_role` JWT, which still
      works but is deprecated end-2026). We only need the secret key — the publishable key
      isn't used, since all DB access is server-side.

### Resend
- [x] Create an account at resend.com ✅
- [x] Domains → **dangerousdinodrivers.com** → DKIM + SPF **Verified** ✅
      (The "Enable Receiving" MX showing *Pending* is for *inbound* email — we only send,
      so you can ignore it. Customer replies route to your Gmail via reply-to.)
- [ ] API Keys → create one
- [ ] From-address: `Dangerous Dino Drivers <hello@dangerousdinodrivers.com>`
      (emails set reply-to → dangerousdinodrivers@gmail.com so replies reach you)

### Env vars (add to `.env.local` and Vercel)
```env
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SECRET_KEY=              # sb_secret_… — secret, server only (bypasses RLS)
RESEND_API_KEY=
RESEND_FROM=Dangerous Dino Drivers <hello@dangerousdinodrivers.com>
CRON_SECRET=                      # any long random string; protects the cron route
```

### Supabase schema — run this in the SQL Editor
> **Source of truth: [`supabase/schema.sql`](supabase/schema.sql)** — run that file. The block below is kept for reference only.
```sql
-- Dangerous Dino Drivers schema

create table if not exists subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  created_at timestamptz not null default now()
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  stripe_session_id text unique not null,
  email text not null,
  name text,
  amount_total integer,          -- cents the customer paid
  quantity integer not null default 1,
  created_at timestamptz not null default now(),
  review_request_sent_at timestamptz
);

create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location text,
  rating integer not null check (rating between 1 and 5),
  body text not null,
  photo_url text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  order_id text,                 -- stripe session id (optional link)
  created_at timestamptz not null default now()
);

create index if not exists reviews_status_idx on reviews (status, created_at desc);
create index if not exists orders_review_request_idx on orders (review_request_sent_at, created_at);

-- Lock down direct API access: we only read/write server-side with the secret key
-- (sb_secret_…, which bypasses RLS). Enabling RLS with no policies blocks public/anon access.
alter table subscribers enable row level security;
alter table orders enable row level security;
alter table reviews enable row level security;
```

**When Phase 0 is done, ping me and I'll start Phase 1.**

---

## Phase 1 — Foundation (me)
- [ ] `npm install resend @supabase/supabase-js`
- [ ] `lib/supabase.ts` — lazy server client (service role)
- [ ] `lib/resend.ts` — lazy client + `sendEmail()` helper (no-op + log if unconfigured)
- [ ] `lib/emails.ts` — the 3 templates (branded HTML, copy below)

## Phase 2 — Order confirmation email (me)
- [ ] Webhook: after the Printify order, insert the order into Supabase + send the
      confirmation email. **Best-effort** (a DB/email failure must NOT 500 the webhook,
      or Stripe retries and Printify gets a duplicate order).

## Phase 3 — Dino Club welcome + storage (me)
- [ ] `/api/subscribe`: upsert the email into `subscribers` + send the welcome email
      (replaces the current log-only stub).

## Phase 4 — Review system (me)
- [ ] `/api/reviews` (POST) — validate + insert a review as `pending`
- [ ] `/review` page + `ReviewForm` component (name, location, rating, text, optional photo)
- [ ] (4b, optional) photo upload to the `review-photos` Supabase bucket
- [ ] Homepage: fetch **approved** reviews server-side, render them, and compute the
      real star rating + count (replaces the static placeholder data)
- [ ] You moderate by flipping `status` to `approved` in the Supabase table editor

## Phase 5 — Auto review-request (me)
- [ ] `app/api/cron/review-requests/route.ts` — finds orders older than ~12 days with no
      request sent, emails them a `/review?order=…` link, stamps `review_request_sent_at`
- [ ] `vercel.json` cron (daily), guarded by `CRON_SECRET`

## Phase 6 — Test & ship (together)
- [ ] Welcome email: submit the Dino Club form → check inbox + `subscribers` row
- [ ] Order confirmation: run a Stripe **test** purchase → check inbox + `orders` row
- [ ] Review: submit via `/review` → approve in Supabase → confirm it shows on the site
- [ ] Cron: trigger once manually → confirm a review-request email sends

---

## Email drafts (review/tweak the wording now)

### 1. Order confirmation
**Subject:** Your Dangerous Dino Drivers order is in! 🦕
> Hey {firstName}, your order's confirmed and the dinos are gearing up! 🦖
>
> **{quantity} × Triceratops Dump Truck Pillowcase — {total}**
>
> It's made to order and ships **free** in 5–10 business days. You'll get a tracking
> email the moment it's on the way.
>
> Questions? Just reply, or reach us at dangerousdinodrivers@gmail.com / 386-610-3000.
>
> — The Dangerous Dino Drivers family

### 2. Dino Club welcome
**Subject:** You're in the Dino Club 🦖
> Welcome to the pack! You'll be first to hear about new designs, restocks, and
> launch-day deals. No spam — just dinos.
>
> [Shop the pillowcase →]
>
> — The Dangerous Dino Drivers family

### 3. Review request (sent ~12 days after order)
**Subject:** How's the dino treating the little one? 🦕
> Hey {firstName}, by now your Dangerous Dino Driver should've landed — we hope it's
> already a bedtime favorite.
>
> Would you share a quick review? **A photo of your kid with it makes our whole day**
> (and helps other dino families decide). Takes about 30 seconds:
>
> [Leave a review →]
>
> Thank you for being one of our first customers — it genuinely means the world.
>
> — The Dangerous Dino Drivers family

---

## Notes
- Printify already sends the **shipping/tracking** email, so we don't rebuild that.
- Review photos (UGC) convert best and double as TikTok ad material — the request email
  asks for one.
- Incentivizing reviews (e.g. a discount) requires an FTC disclosure — these drafts keep
  it a plain, no-strings ask, which is the safe default.
