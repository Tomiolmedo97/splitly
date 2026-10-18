import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // @splitly/core se publica como TypeScript fuente dentro del monorepo.
  transpilePackages: ["@splitly/core"],
};

export default nextConfig;
