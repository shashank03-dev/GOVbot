import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  // eslint config kept for older Next.js compat
  ...(({ eslint: { ignoreDuringBuilds: true } }) as unknown as object),
};

export default nextConfig;
