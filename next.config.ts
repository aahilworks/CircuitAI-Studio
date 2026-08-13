import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,

  // Don't use serverExternalPackages - let Next.js bundle everything for Vercel
  serverExternalPackages: [],

  // Transpile packages with ESM/CommonJS compatibility issues
  transpilePackages: ["lucide-react", "jose", "jwks-rsa", "firebase-admin"],

  allowedDevOrigins: ['127.0.0.1', 'localhost', '192.168.1.38', '192.168.1.6'],
};

export default nextConfig;