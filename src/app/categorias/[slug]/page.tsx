import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { categories, getCategoryBySlug } from "@/lib/categories";
import { getCategorySeoContent } from "@/lib/categorySeoContent";
import { absoluteUrl } from "@/lib/seo";
import { wa } from "@/lib/wa";
import { seoDetail, seoParagraph } from "./seo";

const productImagesByCategory: Record<string, string[]> = {
  frenos: [
    "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=1200&q=75",
    "https://images.unsplash.com/photo-1625047509168-a7026f36de04?auto=format&fit=crop&w=1200&q=75",
    "https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=1200&q=75",
    "https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?auto=format&fit=crop&w=1200&q=75",
    "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=1200&q=75",
    "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=75",
  ],
  filtracion: [
    "https://images.unsplash.com/photo-1580894732444-8ecded7900cd?auto=format&fit=crop&w=1200&q=75",
    "https://images.unsplash.com/photo-1486006920555-c77dcf18193c?auto=format&fit=crop&w=1200&q=75",
    "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=1200&q=75",
  ],
  suspension: [
    "https://images.unsplash.com/photo-1617469767053-d3b523a0b982?auto=format&fit=crop&w=1200&q=75",
    "https://images.unsplash.com/photo-1615906655593-ad0386982a0f?auto=format&fit=crop&w=1200&q=75",
    "https://images.unsplash.com/photo-1609521263047-f8f205293f24?auto=format&fit=crop&w=1200&q=75",
  ],
  motor: [
    "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=1200&q=75",
    "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=1200&q=75",
    "https://images.unsplash.com/photo-1517673132405-a56a62b18caf?auto=format&fit=crop&w=1200&q=75",
  ],
  "electricos-y-luces": [
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=75",
    "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=1200&q=75",
    "https://images.unsplash.com/photo-1612538498456-e861df91d4d0?auto=format&fit=crop&w=1200&q=75",
  ],
  transmision: [
    "https://images.unsplash.com/photo-1625695236072-4d7f0e2e5f9f?auto=format&fit=crop&w=1200&q=75",
    "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=1200&q=75",
    "https://images.unsplash.com/photo-1609521263047-f8f205293f24?auto=format&fit=crop&w=1200&q=75",
  ],
  "rodamientos-y-retenedores": [
    "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=1200&q=75",
    "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=1200&q=75",
    "https://images.unsplash.com/photo-1589391349202-900abe66462a?auto=format&fit=crop&w=1200&q=75",
  ],
  "mangueras-y-racoreria": [
    "https://images.unsplash.com/photo-1598023707207-276835c2b5fe?auto=format&fit=crop&w=1200&q=75",
    "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=75",
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=75",
  ],
  "lubricantes-y-grasas": [
    "https://images.unsplash.com/photo-1625047509248-ec889cbff17f?auto=format&fit=crop&w=1200&q=75",
    "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=1200&q=75",
    "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1200&q=75",
  ],
  tornilleria: [
    "https://images.unsplash.com/photo-1605701249987-f0bb9b505d06?auto=format&fit=crop&w=1200&q=75",
    "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=75",
    "https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&w=1200&q=75",
  ],
  herramientas: [
    "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=1200&q=75",
    "https://images.unsplash.com/photo-1581147036324-c1c1dbdd5f47?auto=format&fit=crop&w=1200&q=75",
    "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1200&q=75",
  ],
  diferenciales: [
    "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=1200&q=75",
    "https://images.unsplash.com/photo-1625695236072-4d7f0e2e5f9f?auto=format&fit=crop&w=1200&q=75",
    "https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=1200&q=75",
  ],
};

function getProductImage(slug: string, index: number, fallback: string) {
  const images = productImagesByCategory[slug];
  if (!images || images.length === 0) return fallback;
  return images[index % images.length];
}

export function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const cat = getCategoryBySlug(slug);

  if (!cat) {
    return {
      title: "Categoría no encontrada",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title = `${cat.title} para vehículos pesados`;
  const description = `${cat.desc} Cotiza ${cat.title.toLowerCase()} por WhatsApp con Tornirepuestos.`;
  const url = absoluteUrl(`/categorias/${cat.slug}`);

  return {
    title,
    description,
    alternates: {
      canonical: `/categorias/${cat.slug}`,
    },
    openGraph: {
      type: "article",
      url,
      title,
      description,
      images: [cat.img],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [cat.img],
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cat = getCategoryBySlug(slug);

  if (!cat) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16">
        <h1 className="text-2xl font-extrabold">Categoría no encontrada</h1>
        <p className="mt-2 text-slate-600">Vuelve al catálogo.</p>
        
      </div>
    );
  }

  const waText = `Quiero cotizar: ${cat.title}. Es para: (camión/bus/maquinaria). Referencia o foto: ____. Ciudad destino: ____.`;
  const seoContent = getCategorySeoContent(cat.slug);
  const seoInfoDetail = seoDetail(cat);
  const categoryFaq = [
    {
      q: `¿Qué referencias de ${cat.title.toLowerCase()} manejan?`,
      a: `Manejamos referencias y equivalencias de ${cat.title.toLowerCase()} para vehículos pesados, buses y maquinaria. Validamos compatibilidad por placa, muestra o referencia.`,
    },
    {
      q: `¿Cómo cotizo ${cat.title.toLowerCase()} más rápido?`,
      a: `Envíanos por WhatsApp una foto clara de la pieza, referencia y ciudad destino. Te compartimos disponibilidad, precio y tiempos de envío.`,
    },
    {
      q: `¿Hacen envíos de ${cat.title.toLowerCase()} a otras ciudades?`,
      a: `Sí, coordinamos envío de ${cat.title.toLowerCase()} a todo Colombia según disponibilidad y transportadora.`,
    },
  ];
  const categoryJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: cat.title,
    description: cat.desc,
    url: absoluteUrl(`/categorias/${cat.slug}`),
    isPartOf: absoluteUrl("/categorias"),
  };
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: categoryFaq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };

  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(categoryJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={cat.img}
            alt={cat.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/70 to-slate-950/10" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(225,6,0,0.45),transparent_55%)]" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 py-16 text-white">
          <div className="flex items-center justify-between gap-4">
            <Link
              href="/categorias"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15"
            >
              ← Volver a categorías
            </Link>
          </div>

          <div className="mt-10 max-w-3xl">
            <div className="text-[11px] font-semibold tracking-[0.18em] text-white/75">
              {cat.kicker}
            </div>
            <h1 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">
              {cat.title}
            </h1>
            <p className="mt-4 text-white/80">{cat.desc}</p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={wa(waText)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold text-white"
                style={{ background: "var(--tp-action-primary)" }}
              >
                Cotizar por WhatsApp
              </a>
              <a
                href="#detalle"
                className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white hover:bg-white/15"
              >
                Ver detalle
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* SEO copy */}
      <section className="mx-auto max-w-6xl px-4 pt-10">
        <div className="rounded-3xl border border-slate-200/70 bg-white/70 p-7 shadow-[0_10px_30px_rgba(2,6,23,0.10)] backdrop-blur">
          <div className="text-xs uppercase tracking-wide text-slate-500">
            Información
          </div>
          <p className="mt-3 text-sm leading-relaxed text-slate-700">
            {seoParagraph(cat)}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-slate-700">
            {seoInfoDetail.overview}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-slate-700">
            {seoInfoDetail.technicalGuide}
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="text-sm font-extrabold text-slate-900">
                Aplicaciones frecuentes en {cat.title.toLowerCase()}
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                {seoInfoDetail.applications.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-0.5" style={{ color: "var(--tp-action-primary)" }}>
                      •
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="text-sm font-extrabold text-slate-900">
                Recomendaciones para cotizar mejor
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                {seoInfoDetail.purchaseTips.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-0.5" style={{ color: "var(--tp-action-primary)" }}>
                      •
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Detail */}
      <section id="detalle" className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-200/70 bg-white/70 p-7 shadow-[0_10px_30px_rgba(2,6,23,0.10)] backdrop-blur">
            <div className="text-xs uppercase tracking-wide text-slate-500">
              Qué puedes cotizar
            </div>
            <h2 className="mt-2 text-2xl font-extrabold text-slate-900">
              {cat.title}
            </h2>
            <ul className="mt-4 space-y-2 text-sm text-slate-700">
              {cat.whatYouCanAsk.map((x) => (
                <li key={x} className="flex gap-2">
                  <span className="mt-0.5" style={{ color: "var(--tp-action-primary)" }}>
                    ▲
                  </span>
                  <span>{x}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-700">
              <div className="font-extrabold">Para cotizar más rápido</div>
              <div className="mt-2">
                Envíanos por WhatsApp: placa (si aplica), referencia o foto clara, y la
                ciudad de destino.
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
              <div className="text-xs uppercase tracking-wide text-slate-500">Checklist</div>
              <div className="mt-2 text-sm font-extrabold text-slate-900">¿Qué datos enviar?</div>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                {[
                  "Placa o modelo del vehículo",
                  "Referencia (si la tienes)",
                  "Foto clara de la pieza / etiqueta",
                  "Medidas (si aplica)",
                  "Ciudad destino",
                ].map((x) => (
                  <li key={x} className="flex gap-2">
                    <span className="mt-0.5" style={{ color: "var(--tp-action-primary)" }}>
                      •
                    </span>
                    <span>{x}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200/70 bg-white/70 p-7 shadow-[0_10px_30px_rgba(2,6,23,0.10)] backdrop-blur">
            <h2 className="mt-2 text-2xl font-extrabold text-slate-900">
              Productos más pedidos
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {cat.productsExample.map((p, idx) => (
                <div
                  key={p.name}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="relative h-28 w-full">
                    <Image
                      src={getProductImage(cat.slug, idx, cat.img)}
                      alt={`${p.name} - ${cat.title}`}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-slate-900/20 to-transparent" />
                    <div className="absolute left-3 top-3 rounded-full bg-white/90 px-2 py-1 text-[10px] font-semibold tracking-wide text-slate-700">
                      {cat.title}
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="text-sm font-extrabold text-slate-900">{p.name}</div>
                    <div className="mt-1 text-xs text-slate-600">{p.note}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <a
                href={wa(waText)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm font-semibold"
                style={{ color: "var(--tp-action-primary)" }}
              >
                Cotizar {cat.title} →
              </a>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-700">
              <div className="font-extrabold">Preguntas frecuentes de esta categoría</div>
              <div className="mt-2 space-y-2">
                <div>• ¿Tienen disponibilidad inmediata?</div>
                <div>• ¿Sirve para mi referencia / modelo?</div>
                <div>• ¿Cuánto tarda el envío a mi ciudad?</div>
              </div>
              <div className="mt-4">
                <a
                  href={wa(
                    `${waText}\n\n¿Tienen disponibilidad? ¿Me confirmas compatibilidad y tiempo de envío?`
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-semibold"
                  style={{ color: "var(--tp-action-primary)" }}
                >
                  Preguntar por WhatsApp →
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <article className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
            <div className="text-xs uppercase tracking-wide text-slate-500">
              Términos de búsqueda
            </div>
            <h2 className="mt-2 text-2xl font-extrabold text-slate-900">
              Lo que más consultan en {cat.title}
            </h2>
            <p className="mt-3 text-sm text-slate-700">
              Basado en rotación de inventarios 2026 (enero a abril) y consultas
              frecuentes de clientes en mostrador y WhatsApp.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-slate-700">
              {seoContent.commonSearches.map((term) => (
                <li key={term} className="flex gap-2">
                  <span className="mt-0.5" style={{ color: "var(--tp-action-primary)" }}>
                    •
                  </span>
                  <span>{term}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
            <div className="text-xs uppercase tracking-wide text-slate-500">
              Referencias frecuentes
            </div>
            <h2 className="mt-2 text-2xl font-extrabold text-slate-900">
              Productos y términos relacionados
            </h2>
            <ul className="mt-4 space-y-2 text-sm text-slate-700">
              {seoContent.inventoryHighlights.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-0.5" style={{ color: "var(--tp-action-primary)" }}>
                    ▲
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-wrap gap-2">
              {seoContent.relatedTerms.map((term) => (
                <span
                  key={term}
                  className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700"
                >
                  {term}
                </span>
              ))}
            </div>
          </article>
        </div>

        <article className="mt-8 rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
          <div className="text-xs uppercase tracking-wide text-slate-500">
            FAQ de {cat.title}
          </div>
          <h2 className="mt-2 text-2xl font-extrabold text-slate-900">
            Preguntas frecuentes
          </h2>
          <div className="mt-4 grid gap-4">
            {categoryFaq.map((item) => (
              <div key={item.q} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="text-sm font-bold text-slate-900">{item.q}</h3>
                <p className="mt-2 text-sm text-slate-700">{item.a}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      {/* Footer nav */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-slate-600">Tornirepuestos</div>
          <div className="flex flex-wrap gap-4 text-sm text-slate-600">
            
            <Link className="hover:text-slate-900" href="/categorias">
              Categorías
            </Link>
            <a className="hover:text-slate-900" href={wa(waText)} target="_blank" rel="noreferrer">
              WhatsApp
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
