import type { Metadata } from "next";

import { CatalogSearchGrid, type CatalogItem } from "@/components/CatalogSearchGrid";
import { DEFAULT_OG_IMAGE, absoluteUrl } from "@/lib/seo";
import { readCatalogItems } from "@/lib/catalogStore";
import { categories } from "@/lib/categories";

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

export const dynamic = "force-dynamic";

export default async function CatalogoPage() {
  const items = (await readCatalogItems()) as CatalogItem[];
  const topSellers = [...items]
    .sort((a, b) => {
      const salesDiff = (b.totalSales || 0) - (a.totalSales || 0);
      if (salesDiff !== 0) return salesDiff;
      return (b.stock || 0) - (a.stock || 0);
    })
    .slice(0, 20);
  const indexedSamples = items.slice(0, 30);

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Catálogo de inventario Tornirepuestos",
    description:
      "Inventario actualizado para cotización de repuestos de vehículos pesados, buses y maquinaria.",
    url: absoluteUrl("/catalogo"),
    mainEntity: {
      "@type": "ItemList",
      itemListElement: indexedSamples.map((item, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        url: `${absoluteUrl("/catalogo")}#producto-${encodeURIComponent(item.id)}`,
        name: `${item.name} (${item.code})`,
      })),
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Inicio",
        item: absoluteUrl("/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Catálogo",
        item: absoluteUrl("/catalogo"),
      },
    ],
  };

  return (
    <main className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
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

        <section className="mt-8 grid gap-5 rounded-3xl border border-slate-200 bg-slate-50 p-6 md:grid-cols-2">
          <article>
            <h2 className="text-xl font-extrabold text-slate-900">Cobertura y atención</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              En Tornirepuestos atendemos solicitudes de repuestos para vehículos pesados, buses y
              maquinaria en todo Colombia. Cotiza con código, foto de la pieza o descripción
              técnica para validar compatibilidad y disponibilidad más rápido.
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Este catálogo se actualiza con base en inventario operativo para facilitar búsquedas
              de referencias, subgrupos y productos con stock disponible.
            </p>
          </article>
          <article>
            <h2 className="text-xl font-extrabold text-slate-900">Explora por categoría</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {categories.map((cat) => (
                <a
                  key={cat.slug}
                  href={`/catalogo?cat=${cat.slug}`}
                  className="inline-flex items-center rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  {cat.title}
                </a>
              ))}
            </div>
          </article>
        </section>
      </section>
    </main>
  );
}
