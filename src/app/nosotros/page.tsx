import Link from "next/link";

export const metadata = {
  title: "Tornirepuestos · Nosotros",
  description:
    "Conoce la historia de Tornirepuestos: más de 20 años comercializando repuestos para vehículos pesados en Colombia.",
};

import { COPY } from "@/lib/content";

const ACCENT = "#E10600";

export default function Page() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 bg-slate-950/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-sm font-extrabold text-white">
            ← Volver
          </Link>
          <div className="text-sm font-semibold text-white/80">Nosotros</div>
          <div className="w-16" />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-14">
        <div className="text-xs uppercase tracking-wide text-white/60">Nosotros</div>
        <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-white">
          Repuestos con respaldo
        </h1>
        <p className="mt-4 max-w-3xl text-white/75">
          Con más de 20 años de trayectoria, trabajamos para que nuestros clientes
          tengan la tranquilidad de contar con un aliado confiable en repuestos para
          vehículos pesados.
        </p>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <section className="rounded-3xl border border-white/10 bg-slate-950/40 p-7 shadow-[0_18px_60px_rgba(2,6,23,0.55)] backdrop-blur">
            <h2 className="text-lg font-extrabold text-white">{COPY.quienesSomos.title}</h2>
            {COPY.quienesSomos.paragraphs.map((p) => (
              <p key={p} className="mt-3 text-sm leading-relaxed text-white/75">
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
                  className="flex items-center gap-3 rounded-3xl bg-slate-700/90 px-6 py-4 text-white shadow-[0_18px_60px_rgba(2,6,23,0.35)]"
                >
                  <span style={{ color: ACCENT }}>▲</span>
                  <span className="text-base font-semibold">{x}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-slate-950/40 p-7 shadow-[0_18px_60px_rgba(2,6,23,0.55)] backdrop-blur">
            <h2 className="text-lg font-extrabold text-white">{COPY.historia.title}</h2>
            {COPY.historia.paragraphs.map((p) => (
              <p key={p} className="mt-3 text-sm leading-relaxed text-white/75">
                {p}
              </p>
            ))}
          </section>

          <section className="rounded-3xl border border-white/10 bg-slate-950/40 p-7 shadow-[0_18px_60px_rgba(2,6,23,0.55)] backdrop-blur">
            <h2 className="text-lg font-extrabold text-white">{COPY.filosofia.title}</h2>
            {COPY.filosofia.paragraphs.map((p) => (
              <p key={p} className="mt-3 text-sm leading-relaxed text-white/75">
                {p}
              </p>
            ))}
          </section>

          <section className="rounded-3xl border border-white/10 bg-slate-950/40 p-7 shadow-[0_18px_60px_rgba(2,6,23,0.55)] backdrop-blur">
            <h2 className="text-lg font-extrabold text-white">{COPY.porqueElegir.title}</h2>
            {COPY.porqueElegir.paragraphs.map((p) => (
              <p key={p} className="mt-3 text-sm leading-relaxed text-white/75">
                {p}
              </p>
            ))}
            <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="text-sm font-extrabold text-white">20+ años</div>
              <div className="mt-1 text-sm text-white/70">
                de experiencia y aprendizaje junto a nuestros clientes.
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="border-t border-white/10 bg-slate-950">
        <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-white/60">
          © 2026 Tornirepuestos
        </div>
      </footer>
    </div>
  );
}
