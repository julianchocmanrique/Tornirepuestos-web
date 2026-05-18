import type { Metadata } from "next";

import { DEFAULT_OG_IMAGE, absoluteUrl } from "@/lib/seo";
import { BuzonForm } from "./BuzonForm";

export const metadata: Metadata = {
  title: "Buzón de Sugerencias",
  description:
    "Envíanos tus sugerencias sobre atención, productos y experiencia web de Tornirepuestos.",
  alternates: {
    canonical: "/buzon-sugerencias",
  },
  openGraph: {
    type: "website",
    url: absoluteUrl("/buzon-sugerencias"),
    title: "Buzón de Sugerencias | Tornirepuestos",
    description:
      "Comparte tus sugerencias para mejorar la atención y experiencia en Tornirepuestos.",
    images: [DEFAULT_OG_IMAGE],
  },
};

export default function BuzonSugerenciasPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="mx-auto max-w-4xl px-4 py-14">
        <div className="text-xs uppercase tracking-wide text-slate-500">Atención al cliente</div>
        <h1 className="mt-2 text-4xl font-extrabold tracking-tight">Buzón de Sugerencias</h1>
        <p className="mt-3 max-w-3xl text-sm text-slate-600">
          Queremos mejorar contigo. Déjanos tus recomendaciones sobre servicio,
          tiempos de respuesta, catálogo o funcionamiento de la web.
        </p>

        <div className="mt-8">
          <BuzonForm />
        </div>
      </section>
    </main>
  );
}
