import { type NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (typeof email !== "string" || !EMAIL_RE.test(email.trim())) {
      return NextResponse.json(
        { error: "Please enter a valid email." },
        { status: 400 },
      );
    }

    // INTEGRATION POINT: connect your email service provider here.
    // Recommended: Klaviyo (best ecom welcome + abandoned-checkout flows).
    // Until an ESP is wired, signups are only logged server-side and are NOT
    // persisted anywhere — don't rely on this list until you connect a provider.
    //   e.g. if (process.env.KLAVIYO_API_KEY) await subscribeToKlaviyo(email.trim());
    const stored = false;
    console.log(`[subscribe] ${email.trim()} (stored=${stored})`);

    return NextResponse.json({ ok: true, stored });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
