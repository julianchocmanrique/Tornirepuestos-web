import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Se despliega en dominio raíz (/) detrás de Nginx
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
