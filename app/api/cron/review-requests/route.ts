import { type NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { sendEmail } from "@/lib/resend";
import { reviewRequestEmail } from "@/lib/emails";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DAYS_AFTER_ORDER = 12; // wait until the order has likely been delivered
const BATCH = 50; // safety cap per run

export async function GET(req: NextRequest) {
  // Vercel Cron sends "Authorization: Bearer <CRON_SECRET>" when CRON_SECRET is
  // set on the project. Reject anything that doesn't match so the endpoint can't
  // be triggered by random visitors.
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, {
      status: 503,
    });
  }

  const cutoff = new Date(
    Date.now() - DAYS_AFTER_ORDER * 24 * 60 * 60 * 1000,
  ).toISOString();

  // Orders older than the cutoff that haven't been asked yet.
  const { data: orders, error } = await supabase
    .from("orders")
    .select("id, stripe_session_id, email, name")
    .is("review_request_sent_at", null)
    .lt("created_at", cutoff)
    .limit(BATCH);

  if (error) {
    console.error("cron review-requests: query failed", error);
    return NextResponse.json({ error: "query failed" }, { status: 500 });
  }
  if (!orders || orders.length === 0) {
    return NextResponse.json({ ok: true, processed: 0, sent: 0 });
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ?? "https://dangerousdinodrivers.com";

  let sent = 0;
  for (const o of orders) {
    const firstName = o.name
      ? String(o.name).trim().split(/\s+/)[0]
      : undefined;
    const reviewUrl = `${baseUrl}/review?order=${encodeURIComponent(o.stripe_session_id)}`;
    const { subject, html } = reviewRequestEmail({ firstName, reviewUrl });
    const res = await sendEmail({ to: o.email, subject, html });
    if (res.sent) {
      // Stamp only on a successful send, so a transient email outage retries next
      // run instead of silently skipping the customer forever.
      await supabase
        .from("orders")
        .update({ review_request_sent_at: new Date().toISOString() })
        .eq("id", o.id);
      sent++;
    } else {
      console.error(`cron review-requests: email failed for order ${o.id}`);
    }
  }

  return NextResponse.json({ ok: true, processed: orders.length, sent });
}
