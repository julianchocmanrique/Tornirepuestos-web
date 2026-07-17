import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

import { DEFAULT_OG_IMAGE, absoluteUrl } from "@/lib/seo";
import { productLines } from "@/lib/productLines";
import { getCategoryBySlug } from "@/lib/categories";
import { wa } from "@/lib/wa";

export const metadata: Metadata = {
  title: "Productos y repuestos para camiones | Tornirepuestos",
  description:
    "Conoce las líneas de repuestos de Tornirepuestos: frenos, filtros, suspensión, motor, transmisión, tornillería, mangueras y más. Busca en catálogo y cotiza por WhatsApp.",
  alternates: {
    canonical: "/productos",
  },
  openGraph: {
    type: "website",
    url: absoluteUrl("/productos"),
    title: "Productos y líneas de repuestos | Tornirepuestos",
    description:
      "Página informativa de líneas de repuestos conectada al catálogo de inventario para cotizar más rápido.",
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Productos y líneas de repuestos | Tornirepuestos",
    description:
      "Explora líneas de repuestos, aplicaciones y acceso directo al catálogo de Tornirepuestos.",
    images: [DEFAULT_OG_IMAGE],
  },
};

export default function ProductosPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Productos y líneas de repuestos Tornirepuestos",
    description:
      "Líneas informativas de repuestos para camiones, buses y maquinaria conectadas al catálogo de Tornirepuestos.",
    url: absoluteUrl("/productos"),
    mainEntity: {
      "@type": "ItemList",
      itemListElement: productLines.map((line, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: line.title,
        url: absoluteUrl(`/productos/${line.slug}`),
      })),
    },
  };

  return (
    <main className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-50 via-white to-slate-50 p-6 shadow-sm">
          <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Productos</div>
          <h1 className="mt-2 max-w-4xl text-4xl font-extrabold tracking-tight text-slate-900">
            Repuestos organizados por línea para cotizar más rápido
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600">
            Esta sección combina información técnica con acceso directo al catálogo. Entra a una
            línea, revisa qué datos ayudan a validar compatibilidad y busca productos disponibles
            por referencia, nombre o familia.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/catalogo"
              className="inline-flex rounded-xl px-4 py-2 text-sm font-semibold text-white"
              style={{ background: "var(--tp-action-primary)" }}
            >
              Ver catálogo completo
            </Link>
            <a
              href={wa("Quiero cotizar repuestos. ¿Me ayudas a validar la referencia correcta?")}
              className="inline-flex rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cotizar por WhatsApp
            </a>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {productLines.map((line) => {
            const category = getCategoryBySlug(line.categorySlug);
            return (
              <article
                key={line.slug}
                className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="relative h-44 bg-slate-900">
                  {category?.img && (
                    <Image
                      src={category.img}
                      alt={line.title}
                      fill
                      className="object-cover opacity-85"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/35 to-transparent" />
                  <div className="absolute left-5 top-5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold tracking-[0.16em] text-white/80">
                    {line.kicker}
                  </div>
                  <h2 className="absolute bottom-5 left-5 right-5 text-2xl font-extrabold text-white">
                    {line.title}
                  </h2>
                </div>
                <div className="space-y-4 p-5">
                  <p className="text-sm leading-relaxed text-slate-600">{line.summary}</p>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Incluye
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {line.includes.slice(0, 4).map((item) => (
                        <span
                          key={item}
                          className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Link
                      href={`/productos/${line.slug}`}
                      className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Ver línea
                    </Link>
                    <Link
                      href={`/catalogo?q=${encodeURIComponent(line.catalogQuery)}`}
                      className="inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-semibold text-white"
                      style={{ background: "var(--tp-action-primary)" }}
                    >
                      Buscar en catálogo
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
