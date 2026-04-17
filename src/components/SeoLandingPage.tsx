import Link from "next/link";
import Image from "next/image";

import type { SeoSolution } from "@/lib/seoSolutions";
import { wa } from "@/lib/wa";

type Props = {
  solution: SeoSolution;
};

export function SeoLandingPage({ solution }: Props) {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: solution.faqs.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <main className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
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
