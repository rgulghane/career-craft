import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Monorepo root (career-craft/) — avoids Next inferring the wrong root when multiple lockfiles exist. */
const outputFileTracingRoot = path.join(__dirname, "..", "..");

/** Stub when a client bundle incorrectly resolves native server packages. */
const browserStub = path.join(__dirname, "src/lib/empty-module.ts");

const nodeBuiltinFallbacks = {
  net: false,
  dns: false,
  tls: false,
  fs: false,
  child_process: false,
  crypto: false,
  stream: false,
  http: false,
  https: false,
  zlib: false,
  os: false,
  path: false,
} as const;

const nextConfig: NextConfig = {
  /** Produces .next/standalone for slim Docker images. */
  output: "standalone",
  /** Native drivers — must not be bundled for client/edge (uses `net`, `crypto`, etc.). */
  serverExternalPackages: ["mongodb", "razorpay"],
  transpilePackages: ["@career-craft/shared"],
  outputFileTracingRoot,
  webpack: (config, { isServer, webpack, nextRuntime }) => {
    if (nextRuntime === "edge") {
      config.externals = [...(config.externals ?? []), "mongodb", "razorpay"];
    }
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        ...nodeBuiltinFallbacks,
      };
      config.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /^mongodb$/,
        }),
        new webpack.IgnorePlugin({
          resourceRegExp: /^razorpay$/,
        }),
      );
    }
    return config;
  },
  turbopack: {
    resolveAlias: {
      mongodb: { browser: browserStub },
      razorpay: { browser: browserStub },
    },
  },
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
      // Mentor photos are admin-supplied URLs from arbitrary https hosts.
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  experimental: {
    optimizePackageImports: ["@career-craft/shared", "@career-craft/shared/content"],
  },
};

export default nextConfig;
