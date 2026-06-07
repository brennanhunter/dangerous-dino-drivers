// Plain-language template — review with counsel and confirm details before relying on it.
import type { Metadata } from "next";
import { LegalPage } from "@/components/site/LegalPage";
import { STORE } from "@/lib/content";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Dangerous Dino Drivers collects, uses, and protects your information.",
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="June 7, 2026">
      <p>
        This Privacy Policy explains how Dangerous Dino Drivers (“we,” “us,” or
        “our”) collects, uses, and protects your information when you visit
        dangerousdinodrivers.com and place an order.
      </p>

      <h2>Information we collect</h2>
      <ul>
        <li>
          <strong>Information you give us:</strong> your name, email address,
          shipping address, and phone number when you place an order or contact
          support.
        </li>
        <li>
          <strong>Payment information:</strong> processed securely by Stripe. We
          never see or store your full card details.
        </li>
        <li>
          <strong>Automatically collected:</strong> basic device and browser
          information and pages visited, via cookies and similar technologies.
        </li>
      </ul>

      <h2>How we use your information</h2>
      <ul>
        <li>To process, fulfill, and ship your orders</li>
        <li>
          To send order confirmations and shipping updates, and to answer
          support requests
        </li>
        <li>To improve our store and products</li>
        <li>
          With your consent, to send marketing — you can opt out at any time
        </li>
        <li>To measure and improve our advertising</li>
      </ul>

      <h2>Who we share it with</h2>
      <p>
        We share information only with the service providers that help us run the
        store:
      </p>
      <ul>
        <li>
          <strong>Stripe</strong> — payment processing
        </li>
        <li>
          <strong>Printify</strong> — order production and shipping
        </li>
        <li>
          <strong>Vercel</strong> — website hosting
        </li>
        <li>
          <strong>Google</strong> — website analytics and Search Console
        </li>
        <li>
          <strong>Advertising and analytics partners</strong> (for example,
          TikTok or Meta) when we run ads, to measure their performance
        </li>
      </ul>
      <p>
        <strong>We do not sell your personal information.</strong>
      </p>

      <h2>Cookies and tracking</h2>
      <p>
        We use cookies for essential site functions, analytics, and advertising
        measurement. You can control or disable cookies in your browser
        settings, though some features may not work as well.
      </p>

      <h2>Your choices and rights</h2>
      <p>
        You may request access to, correction of, or deletion of your personal
        information by emailing us at{" "}
        <a href={`mailto:${STORE.contactEmail}`}>{STORE.contactEmail}</a>. We
        will respond within a reasonable timeframe.
      </p>

      <h2>Children’s privacy</h2>
      <p>
        Our products are made for children, but our store is intended for use by
        adults. We do not knowingly collect personal information from children
        under 13. If you believe a child has provided us information, contact us
        and we will delete it.
      </p>

      <h2>Data retention and security</h2>
      <p>
        We keep order information for as long as needed to fulfill orders and
        meet legal and accounting obligations, and we use reasonable safeguards
        to protect it.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        We may update this policy from time to time. The “Last updated” date
        above reflects the latest version.
      </p>

      <h2>Contact us</h2>
      <p>
        Questions? Email{" "}
        <a href={`mailto:${STORE.contactEmail}`}>{STORE.contactEmail}</a> or call{" "}
        <a href={`tel:+1${STORE.phone.replace(/\D/g, "")}`}>{STORE.phone}</a>.
      </p>
    </LegalPage>
  );
}
