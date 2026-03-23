import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Se despliega detrás de Nginx en subpath
  basePath: "/tornirepuestos",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
