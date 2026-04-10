import Link from "next/link";
import type { Metadata } from "next";

import { DEFAULT_OG_IMAGE, absoluteUrl } from "@/lib/seo";
import { wa } from "@/lib/wa";

export const metadata: Metadata = {
  title: "Preguntas Frecuentes",
  description: "Preguntas frecuentes de Tornirepuestos sobre cotizaciones, compatibilidad y envíos.",
  alternates: {
    canonical: "/preguntas",
  },
  openGraph: {
    type: "website",
    url: absoluteUrl("/preguntas"),
    title: "Preguntas Frecuentes | Tornirepuestos",
    description: "Preguntas frecuentes de Tornirepuestos sobre cotizaciones, compatibilidad y envíos.",
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Preguntas Frecuentes | Tornirepuestos",
    description: "Preguntas frecuentes de Tornirepuestos sobre cotizaciones, compatibilidad y envíos.",
    images: [DEFAULT_OG_IMAGE],
  },
};

const faqs = [
  {
    q: "¿Cómo hago una cotización?",
    a: "Escríbenos por WhatsApp con placa, referencia o una foto clara de la pieza. Si tienes medidas o marca/modelo, mejor.",
  },
  {
    q: "¿Hacen envíos a otras ciudades?",
    a: "Sí. Coordinamos envíos a todo Colombia y te confirmamos tiempos según destino.",
  },
  {
    q: "¿Atienden qué tipo de vehículos?",
    a: "Vehículos pesados, buses y maquinaria. También atendemos flotas y talleres.",
  },
  {
    q: "¿Puedo cotizar con solo una foto?",
    a: "Sí. Una foto bien tomada + datos básicos ayuda a validar compatibilidad.",
  },
  {
    q: "¿Cómo sé si la pieza es compatible?",
    a: "Te ayudamos a validar compatibilidad antes de comprar para evitar devoluciones y pérdidas de tiempo.",
  },
];

export default function PreguntasPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <main className="mx-auto max-w-6xl px-4 py-14">
        <div className="text-xs uppercase tracking-wide text-slate-500">Preguntas</div>
        <h1 className="mt-2 text-4xl font-extrabold tracking-tight">Preguntas frecuentes</h1>
        <p className="mt-3 max-w-3xl text-sm text-slate-600">
          Resolvemos las dudas más comunes para que cotices rápido y con seguridad.
        </p>

        <div className="mt-8 grid gap-4">
          {faqs.map((f) => (
            <article key={f.q} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-base font-bold text-slate-900">{f.q}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">{f.a}</p>
            </article>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <a
            href={wa("Hola, quiero cotizar un repuesto. ¿Me ayudan por favor?")}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold text-white"
            style={{ background: "var(--tp-action-primary)" }}
          >
            Cotizar por WhatsApp
          </a>
          <Link
            href="/categorias"
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Ver categorías
          </Link>
        </div>
      </main>
    </div>
  );
}
