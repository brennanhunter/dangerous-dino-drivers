import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Printify mockup CDNs — required for next/image to render product photos.
    remotePatterns: [
      { protocol: "https", hostname: "images.printify.com" },
      { protocol: "https", hostname: "images-api.printify.com" },
      // Supabase Storage (review photos)
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
};

export default nextConfig;
