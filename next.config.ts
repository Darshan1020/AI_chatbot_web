import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: [
    "localhost:3000",
    "localhost:3001", 
    "192.168.31.206:3000",
    "192.168.31.206:3001"
  ],
};

export default nextConfig;
