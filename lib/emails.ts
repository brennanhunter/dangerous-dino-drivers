// Branded transactional email templates. Each returns { subject, html }.
// Plain inline-styled HTML for maximum email-client compatibility.

const BRAND = {
  navy: "#111827",
  aqua: "#00ffd1",
  purple: "#7c3aed",
};

// Email-optimized logo hosted on Supabase public storage (emails need an absolute
// URL; local /public paths don't resolve in a recipient's inbox).
const LOGO_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/assets/logo-email.png`
  : "";

function escapeHtml(s: string): string {
  return s.replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[c] ?? c,
  );
}

function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

function button(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;background:${BRAND.purple};color:#ffffff;text-decoration:none;font-weight:700;padding:12px 22px;border-radius:12px;">${label}</a>`;
}

function layout(bodyHtml: string): string {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:#0b1220;font-family:Helvetica,Arial,sans-serif;">
  <div style="max-width:520px;margin:0 auto;padding:24px;">
    <div style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #1f2937;">
      <div style="background:${BRAND.navy};padding:20px 24px;text-align:center;">
        ${
          LOGO_URL
            ? `<img src="${LOGO_URL}" alt="Dangerous Dino Drivers" width="220" style="width:220px;max-width:80%;height:auto;display:block;margin:0 auto;border:0;">`
            : `<span style="color:${BRAND.aqua};font-size:18px;font-weight:800;letter-spacing:.5px;">DANGEROUS DINO DRIVERS</span>`
        }
      </div>
      <div style="padding:24px;font-size:15px;line-height:1.6;color:#1f2937;">${bodyHtml}</div>
    </div>
    <p style="text-align:center;color:#9ca3af;font-size:12px;margin-top:16px;">Dangerous Dino Drivers · DeLand, FL · @dangerousdinodrivers</p>
  </div>
</body></html>`;
}

export function orderConfirmationEmail(p: {
  firstName?: string;
  quantity: number;
  itemName: string;
  totalCents: number;
}): { subject: string; html: string } {
  const hi = p.firstName ? `Hey ${escapeHtml(p.firstName)},` : "Hey there,";
  return {
    subject: "Your Dangerous Dino Drivers order is in! 🦕",
    html: layout(`
      <p>${hi} your order's confirmed and the dinos are gearing up! 🦖</p>
      <p style="background:#f3f4f6;border-radius:12px;padding:14px 16px;font-weight:700;margin:16px 0;">
        ${p.quantity} × ${escapeHtml(p.itemName)} — ${formatPrice(p.totalCents)}
      </p>
      <p>It's made to order and ships <strong>free</strong> in 5–10 business days. You'll get a tracking email the moment it's on the way.</p>
      <p>Questions? Just reply, or reach us at dangerousdinodrivers@gmail.com / 386-610-3000.</p>
      <p>— The Dangerous Dino Drivers family</p>
    `),
  };
}

export function welcomeEmail(p: { shopUrl: string }): {
  subject: string;
  html: string;
} {
  return {
    subject: "You're in the Dino Club 🦖",
    html: layout(`
      <p>Welcome to the pack! 🦕</p>
      <p>You're on the list for what's next — more <strong>dino drivers</strong>, plus <strong>sheets &amp; blankets</strong> coming soon — and first dibs on launch-day deals. No spam, just dinos.</p>
      <p style="margin:20px 0;">${button(p.shopUrl, "Shop the pillowcase")}</p>
      <p>— The Dangerous Dino Drivers family</p>
    `),
  };
}

// Internal alert to the merchant (you) on every paid order.
export function merchantSaleEmail(p: {
  itemName: string;
  quantity: number;
  totalCents: number;
  customerName: string;
  customerEmail: string;
  city: string | null;
  state: string | null;
}): { subject: string; html: string } {
  const place = [p.city, p.state].filter(Boolean).join(", ");
  return {
    subject: `🦕 New order — ${formatPrice(p.totalCents)} (${p.customerName})`,
    html: layout(`
      <p style="font-size:18px;font-weight:700;">You made a sale! 🎉</p>
      <p style="background:#f3f4f6;border-radius:12px;padding:14px 16px;font-weight:700;margin:16px 0;">
        ${p.quantity} × ${escapeHtml(p.itemName)} — ${formatPrice(p.totalCents)}
      </p>
      <p>
        <strong>Customer:</strong> ${escapeHtml(p.customerName)}<br>
        <strong>Email:</strong> ${escapeHtml(p.customerEmail)}<br>
        ${place ? `<strong>Ships to:</strong> ${escapeHtml(place)}` : ""}
      </p>
      <p>The Printify order was placed automatically — check Printify to confirm production.</p>
    `),
  };
}

export function reviewRequestEmail(p: {
  firstName?: string;
  reviewUrl: string;
}): { subject: string; html: string } {
  const hi = p.firstName ? `Hey ${escapeHtml(p.firstName)},` : "Hey there,";
  return {
    subject: "How's the dino treating the little one? 🦕",
    html: layout(`
      <p>${hi} by now your Dangerous Dino Driver should've landed — we hope it's already a bedtime favorite.</p>
      <p>Would you share a quick review? <strong>A photo of your kid with it makes our whole day</strong> (and helps other dino families decide). Takes about 30 seconds:</p>
      <p style="margin:20px 0;">${button(p.reviewUrl, "Leave a review")}</p>
      <p>Thank you for being one of our first customers — it genuinely means the world.</p>
      <p>— The Dangerous Dino Drivers family</p>
    `),
  };
}
