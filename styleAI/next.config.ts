import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: '/styleai',
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
