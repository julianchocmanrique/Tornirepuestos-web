import Link from "next/link";

export const metadata = {
  title: "Tornirepuestos · Nosotros",
  description:
    "Conoce la historia de Tornirepuestos: más de 20 años comercializando repuestos para vehículos pesados en Colombia.",
};

export default function Page() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-sm font-extrabold text-slate-900">
            ← Volver
          </Link>
          <div className="text-sm font-semibold text-slate-700">Nosotros</div>
          <div className="w-16" />
        </div>
      </header>

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
            <h2 className="text-lg font-extrabold text-slate-900">¿Quiénes somos?</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-700">
              Somos una empresa confiable, con más de 20 años de trayectoria en el
              mercado, líderes en el servicio de comercialización de partes y piezas
              para vehículos tipo pesado en todo el país. Somos distribuidores directos
              de marcas mundialmente conocidas y marcas nacionales con repuestos de
              excelente calidad.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-slate-700">
              Contamos con capacidad de logística y administración para que nuestros
              clientes tengan el respaldo y la confianza de saber que somos una empresa
              que los apoyará y será su aliada en el camino.
            </p>

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
                  <span className="text-white/70">✔</span>
                  <span className="text-base font-semibold">{x}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
            <h2 className="text-lg font-extrabold text-slate-900">Nuestra historia</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-700">
              En el año 2002, gracias a la poca oferta de productos en el sector donde
              se concentraba el transporte en la ciudad de Santa Marta, nace
              Tornirepuestos en un contenedor ubicado en el centro de talleres de
              mecánica.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-slate-700">
              Tuvimos gran acogida. Con esfuerzo y dedicación fuimos creciendo. Hoy
              somos una gran familia, incluyendo a nuestros colaboradores, proveedores
              y clientes, y ya son más de veinte años complacidos y comprometidos en
              seguir atendiendo a nuestra distinguida clientela.
            </p>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
            <h2 className="text-lg font-extrabold text-slate-900">
              Filosofía de Tornirepuestos
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-700">
              Para Tornirepuestos lo principal es la satisfacción de nuestros clientes.
              Queremos ofrecer más que un servicio: un acompañamiento constante.
              Queremos que siempre puedan contar con nosotros para apoyarlos en lo que
              necesiten, y así, con esfuerzo y trabajo, mantener su credibilidad en
              nosotros.
            </p>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
            <h2 className="text-lg font-extrabold text-slate-900">
              ¿Por qué elegir Tornirepuestos?
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-700">
              A lo largo de nuestra trayectoria hemos mantenido un excelente servicio y
              cumplimiento con nuestros clientes. Estamos en constante búsqueda del
              mejoramiento y de alternativas que faciliten la tarea de nuestros
              clientes en su día a día.
            </p>
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
