import { Resend } from "resend";

// Lazy Resend client. Returns null when unconfigured so callers no-op gracefully.
let resend: Resend | null = null;

function getResend(): Resend | null {
  if (resend) return resend;
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  resend = new Resend(key);
  return resend;
}

const FROM =
  process.env.RESEND_FROM ??
  "Dangerous Dino Drivers <hello@dangerousdinodrivers.com>";
// Replies go to the real inbox (the sending domain isn't set up for receiving).
const REPLY_TO = "dangerousdinodrivers@gmail.com";

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ sent: boolean }> {
  const client = getResend();
  if (!client) {
    console.log(
      `[email] not configured — would send "${opts.subject}" to ${opts.to}`,
    );
    return { sent: false };
  }
  try {
    const { error } = await client.emails.send({
      from: FROM,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      replyTo: REPLY_TO,
    });
    if (error) {
      console.error("[email] send failed", error);
      return { sent: false };
    }
    return { sent: true };
  } catch (err) {
    console.error("[email] send threw", err);
    return { sent: false };
  }
}
