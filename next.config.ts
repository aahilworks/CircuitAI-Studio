import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,

  // This is the fix for the "ERR_REQUIRE_ESM" / Payment Button error
  serverExternalPackages: [
    "firebase-admin",
    "jose",
    "jwks-rsa"
  ],

  // This ensures Next.js handles the module conflict correctly
  transpilePackages: ["jose", "jwks-rsa"],

  allowedDevOrigins: ['127.0.0.1', 'localhost', '192.168.1.38', '192.168.1.6'],
};

export default nextConfig;