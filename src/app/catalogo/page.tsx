import type { Metadata } from "next";

import { CatalogSearchGrid, type CatalogItem } from "@/components/CatalogSearchGrid";
import { categories } from "@/lib/categories";
import { DEFAULT_OG_IMAGE, absoluteUrl } from "@/lib/seo";

const codePrefixBySlug: Record<string, string> = {
  frenos: "FRN",
  filtracion: "FLT",
  suspension: "SUS",
  motor: "MTR",
  "electricos-y-luces": "ELC",
  transmision: "TRN",
  "rodamientos-y-retenedores": "ROD",
  "mangueras-y-racoreria": "MNG",
  "lubricantes-y-grasas": "LUB",
  tornilleria: "TRR",
  herramientas: "HER",
  diferenciales: "DIF",
};

const imageByCategory: Record<string, string[]> = {
  frenos: [
    "https://images.unsplash.com/photo-1609521263047-f8f205293f24?auto=format&fit=crop&w=1200&q=75",
    "https://images.unsplash.com/photo-1625047509168-a7026f36de04?auto=format&fit=crop&w=1200&q=75",
    "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=75",
  ],
  filtracion: [
    "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=1200&q=75",
    "https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=1200&q=75",
  ],
  suspension: [
    "https://images.unsplash.com/photo-1615906655593-ad0386982a0f?auto=format&fit=crop&w=1200&q=75",
    "https://images.unsplash.com/photo-1669136048337-5daa3adef7b2?auto=format&fit=crop&w=1200&q=75",
  ],
  motor: [
    "https://images.unsplash.com/photo-1429772011165-0c2e054367b8?auto=format&fit=crop&w=1200&q=75",
    "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=1200&q=75",
  ],
  "electricos-y-luces": [
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=75",
    "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=1200&q=75",
  ],
  transmision: [
    "https://images.unsplash.com/photo-1711199694531-e982a79ea381?auto=format&fit=crop&w=1200&q=75",
    "https://images.unsplash.com/photo-1625695236072-4d7f0e2e5f9f?auto=format&fit=crop&w=1200&q=75",
  ],
  "rodamientos-y-retenedores": [
    "https://images.unsplash.com/photo-1589391349202-900abe66462a?auto=format&fit=crop&w=1200&q=75",
    "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=1200&q=75",
  ],
  "mangueras-y-racoreria": [
    "https://images.unsplash.com/photo-1598023707207-276835c2b5fe?auto=format&fit=crop&w=1200&q=75",
    "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=75",
  ],
  "lubricantes-y-grasas": [
    "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=1200&q=75",
    "https://images.unsplash.com/photo-1625047509248-ec889cbff17f?auto=format&fit=crop&w=1200&q=75",
  ],
  tornilleria: [
    "https://images.unsplash.com/photo-1605701249987-f0bb9b505d06?auto=format&fit=crop&w=1200&q=75",
    "https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&w=1200&q=75",
  ],
  herramientas: [
    "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=1200&q=75",
    "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1200&q=75",
  ],
  diferenciales: [
    "https://images.unsplash.com/photo-1736161999520-0a20fa297a89?auto=format&fit=crop&w=1200&q=75",
    "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=1200&q=75",
  ],
};

export const metadata: Metadata = {
  title: "Catálogo",
  description:
    "Catálogo de repuestos Tornirepuestos para vehículos pesados, buses y maquinaria. Busca, filtra y cotiza por WhatsApp.",
  alternates: {
    canonical: "/catalogo",
  },
  openGraph: {
    type: "website",
    url: absoluteUrl("/catalogo"),
    title: "Catálogo de Repuestos | Tornirepuestos",
    description:
      "Busca por código o nombre y filtra por categoría en el catálogo de Tornirepuestos.",
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Catálogo de Repuestos | Tornirepuestos",
    description:
      "Busca por código o nombre y filtra por categoría en el catálogo de Tornirepuestos.",
    images: [DEFAULT_OG_IMAGE],
  },
};

function normalizeKind(name: string) {
  const first = name.split(/[ /-]/)[0] || "Producto";
  return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
}

function getImageForProduct(categorySlug: string, idx: number, fallback: string) {
  const images = imageByCategory[categorySlug];
  if (!images || images.length === 0) return fallback;
  return images[idx % images.length];
}

function getCatalogItems(): CatalogItem[] {
  return categories.flatMap((category) =>
    category.productsExample.map((product, index) => {
      const prefix = codePrefixBySlug[category.slug] || "CAT";
      const serial = String(index + 1).padStart(3, "0");
      return {
        id: `${category.slug}-${serial}`,
        code: `${prefix}-${serial}`,
        name: product.name,
        note: product.note,
        categorySlug: category.slug,
        categoryTitle: category.title,
        image: getImageForProduct(category.slug, index, category.img),
        kind: normalizeKind(product.name),
      };
    })
  );
}

export default function CatalogoPage() {
  const items = getCatalogItems();

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Catálogo Tornirepuestos",
    description:
      "Catálogo de productos para vehículos pesados, buses y maquinaria en Colombia.",
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
            Repuestos Tornirepuestos
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-600">
            Busca por código o nombre del producto, aplica filtros y cotiza de forma
            rápida por WhatsApp.
          </p>
        </div>

        <CatalogSearchGrid items={items} />
      </section>
    </main>
  );
}
