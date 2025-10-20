import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker/Cloud Run deployment
  output: "standalone",
  // Allow cross-origin requests from specific origins during development
  allowedDevOrigins: ["192.168.29.206"],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET, POST, PUT, DELETE, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
        ],
      },
    ];
  },
};

export default nextConfig;
