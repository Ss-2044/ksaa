import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["sharp", "@prisma/client", "bcryptjs"],
  experimental: {
    serverActions: { bodySizeLimit: "60mb" },
  },
  poweredByHeader: false,
};

export default nextConfig;
