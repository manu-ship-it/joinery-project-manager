import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['openai', 'twilio']
};

export default nextConfig;
