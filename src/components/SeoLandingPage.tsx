import Link from "next/link";
import Image from "next/image";

import type { SeoSolution } from "@/lib/seoSolutions";
import { absoluteUrl } from "@/lib/seo";
import { wa } from "@/lib/wa";

type Props = {
  solution: SeoSolution;
};

export function SeoLandingPage({ solution }: Props) {
  const pageUrl = absoluteUrl(`/${solution.slug}`);

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: solution.faqs.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Soluciones", item: absoluteUrl("/catalogo") },
      { "@type": "ListItem", position: 3, name: solution.title, item: pageUrl },
    ],
  };

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: solution.h1,
    areaServed: "CO",
    serviceType: solution.title,
    description: solution.summary,
    provider: {
      "@type": "AutoPartsStore",
      name: "Tornirepuestos",
      url: absoluteUrl("/"),
    },
    url: pageUrl,
  };

  return (
    <main className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-50 via-white to-slate-50 p-6">
          <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Solución</div>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-slate-900">
            {solution.h1}
          </h1>
          <p className="mt-3 max-w-3xl text-sm text-slate-600">{solution.intro}</p>
          {solution.heroImage ? (
            <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <Image
                src={solution.heroImage.src}
                alt={solution.heroImage.alt}
                width={1024}
                height={576}
                className="h-auto w-full object-cover"
                priority
              />
            </div>
          ) : null}
          <div className="mt-5 flex flex-wrap gap-2">
            {solution.searchTerms.map((term) => (
              <span
                key={term}
                className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700"
              >
                {term}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-extrabold text-slate-900">Aplicaciones frecuentes</h2>
            <ul className="mt-4 space-y-2 text-sm text-slate-700">
              {solution.useCases.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-0.5 text-red-600">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-extrabold text-slate-900">Cómo cotizar mejor</h2>
            <ul className="mt-4 space-y-2 text-sm text-slate-700">
              {solution.buyingTips.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-0.5 text-red-600">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={wa(`Hola, quiero cotizar ${solution.title}. ¿Me ayudas con disponibilidad y precio?`)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold text-white"
                style={{ background: "var(--tp-action-primary)" }}
              >
                Cotizar por WhatsApp
              </a>
              <Link
                href={`/categorias/${solution.relatedCategorySlug}`}
                className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Ver categoría relacionada
              </Link>
            </div>
          </article>
        </div>

        <article className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-extrabold text-slate-900">Guía de compra y compatibilidad</h2>
          <div className="mt-4 space-y-4 text-sm text-slate-700">
            {solution.longIntro.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </article>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-extrabold text-slate-900">Síntomas comunes</h2>
            <ul className="mt-4 space-y-2 text-sm text-slate-700">
              {solution.symptoms.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-0.5 text-red-600">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-extrabold text-slate-900">Checklist antes de comprar</h2>
            <ul className="mt-4 space-y-2 text-sm text-slate-700">
              {solution.compatibilityChecklist.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-0.5 text-red-600">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>
        </div>

        <article className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-extrabold text-slate-900">Proceso de cotización</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {solution.processSteps.map((step, idx) => (
              <div key={step.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Paso {idx + 1}
                </div>
                <h3 className="mt-1 text-base font-bold text-slate-900">{step.title}</h3>
                <p className="mt-2 text-sm text-slate-700">{step.description}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-extrabold text-slate-900">Cobertura y atención</h2>
          <ul className="mt-4 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
            {solution.serviceCoverage.map((item) => (
              <li key={item} className="flex gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <span className="mt-0.5 text-red-600">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </article>

        {solution.contentBlocks.map((block) => (
          <article
            key={block.title}
            className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-2xl font-extrabold text-slate-900">{block.title}</h2>
            <div className="mt-4 space-y-4 text-sm text-slate-700">
              {block.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            {block.bullets.length > 0 ? (
              <ul className="mt-4 space-y-2 text-sm text-slate-700">
                {block.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-2">
                    <span className="mt-0.5 text-red-600">•</span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </article>
        ))}

        <article className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-extrabold text-slate-900">Términos relacionados</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {solution.relatedSearches.map((term) => (
              <span
                key={term}
                className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700"
              >
                {term}
              </span>
            ))}
          </div>
        </article>

        <article className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-extrabold text-slate-900">Preguntas frecuentes</h2>
          <div className="mt-4 grid gap-3">
            {solution.faqs.map((item) => (
              <div key={item.q} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="text-sm font-bold text-slate-900">{item.q}</h3>
                <p className="mt-2 text-sm text-slate-700">{item.a}</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
