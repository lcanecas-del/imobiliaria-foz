import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.ximocrm.com',
      },
    ],
  },
};

export default nextConfig;
