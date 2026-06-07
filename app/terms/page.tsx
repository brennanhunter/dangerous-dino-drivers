// Plain-language template — review with counsel and confirm governing law before relying on it.
import type { Metadata } from "next";
import { LegalPage } from "@/components/site/LegalPage";
import { STORE } from "@/lib/content";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms that govern your use of Dangerous Dino Drivers.",
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="June 7, 2026">
      <p>
        By using dangerousdinodrivers.com or placing an order, you agree to these
        Terms of Service. Please read them carefully.
      </p>

      <h2>Eligibility</h2>
      <p>
        You must be at least 18 years old (or the age of majority where you live)
        to place an order.
      </p>

      <h2>Products and pricing</h2>
      <p>
        Our items are made to order. We work hard to be accurate, but we don’t
        guarantee that product descriptions, colors, or prices are always
        error-free. We may correct errors and may cancel or refuse any order —
        including after a confirmation — if a pricing or product error occurred.
        All prices are in U.S. dollars.
      </p>

      <h2>Orders and payment</h2>
      <p>
        Payment is processed securely by Stripe at checkout. Placing an order is
        an offer to purchase, which we may accept or decline. The total shown at
        checkout, including shipping, is what you’ll be charged.
      </p>

      <h2>Shipping and delivery</h2>
      <p>
        Products are printed on demand and typically arrive within 3–7 business
        days. Risk of loss passes to you once the order is handed to the carrier.
        You are responsible for providing an accurate shipping address; we cannot
        reship orders sent to an address entered incorrectly. See our{" "}
        <a href="/refunds">Refund &amp; Returns Policy</a>.
      </p>

      <h2>Returns and refunds</h2>
      <p>
        Returns and refunds are governed by our{" "}
        <a href="/refunds">Refund &amp; Returns Policy</a>.
      </p>

      <h2>Intellectual property</h2>
      <p>
        All designs, artwork, logos, and content on this site are owned by
        Dangerous Dino Drivers and may not be copied or reproduced without our
        written permission.
      </p>

      <h2>Acceptable use</h2>
      <p>
        Don’t misuse the site — no fraud, scraping, or interfering with its
        operation or security.
      </p>

      <h2>Disclaimers</h2>
      <p>
        To the fullest extent permitted by law, the site and products are
        provided “as is” without warranties of any kind, except those that cannot
        be excluded under applicable law.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        To the fullest extent permitted by law, our total liability for any claim
        relating to a product is limited to the amount you paid for that product.
      </p>

      <h2>Governing law</h2>
      <p>
        These Terms are governed by the laws of the State of Florida, United
        States, without regard to its conflict-of-laws rules.
      </p>

      <h2>Changes to these terms</h2>
      <p>
        We may update these Terms from time to time. Continued use of the site
        means you accept the current version.
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
