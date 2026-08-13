import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Tell Next.js to stop bundling these specific problematic libraries
  serverExternalPackages: [
    'firebase-admin',
    'jose',
    'jwks-rsa'
  ],
  
  allowedDevOrigins: ['127.0.0.1', 'localhost', '192.168.1.38', '192.168.1.6'],
};

export default nextConfig;