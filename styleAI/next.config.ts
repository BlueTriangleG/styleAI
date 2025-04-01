import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  basePath: '/styleai',
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['images.unsplash.com'],
  },
};

export default nextConfig;
