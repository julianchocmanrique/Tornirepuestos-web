import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Prueba Baile",
  description: "Página independiente de prueba para contenido de baile.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function PruebaBailePage() {
  return (
    <main className="relative min-h-[calc(100vh-72px)] overflow-hidden bg-[#07111f] text-white">
      <div
        className="absolute inset-0 opacity-70"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(circle at 18% 20%, rgba(225, 6, 0, 0.34), transparent 30%), radial-gradient(circle at 82% 72%, rgba(28, 83, 138, 0.42), transparent 34%), linear-gradient(135deg, #07111f 0%, #101d34 52%, #050912 100%)",
        }}
      />

      <section className="relative mx-auto flex min-h-[calc(100vh-72px)] max-w-6xl items-center px-4 py-16">
        <div className="grid w-full gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-red-400">
              Página independiente
            </p>
            <h1 className="mt-4 max-w-3xl text-5xl font-black tracking-tight sm:text-6xl lg:text-7xl">
              Prueba Baile
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
              Este espacio quedó creado para construir y probar el contenido de baile sin
              modificar las demás páginas de Tornirepuestos.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <span className="rounded-full border border-white/15 bg-white/8 px-4 py-2 text-sm font-semibold text-slate-200">
                Ruta separada
              </span>
              <span className="rounded-full border border-white/15 bg-white/8 px-4 py-2 text-sm font-semibold text-slate-200">
                Lista para editar
              </span>
              <span className="rounded-full border border-white/15 bg-white/8 px-4 py-2 text-sm font-semibold text-slate-200">
                No visible en el menú
              </span>
            </div>

            <Link
              href="/"
              className="mt-10 inline-flex rounded-2xl bg-red-600 px-6 py-3 text-sm font-extrabold text-white transition-colors hover:bg-red-700"
            >
              Volver al inicio
            </Link>
          </div>

          <div className="relative mx-auto aspect-square w-full max-w-md">
            <div className="absolute inset-[8%] rounded-full border border-white/10" />
            <div className="absolute inset-[20%] rounded-full border border-red-500/30" />
            <div className="absolute left-[17%] top-[12%] h-28 w-28 rounded-full bg-red-600/50 blur-3xl" />
            <div className="absolute bottom-[10%] right-[12%] h-36 w-36 rounded-full bg-blue-500/35 blur-3xl" />
            <div className="absolute inset-[28%] grid place-items-center rounded-full border border-white/15 bg-white/10 shadow-2xl backdrop-blur-xl">
              <span className="text-center text-5xl font-black tracking-tighter sm:text-6xl">PB</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
