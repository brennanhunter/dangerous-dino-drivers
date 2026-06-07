import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "Dangerous Dino Drivers — Dino Pillowcases for Kids",
  description:
    "Dangerously fun dinosaurs crammed into tiny vehicles, printed on soft pillowcases your kid will love. Dino chaos for bedrooms everywhere.",
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
