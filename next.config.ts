import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,

  // 1. Keep them external so the bundler doesn't break them
  serverExternalPackages: ["firebase-admin", "jose", "jwks-rsa"],

  // 2. Transpile lucide-react to fix module resolution issues with Turbopack
  transpilePackages: ["lucide-react"], 

  turbopack: {
    // Fix workspace root detection
    root: __dirname,
  },

  allowedDevOrigins: ['127.0.0.1', 'localhost', '192.168.1.38', '192.168.1.6'],
};

export default nextConfig;