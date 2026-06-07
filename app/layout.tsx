import type { Metadata, Viewport } from "next";
import { Rubik_Dirt, Fredoka } from "next/font/google";
import "./globals.css";

// Display / headers — stone-carved, prehistoric vibe.
const rubikDirt = Rubik_Dirt({
  weight: "400", // Rubik Dirt ships a single weight
  subsets: ["latin"],
  variable: "--font-rubik-dirt",
  display: "swap",
});

// Body / UI — rounded, friendly, highly readable. Variable font (300–700).
const fredoka = Fredoka({
  subsets: ["latin"],
  variable: "--font-fredoka",
  display: "swap",
});

const siteUrl = "https://dangerousdinodrivers.com";
const siteName = "Dangerous Dino Drivers";
const title = "Dangerous Dino Drivers — Dino Pillowcases for Kids";
const description =
  "Dangerously fun dinosaurs crammed into tiny vehicles, printed on soft, vibrant pillowcases your kid will actually want on their bed. A roaring-good gift for dino-obsessed kids.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    template: "%s | Dangerous Dino Drivers",
  },
  description,
  applicationName: siteName,
  creator: siteName,
  publisher: siteName,
  category: "shopping",
  keywords: [
    "dinosaur pillowcase",
    "dino pillowcase",
    "kids pillowcase",
    "dinosaur bedding",
    "triceratops pillowcase",
    "kids dinosaur gift",
    "dinosaur truck",
    "kids bedroom decor",
    "Dangerous Dino Drivers",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName,
    title,
    description,
    url: siteUrl,
    locale: "en_US",
    images: [
      {
        url: "/logo.png",
        width: 2816,
        height: 1536,
        alt: "Dangerous Dino Drivers — a triceratops driving a rock car",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#111827",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${rubikDirt.variable} ${fredoka.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
