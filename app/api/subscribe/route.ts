import { type NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { sendEmail } from "@/lib/resend";
import { welcomeEmail } from "@/lib/emails";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    const clean = typeof email === "string" ? email.trim().toLowerCase() : "";
    if (!EMAIL_RE.test(clean)) {
      return NextResponse.json(
        { error: "Please enter a valid email." },
        { status: 400 },
      );
    }

    const supabase = getSupabase();
    let isNew = true;
    if (supabase) {
      const { error } = await supabase
        .from("subscribers")
        .insert({ email: clean });
      if (error) {
        if (error.code === "23505") {
          isNew = false; // already subscribed — that's fine, just don't re-welcome
        } else {
          // Transient DB error: log, but don't break the UX over it.
          console.error("subscriber insert failed", error);
        }
      }
    }

    // Welcome email only on a genuinely new signup (best-effort inside sendEmail).
    if (isNew) {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? req.nextUrl.origin;
      const { subject, html } = welcomeEmail({ shopUrl: baseUrl });
      await sendEmail({ to: clean, subject, html });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
