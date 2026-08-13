import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,

  // 1. Keep them external so the bundler doesn't break them
  serverExternalPackages: ["firebase-admin", "jose", "jwks-rsa"],

  // 2. DO NOT put the same packages in transpilePackages. 
  // I have removed them from here to fix your build error.
  transpilePackages: [], 

  experimental: {
    // 3. This is the MAGIC fix for the "require() of ES Module" error.
    // It tells Next.js to be "loose" with how it handles ESM and CommonJS.
    esmExternals: "loose",
  },

  allowedDevOrigins: ['127.0.0.1', 'localhost', '192.168.1.38', '192.168.1.6'],
};

export default nextConfig;