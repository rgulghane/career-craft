import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Monorepo root (career-craft/) — avoids Next inferring the wrong root when multiple lockfiles exist. */
const outputFileTracingRoot = path.join(__dirname, "..", "..");

const nextConfig: NextConfig = {
  /** Produces .next/standalone for slim Docker images. */
  output: "standalone",
  transpilePackages: ["@career-craft/shared"],
  outputFileTracingRoot,
  async redirects() {
    return [{ source: "/favicon.ico", destination: "/favicon.svg", permanent: false }];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
  experimental: {
    optimizePackageImports: ["@career-craft/shared", "@career-craft/shared/content"],
  },
};

export default nextConfig;
