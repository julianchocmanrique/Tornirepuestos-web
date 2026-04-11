import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

import { categories } from "@/lib/categories";
import { DEFAULT_OG_IMAGE, absoluteUrl } from "@/lib/seo";
import { wa } from "@/lib/wa";

export const metadata: Metadata = {
  title: "Catálogo",
  description:
    "Catálogo de repuestos Tornirepuestos para vehículos pesados, buses y maquinaria. Explora categorías y cotiza por WhatsApp.",
  alternates: {
    canonical: "/catalogo",
  },
  openGraph: {
    type: "website",
    url: absoluteUrl("/catalogo"),
    title: "Catálogo de Repuestos | Tornirepuestos",
    description:
      "Explora el catálogo de Tornirepuestos por categoría y cotiza repuestos por WhatsApp.",
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Catálogo de Repuestos | Tornirepuestos",
    description:
      "Explora el catálogo de Tornirepuestos por categoría y cotiza repuestos por WhatsApp.",
    images: [DEFAULT_OG_IMAGE],
  },
};

export default function CatalogoPage() {
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Catálogo Tornirepuestos",
    description:
      "Catálogo de categorías y productos para vehículos pesados, buses y maquinaria.",
    url: absoluteUrl("/catalogo"),
    hasPart: categories.map((c) => ({
      "@type": "Thing",
      name: c.title,
      url: absoluteUrl(`/categorias/${c.slug}`),
    })),
  };

  return (
    <main className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="text-xs uppercase tracking-wide text-slate-500">
          Tornirepuestos
        </div>
        <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-slate-900">
          Catálogo de repuestos
        </h1>
        <p className="mt-3 max-w-3xl text-sm text-slate-600">
          Encuentra repuestos para vehículos pesados, buses y maquinaria. Revisa
          categorías y productos frecuentes, y cotiza por WhatsApp.
        </p>

        <div className="mt-8 space-y-6">
          {categories.map((cat) => (
            <article
              key={cat.slug}
              className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="grid gap-0 md:grid-cols-[300px_1fr]">
                <div className="relative min-h-[220px]">
                  <Image
                    src={cat.img}
                    alt={cat.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-slate-900/15 to-transparent" />
                </div>

                <div className="p-6">
                  <div className="text-[11px] font-semibold tracking-[0.18em] text-slate-500">
                    {cat.kicker}
                  </div>
                  <h2 className="mt-2 text-2xl font-extrabold text-slate-900">
                    {cat.title}
                  </h2>
                  <p className="mt-2 text-sm text-slate-600">{cat.desc}</p>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {cat.productsExample.slice(0, 4).map((p) => (
                      <div
                        key={p.name}
                        className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                      >
                        <div className="text-sm font-bold text-slate-900">{p.name}</div>
                        <div className="mt-1 text-xs text-slate-600">{p.note}</div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <Link
                      href={`/categorias/${cat.slug}`}
                      className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                    >
                      Ver categoría
                    </Link>
                    <a
                      href={wa(
                        `Quiero cotizar ${cat.title}. Referencia o foto: ____. Ciudad destino: ____.`
                      )}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold text-white"
                      style={{ background: "var(--tp-action-primary)" }}
                    >
                      Cotizar por WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
