import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
      { protocol: 'https', hostname: 'media.gettyimages.com' },
    ],
  },
  turbopack: {
    root: __dirname,
  },
  reactCompiler: true,
};

export default nextConfig;
