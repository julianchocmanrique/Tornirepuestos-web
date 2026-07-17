import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { DEFAULT_OG_IMAGE, absoluteUrl } from "@/lib/seo";
import { getProductLineBySlug, getProductLineImage, productLines } from "@/lib/productLines";
import { wa } from "@/lib/wa";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return productLines.map((line) => ({ slug: line.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const line = getProductLineBySlug(slug);
  if (!line) return {};

  return {
    title: `${line.title} para camiones y buses | Tornirepuestos`,
    description: `${line.summary} Cotiza por WhatsApp con datos de referencia, foto o aplicación del vehículo.`,
    alternates: {
      canonical: `/productos/${line.slug}`,
    },
    openGraph: {
      type: "article",
      url: absoluteUrl(`/productos/${line.slug}`),
      title: `${line.title} | Tornirepuestos`,
      description: line.summary,
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: `${line.title} | Tornirepuestos`,
      description: line.summary,
      images: [DEFAULT_OG_IMAGE],
    },
  };
}

export default async function ProductLinePage({ params }: Props) {
  const { slug } = await params;
  const line = getProductLineBySlug(slug);
  if (!line) notFound();

  const img = getProductLineImage(line.slug);
  const quoteMessage = `Quiero cotizar repuestos de ${line.title}. Tengo estos datos: referencia/foto ____, vehículo ____, ciudad destino ____. ¿Me ayudas con disponibilidad y precio?`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `Cotización de ${line.title} Tornirepuestos`,
    description: line.summary,
    areaServed: "Colombia",
    provider: {
      "@type": "LocalBusiness",
      name: "Tornirepuestos",
      url: absoluteUrl("/"),
    },
    url: absoluteUrl(`/productos/${line.slug}`),
  };

  return (
    <main className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="mx-auto max-w-6xl px-4 py-12">
        <Link
          href="/productos"
          className="inline-flex items-center rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          ← Volver a productos
        </Link>

        <div className="mt-5 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
            <div className="p-6 md:p-8">
              <div className="text-xs uppercase tracking-[0.18em] text-slate-500">{line.kicker}</div>
              <h1 className="mt-2 max-w-3xl text-4xl font-extrabold tracking-tight text-slate-900">
                {line.title} para camiones, buses y maquinaria
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-relaxed text-slate-600">
                {line.summary}
              </p>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600">
                {line.seoIntro}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={`/catalogo?q=${encodeURIComponent(line.catalogQuery)}`}
                  className="inline-flex rounded-xl px-4 py-2 text-sm font-semibold text-white"
                  style={{ background: "var(--tp-action-primary)" }}
                >
                  Buscar {line.title} en catálogo
                </Link>
                <a
                  href={wa(quoteMessage)}
                  className="inline-flex rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cotizar por WhatsApp
                </a>
              </div>
            </div>
            <div className="relative min-h-[280px] bg-slate-900">
              <Image src={img} alt={line.title} fill className="object-cover opacity-90" />
              <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/75 via-slate-950/20 to-transparent" />
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          <section className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Aplicaciones</div>
            <h2 className="mt-2 text-xl font-extrabold text-slate-900">Dónde se usa</h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-700">
              {line.applications.map((item) => (
                <li key={item} className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Productos</div>
            <h2 className="mt-2 text-xl font-extrabold text-slate-900">Qué puedes cotizar</h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-700">
              {line.includes.map((item) => (
                <li key={item} className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Compatibilidad</div>
            <h2 className="mt-2 text-xl font-extrabold text-slate-900">Qué revisamos</h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-700">
              {line.compatibility.map((item) => (
                <li key={item} className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  {item}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Para cotizar rápido
          </div>
          <h2 className="mt-2 text-2xl font-extrabold text-slate-900">
            Datos que nos ayudan a encontrar la referencia correcta
          </h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {line.quoteData.map((item) => (
              <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm font-bold text-slate-900">{item}</div>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                  Si lo tienes a mano, envíalo por WhatsApp para validar disponibilidad y precio.
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-slate-200 bg-slate-900 p-6 text-white shadow-sm">
          <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <h2 className="text-2xl font-extrabold">¿No sabes la referencia exacta?</h2>
              <p className="mt-2 text-sm leading-relaxed text-white/75">
                Envíanos una foto, medida o descripción. Te orientamos para buscar el repuesto de
                {" "}{line.title.toLowerCase()} más cercano a tu aplicación.
              </p>
            </div>
            <a
              href={wa(quoteMessage)}
              className="inline-flex justify-center rounded-xl px-4 py-3 text-sm font-semibold text-white"
              style={{ background: "var(--tp-action-primary)" }}
            >
              Enviar datos por WhatsApp
            </a>
          </div>
        </section>
      </section>
    </main>
  );
}
