import type { NextConfig } from "next";

const nextConfig: NextConfig = {
   reactStrictMode: true,
   images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "5000",
        pathname: "/uploads/**",
      },
          {
        protocol: 'https',
        hostname: 'sitarahome-backend-production.up.railway.app',
        pathname: '/uploads/**',
      },
    ],
  },
};

export default nextConfig;
