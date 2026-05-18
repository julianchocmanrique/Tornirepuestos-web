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
  async redirects() {
    return [
      {
        source: "/transmisiones-fuller",
        destination: "/categorias/transmision",
        permanent: true,
      },
      {
        source: "/transmisiones-fuller/",
        destination: "/categorias/transmision",
        permanent: true,
      },
      {
        source: "/tornilleria-en-general",
        destination: "/categorias/tornilleria",
        permanent: true,
      },
      {
        source: "/tornilleria-en-general/",
        destination: "/categorias/tornilleria",
        permanent: true,
      },
      {
        source: "/herramientas",
        destination: "/categorias/herramientas",
        permanent: true,
      },
      {
        source: "/herramientas/",
        destination: "/categorias/herramientas",
        permanent: true,
      },
      {
        source: "/lamparas-bombillos-y-stops",
        destination: "/categorias/electricos-y-luces",
        permanent: true,
      },
      {
        source: "/lamparas-bombillos-y-stops/",
        destination: "/categorias/electricos-y-luces",
        permanent: true,
      },
      {
        source: "/index.php",
        destination: "/",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
