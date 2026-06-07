// Plain-language template — review with counsel before relying on it.
import type { Metadata } from "next";
import { LegalPage } from "@/components/site/LegalPage";
import { STORE } from "@/lib/content";

export const metadata: Metadata = {
  title: "Refunds & Returns",
  description:
    "Our 30-day Happy Kid Guarantee, plus how returns, refunds, and cancellations work.",
};

export default function RefundsPage() {
  return (
    <LegalPage title="Refunds & Returns" updated="June 7, 2026">
      <p>
        We want every dino fan obsessed. Here’s exactly how our guarantee,
        returns, refunds, and cancellations work.
      </p>

      <h2>The 100% Happy Kid Guarantee</h2>
      <p>
        If your item arrives <strong>damaged, defective, or not as described</strong>,
        we’ll replace it or refund you within {STORE.guaranteeDays} days of
        delivery — no drama.
      </p>

      <h2>Made-to-order items</h2>
      <p>
        Because each pillowcase is printed just for your order, we generally
        can’t accept returns for change of mind or buyer’s remorse. The guarantee
        above always applies to quality issues.
      </p>

      <h2>Damaged or defective items</h2>
      <p>
        Email{" "}
        <a href={`mailto:${STORE.contactEmail}`}>{STORE.contactEmail}</a> within{" "}
        {STORE.guaranteeDays} days of delivery with your order number and a photo
        of the issue. We’ll arrange a free replacement or a refund — your choice.
      </p>

      <h2>Wrong or incorrect address</h2>
      <p>
        We can’t refund or replace orders shipped to an address entered
        incorrectly at checkout, so please double-check your shipping details
        before paying.
      </p>

      <h2>Sizing</h2>
      <p>
        Our pillowcase is a standard 20″ × 30″ and fits standard and queen
        pillows. Please check the size before ordering — wrong-size change of mind
        isn’t covered, but quality issues always are.
      </p>

      <h2>How refunds are issued</h2>
      <p>
        Approved refunds are returned to your original payment method through
        Stripe, typically within 5–10 business days of approval.
      </p>

      <h2>Shipping &amp; delivery</h2>
      <p>
        Items are made to order and typically arrive within 5–10 business days.
        You’ll receive tracking by email once your order ships.
      </p>

      <h2>Cancellations</h2>
      <p>
        Need to cancel? Contact us as soon as possible. We can usually cancel
        before an item enters production, but once it’s in production we’re unable
        to stop it.
      </p>

      <h2>Contact us</h2>
      <p>
        Email{" "}
        <a href={`mailto:${STORE.contactEmail}`}>{STORE.contactEmail}</a> or call{" "}
        <a href={`tel:+1${STORE.phone.replace(/\D/g, "")}`}>{STORE.phone}</a> and
        we’ll take care of you.
      </p>
    </LegalPage>
  );
}
