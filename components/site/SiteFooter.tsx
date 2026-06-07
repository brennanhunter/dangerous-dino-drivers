import Link from "next/link";
import { STORE } from "@/lib/content";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-6 py-8 text-center text-sm text-white/50">
        <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
          <Link href="/privacy" className="hover:text-aqua">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-aqua">
            Terms
          </Link>
          <Link href="/refunds" className="hover:text-aqua">
            Refunds &amp; Returns
          </Link>
        </nav>
        <p>
          Questions?{" "}
          <a
            className="text-aqua hover:underline"
            href={`mailto:${STORE.contactEmail}`}
          >
            {STORE.contactEmail}
          </a>{" "}
          ·{" "}
          <a
            className="text-aqua hover:underline"
            href={`tel:+1${STORE.phone.replace(/\D/g, "")}`}
          >
            {STORE.phone}
          </a>
        </p>
        <p>© Dangerous Dino Drivers · {STORE.social}</p>
      </div>
    </footer>
  );
}
