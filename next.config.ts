import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // THIS FIXES THE "require() of ES Module" ERROR
  serverExternalPackages: ['firebase-admin'], 
  
  allowedDevOrigins: ['127.0.0.1', 'localhost', '192.168.1.38', '192.168.1.6'],
};

export default nextConfig;