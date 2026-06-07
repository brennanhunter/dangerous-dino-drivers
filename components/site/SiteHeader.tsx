import Image from "next/image";
import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-white/10">
      <div className="mx-auto flex max-w-5xl items-center px-6 py-4">
        <Link
          href="/"
          aria-label="Dangerous Dino Drivers home"
          className="inline-flex"
        >
          <Image
            src="/logo.png"
            alt="Dangerous Dino Drivers"
            width={2816}
            height={1536}
            priority
            className="h-14 w-auto sm:h-16"
          />
        </Link>
      </div>
    </header>
  );
}
