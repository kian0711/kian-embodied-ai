import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // The publishing form accepts an image up to 4 MB. Leave room for the
    // multipart envelope and text fields.
    serverActions: { bodySizeLimit: "6mb" },
  },
};

export default nextConfig;
