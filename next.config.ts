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
        hostname: 'itarahome.2xinvestor.in',
        pathname: '/uploads/**',
      },
    ],
  },
};

export default nextConfig;
