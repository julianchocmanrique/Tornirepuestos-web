import type { Metadata } from "next";

import { DEFAULT_OG_IMAGE, absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Política de Tratamiento de Datos",
  description:
    "Conoce la política de tratamiento de datos personales de Tornirepuestos y los canales para ejercer tus derechos.",
  alternates: {
    canonical: "/politica-tratamiento-datos",
  },
  openGraph: {
    type: "website",
    url: absoluteUrl("/politica-tratamiento-datos"),
    title: "Política de Tratamiento de Datos | Tornirepuestos",
    description:
      "Conoce cómo tratamos los datos personales y cómo puedes ejercer tus derechos en Tornirepuestos.",
    images: [DEFAULT_OG_IMAGE],
  },
};

export default function PoliticaTratamientoDatosPage() {
  const sections = [
    {
      id: "responsable",
      title: "1. Responsable",
      body: "Tornirepuestos es responsable del tratamiento de los datos personales recolectados a través de este sitio web y de sus canales de atención.",
    },
    {
      id: "finalidad",
      title: "2. Finalidad del tratamiento",
      body: "Usamos la información para atender solicitudes, cotizaciones, seguimiento comercial, servicio al cliente, mejora de procesos y cumplimiento de obligaciones legales.",
    },
    {
      id: "datos",
      title: "3. Datos que recolectamos",
      body: "Podemos tratar datos como nombre, teléfono, correo electrónico, empresa, ciudad, placa o referencia técnica compartida para cotización.",
    },
    {
      id: "derechos",
      title: "4. Derechos del titular",
      body: "Puedes conocer, actualizar, rectificar y solicitar supresión de tus datos, además de revocar autorizaciones cuando aplique.",
    },
    {
      id: "canales",
      title: "5. Canales de atención",
      body: "Para ejercer tus derechos o resolver dudas, escríbenos a ventas@tornirepuestos.com o contáctanos al +57 310 653 1208.",
    },
  ];

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#eef4ff_0%,#f8fafc_22%,#f8fafc_100%)] text-slate-900">
      <section className="mx-auto max-w-6xl px-4 py-10 sm:py-12">
        <header className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_12px_40px_-25px_rgba(15,23,42,0.45)] sm:p-10">
          <div className="pointer-events-none absolute -right-20 -top-16 h-56 w-56 rounded-full bg-blue-100/70 blur-2xl" />
          <div className="pointer-events-none absolute -left-16 -bottom-20 h-56 w-56 rounded-full bg-red-100/60 blur-2xl" />
          <div className="relative">
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
              Legal
            </div>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">
          Política de Tratamiento de Datos Personales
            </h1>
            <p className="mt-4 text-sm text-slate-600 sm:text-base">
              Última actualización: <strong>18 de mayo de 2026</strong>.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                Responsable: <strong>Tornirepuestos</strong>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                Canal: <strong>ventas@tornirepuestos.com</strong>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                Teléfono: <strong>+57 310 653 1208</strong>
              </div>
            </div>
          </div>
        </header>

        <div className="mt-6 grid gap-6 lg:grid-cols-[0.85fr_1.9fr]">
          <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-24">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Índice
            </p>
            <nav className="mt-3 space-y-1.5">
              {sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="block rounded-xl border border-transparent px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-200 hover:bg-slate-50 hover:text-slate-900"
                >
                  {section.title}
                </a>
              ))}
            </nav>
          </aside>

          <div className="space-y-4">
            {sections.map((section, idx) => (
              <section
                key={section.id}
                id={section.id}
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 sm:p-6"
              >
                <div className="flex items-start gap-3">
                  <div
                    className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-extrabold text-white"
                    style={{
                      background:
                        idx % 2 === 0
                          ? "linear-gradient(135deg,#0f172a,#1d4ed8)"
                          : "linear-gradient(135deg,#0f172a,#dc2626)",
                    }}
                  >
                    {idx + 1}
                  </div>
                  <h2 className="text-xl font-extrabold text-slate-900 sm:text-2xl">
                    {section.title.replace(/^\d+\.\s*/, "")}
                  </h2>
                </div>
                {section.id === "canales" ? (
                  <p className="mt-3 text-base leading-relaxed text-slate-700">
                    Para ejercer tus derechos o resolver dudas, escríbenos a{" "}
                    <a
                      href="mailto:ventas@tornirepuestos.com"
                      className="font-semibold text-[var(--tp-action-primary)] underline-offset-2 hover:underline"
                    >
                      ventas@tornirepuestos.com
                    </a>{" "}
                    o contáctanos al{" "}
                    <a
                      href="tel:+573106531208"
                      className="font-semibold text-[var(--tp-action-primary)] underline-offset-2 hover:underline"
                    >
                      +57 310 653 1208
                    </a>
                    .
                  </p>
                ) : (
                  <p className="mt-3 text-base leading-relaxed text-slate-700">
                    {section.body}
                  </p>
                )}
              </section>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
