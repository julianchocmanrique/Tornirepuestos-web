import type { Metadata } from "next";

import { CatalogSearchGrid, type CatalogItem } from "@/components/CatalogSearchGrid";
import { DEFAULT_OG_IMAGE, absoluteUrl } from "@/lib/seo";
import inventoryCatalog from "@/data/inventory-catalog.json";
import inventoryTopSellers from "@/data/inventory-top-sellers.json";

export const metadata: Metadata = {
  title: "Catálogo",
  description:
    "Catálogo de inventario Tornirepuestos para vehículos pesados, buses y maquinaria. Busca, filtra y cotiza por WhatsApp.",
  alternates: {
    canonical: "/catalogo",
  },
  openGraph: {
    type: "website",
    url: absoluteUrl("/catalogo"),
    title: "Catálogo de Inventario | Tornirepuestos",
    description:
      "Consulta el inventario real de Tornirepuestos con buscador, filtros y productos más vendidos.",
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Catálogo de Inventario | Tornirepuestos",
    description:
      "Consulta el inventario real de Tornirepuestos con buscador, filtros y productos más vendidos.",
    images: [DEFAULT_OG_IMAGE],
  },
};

export default function CatalogoPage() {
  const items = inventoryCatalog as CatalogItem[];
  const topSellers = inventoryTopSellers as CatalogItem[];

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Catálogo de inventario Tornirepuestos",
    description:
      "Inventario actualizado para cotización de repuestos de vehículos pesados, buses y maquinaria.",
    url: absoluteUrl("/catalogo"),
  };

  return (
    <main className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />

      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-50 via-white to-slate-50 p-6">
          <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
            Catálogo
          </div>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-slate-900">
            Inventario de repuestos
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-600">
            Catálogo basado en el inventario de la empresa. Encuentra productos por
            código, descripción, grupo o rotación, y cotiza directamente por WhatsApp.
          </p>
        </div>

        <CatalogSearchGrid items={items} topSellers={topSellers} />
      </section>
    </main>
  );
}
