-- ─────────────────────────────────────────────────────────────────────────────
-- Dangerous Dino Drivers — Supabase schema (SOURCE OF TRUTH)
--
-- Run in the Supabase SQL Editor. Idempotent: safe to re-run; it can also
-- recreate the database from scratch on a fresh project.
--
-- Security model: the app only touches these tables/buckets SERVER-SIDE using the
-- Supabase SECRET key (sb_secret_…), which bypasses RLS. RLS is enabled with NO
-- policies, so the public/anon key cannot read or write anything directly.
--
-- Used by:
--   subscribers  → /api/subscribe (Dino Club signups)
--   orders       → Stripe webhook (idempotent fulfillment ledger) + review cron
--   reviews      → /api/reviews (submit) + homepage (approved) + review cron link
-- Buckets:
--   review-photos → customer review photos (public)
--   assets        → brand assets, e.g. logo-email.png used in emails (public)
--
-- Note: gen_random_uuid() is provided by pgcrypto, preinstalled on Supabase.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Dino Club email signups ──────────────────────────────────────────────────
create table if not exists public.subscribers (
  id          uuid        primary key default gen_random_uuid(),
  email       text        not null unique,
  created_at  timestamptz not null default now()
);

-- ── Orders (mirror of paid Stripe orders) ────────────────────────────────────
-- stripe_session_id is UNIQUE and acts as the idempotency key: the webhook
-- inserts this row BEFORE creating the Printify order, so a Stripe retry / double
-- delivery hits a unique-violation and is skipped (never a duplicate fulfillment).
create table if not exists public.orders (
  id                      uuid        primary key default gen_random_uuid(),
  stripe_session_id       text        not null unique,
  email                   text        not null,
  name                    text,
  amount_total            integer,                 -- cents the customer paid
  quantity                integer     not null default 1,
  created_at              timestamptz not null default now(),
  review_request_sent_at  timestamptz              -- stamped by the review-request cron
);

-- ── Customer reviews (moderated) ─────────────────────────────────────────────
-- Inserted as 'pending'; only 'approved' rows are shown on the storefront.
create table if not exists public.reviews (
  id          uuid        primary key default gen_random_uuid(),
  name        text        not null,
  location    text,
  rating      integer     not null check (rating between 1 and 5),
  body        text        not null,
  photo_url   text,                                 -- public URL in the review-photos bucket
  status      text        not null default 'pending'
              check (status in ('pending', 'approved', 'rejected')),
  order_id    text,                                 -- optional Stripe session id link
  created_at  timestamptz not null default now()
);

-- ── Indexes ──────────────────────────────────────────────────────────────────
create index if not exists reviews_status_idx
  on public.reviews (status, created_at desc);          -- fetch approved, newest first
create index if not exists orders_review_request_idx
  on public.orders (review_request_sent_at, created_at); -- cron: un-asked, oldest first

-- ── Row Level Security ───────────────────────────────────────────────────────
-- Enabled with NO policies → blocks all anon/public access. Server-side code uses
-- the secret key (BYPASSRLS), so it still has full access.
alter table public.subscribers enable row level security;
alter table public.orders      enable row level security;
alter table public.reviews     enable row level security;

-- ── Storage buckets (public) ─────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values
  ('review-photos', 'review-photos', true),
  ('assets',        'assets',        true)
on conflict (id) do nothing;
