import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata = {
  title: "Tornirepuestos · Nosotros",
  description:
    "Conoce la historia de Tornirepuestos: más de 20 años comercializando repuestos para vehículos pesados en Colombia.",
};

import { COPY } from "@/lib/content";

const ACCENT = "var(--tp-action-primary)";

export default function Page() {
  return (
    <div className="min-h-screen bg-white">
      
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-4 py-14">
        <div className="text-xs uppercase tracking-wide text-slate-500">Nosotros</div>
        <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-slate-900">
          Repuestos con respaldo
        </h1>
        <p className="mt-4 max-w-3xl text-slate-600">
          Con más de 20 años de trayectoria, trabajamos para que nuestros clientes
          tengan la tranquilidad de contar con un aliado confiable en repuestos para
          vehículos pesados.
        </p>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
            <h2 className="text-lg font-extrabold text-slate-900">{COPY.quienesSomos.title}</h2>
            {COPY.quienesSomos.paragraphs.map((p) => (
              <p key={p} className="mt-3 text-sm leading-relaxed text-slate-700">
                {p}
              </p>
            ))}

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                "+20 años de experiencia",
                "Distribuidores directos",
                "Repuestos de excelente calidad",
                "Logística a convenir",
              ].map((x) => (
                <div
                  key={x}
                  className="flex items-center gap-3 rounded-3xl bg-[var(--tp-surface-card)] px-6 py-4 text-white shadow-[0_18px_60px_rgba(2,6,23,0.35)]"
                >
                  <span style={{ color: ACCENT }}>▲</span>
                  <span className="text-base font-semibold">{x}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
            <h2 className="text-lg font-extrabold text-slate-900">{COPY.historia.title}</h2>
            {COPY.historia.paragraphs.map((p) => (
              <p key={p} className="mt-3 text-sm leading-relaxed text-slate-700">
                {p}
              </p>
            ))}
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
            <h2 className="text-lg font-extrabold text-slate-900">{COPY.filosofia.title}</h2>
            {COPY.filosofia.paragraphs.map((p) => (
              <p key={p} className="mt-3 text-sm leading-relaxed text-slate-700">
                {p}
              </p>
            ))}
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
            <h2 className="text-lg font-extrabold text-slate-900">{COPY.porqueElegir.title}</h2>
            {COPY.porqueElegir.paragraphs.map((p) => (
              <p key={p} className="mt-3 text-sm leading-relaxed text-slate-700">
                {p}
              </p>
            ))}
            <div className="mt-6 rounded-3xl bg-slate-50 p-6">
              <div className="text-sm font-extrabold text-slate-900">20+ años</div>
              <div className="mt-1 text-sm text-slate-600">
                de experiencia y aprendizaje junto a nuestros clientes.
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-slate-600">
          © 2026 Tornirepuestos
        </div>
      </footer>
    </div>
  );
}
