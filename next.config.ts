import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,

  // 1. Keep firebase-admin external but transpile jose/jwks-rsa for ESM compatibility
  serverExternalPackages: ["firebase-admin"],

  // 2. Transpile packages with ESM/CommonJS compatibility issues
  transpilePackages: ["lucide-react", "jose", "jwks-rsa"], 

  turbopack: {
    // Fix workspace root detection
    root: __dirname,
  },

  allowedDevOrigins: ['127.0.0.1', 'localhost', '192.168.1.38', '192.168.1.6'],
};

export default nextConfig;