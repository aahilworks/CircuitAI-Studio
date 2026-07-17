import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
};

// next.config.js
module.exports = {
  allowedDevOrigins: ['192.168.1.38'],
}

export default nextConfig;
