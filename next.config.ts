import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Se despliega detrás de Nginx en subpath
  basePath: "/tornirepuestos",
  // Evita redirecciones raras con el slash final al navegar desde Nginx
  trailingSlash: true,
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
