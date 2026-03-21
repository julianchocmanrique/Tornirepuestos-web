import Image from "next/image";

const brand = {
  name: "TORNIREPUESTOS",
  tagline: "Soluciones en Tornería y Repuestos Industriales",
  subtitle:
    "Fabricación, reparación y mecanizado de piezas con precisión para la industria, maquinaria y vehículos.",
  colors: {
    blue: "#0F2A44",
    orange: "#EF4444", // red
    // Mantengo la key "orange" para no tocar más código; ahora es el color acento (rojo).

    grayBg: "#F3F4F6",
    text: "#1F2937",
  },
};

const services = [
  {
    title: "Tornería industrial",
    desc: "Fabricación y reparación de componentes con tolerancias exigentes.",
  },
  {
    title: "Mecanizado de precisión",
    desc: "Procesos de mecanizado para piezas críticas y ajustes finos.",
  },
  {
    title: "Piezas a medida",
    desc: "Fabricación personalizada según muestra, plano o necesidad.",
  },
  {
    title: "Reparación de componentes",
    desc: "Recuperación y adaptación de piezas para extender la vida útil.",
  },
  {
    title: "Adaptación de piezas",
    desc: "Modificación y ajuste de repuestos para compatibilidad y desempeño.",
  },
  {
    title: "Suministro de repuestos",
    desc: "Repuestos industriales y componentes metálicos bajo requerimiento.",
  },
];

const products = [
  {
    name: "Ejes",
    desc: "Ejes para maquinaria y aplicaciones automotrices.",
  },
  { name: "Bujes", desc: "Bujes, casquillos y componentes de desgaste." },
  { name: "Engranajes", desc: "Engranajes y piezas dentadas (según especificación)." },
  { name: "Pernos especiales", desc: "Pernos y fijaciones a medida." },
  { name: "Piezas mecanizadas", desc: "Piezas metálicas de alta precisión." },
  { name: "Componentes personalizados", desc: "Fabricación por plano o muestra." },
];

const why = [
  "Experiencia técnica",
  "Fabricación personalizada",
  "Materiales de alta calidad",
  "Rapidez en entrega",
  "Soluciones confiables",
];

const steps = [
  { title: "Diagnóstico", desc: "Entendemos la necesidad, tolerancias y aplicación." },
  { title: "Diseño / adaptación", desc: "Proponemos solución y especificaciones." },
  { title: "Fabricación", desc: "Mecanizado y procesos en taller." },
  { title: "Control de calidad", desc: "Revisión dimensional y ajuste." },
  { title: "Entrega", desc: "Entrega y soporte para instalación." },
];

function Button({
  children,
  href,
  variant = "primary",
}: {
  children: React.ReactNode;
  href: string;
  variant?: "primary" | "secondary";
}) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition";
  const styles =
    variant === "primary"
      ? "bg-red-500 text-white hover:bg-red-600"
      : "border border-white/20 bg-white/5 text-white hover:bg-white/10";
  return (
    <a className={`${base} ${styles}`} href={href}>
      {children}
    </a>
  );
}

export default function Page() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-slate-200 bg-white">
                <Image
                  src="/logo-tornirepuestos.jpg"
                  alt="Logo Tornirepuestos"
                  fill
                  className="object-contain p-1"
                  priority
                />
              </div>
              <div className="leading-tight">
                <div className="text-sm font-extrabold tracking-wide" style={{ color: brand.colors.blue }}>
                  {brand.name}
                </div>
                <div className="text-xs text-slate-600">Colombia · Tornería & Repuestos</div>
              </div>
            </div>
          </div>

          <nav className="hidden items-center gap-6 text-sm text-slate-700 md:flex">
            <a className="hover:text-slate-900" href="#inicio">
              Inicio
            </a>
            <a className="hover:text-slate-900" href="#servicios">
              Servicios
            </a>
            <a className="hover:text-slate-900" href="#productos">
              Productos
            </a>
            <a className="hover:text-slate-900" href="#nosotros">
              Nosotros
            </a>
            <a className="hover:text-slate-900" href="#contacto">
              Contacto
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <a
              className="hidden rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 md:inline-flex"
              href="#contacto"
              title="Teléfono"
            >
              📞
            </a>
            <a
              className="hidden rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 md:inline-flex"
              href="#cotizacion"
              title="WhatsApp"
            >
              💬
            </a>
            <a
              className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold text-white"
              style={{ background: brand.colors.orange }}
              href="#cotizacion"
            >
              Solicitar Cotización
            </a>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section id="inicio" className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?auto=format&fit=crop&w=2400&q=70"
            alt="Taller de mecanizado"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/70 to-slate-950/20" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 py-20">
          <div className="max-w-2xl text-white">
            <div className="text-xs uppercase tracking-wide text-white/70">
              Industria · Precisión · Repuestos
            </div>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
              {brand.tagline}
            </h1>
            <p className="mt-4 text-lg text-white/80">{brand.subtitle}</p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="#cotizacion" variant="primary">
                Solicitar Cotización
              </Button>
              <Button href="#servicios" variant="secondary">
                Ver Servicios
              </Button>
            </div>

            <div className="mt-8 grid gap-2 text-sm text-white/80 sm:grid-cols-3">
              <div className="rounded-xl border border-white/15 bg-white/5 px-4 py-3">
                ✔ Fabricación a medida
              </div>
              <div className="rounded-xl border border-white/15 bg-white/5 px-4 py-3">
                ✔ Alta precisión
              </div>
              <div className="rounded-xl border border-white/15 bg-white/5 px-4 py-3">
                ✔ Experiencia técnica
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="servicios" className="mx-auto max-w-6xl px-4 py-14">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-500">Servicios</div>
            <h2 className="mt-2 text-3xl font-extrabold" style={{ color: brand.colors.blue }}>
              Nuestros Servicios
            </h2>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <div
              key={s.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div
                className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl text-white"
                style={{ background: brand.colors.blue }}
              >
                ⚙️
              </div>
              <div className="text-lg font-bold">{s.title}</div>
              <p className="mt-2 text-sm text-slate-600">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRODUCTS */}
      <section id="productos" className="bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <div className="text-xs uppercase tracking-wide text-slate-500">Productos</div>
          <h2 className="mt-2 text-3xl font-extrabold" style={{ color: brand.colors.blue }}>
            Repuestos y Componentes
          </h2>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <div key={p.name} className="rounded-2xl border border-slate-200 bg-white p-6">
                <div className="text-lg font-bold">{p.name}</div>
                <p className="mt-2 text-sm text-slate-600">{p.desc}</p>
                <a
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold"
                  style={{ color: brand.colors.orange }}
                  href="#cotizacion"
                >
                  Consultar →
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY */}
      <section id="nosotros" className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-500">Nosotros</div>
            <h2 className="mt-2 text-3xl font-extrabold" style={{ color: brand.colors.blue }}>
              ¿Por qué elegir Tornirepuestos?
            </h2>
            <p className="mt-4 text-slate-600">
              Somos un taller orientado a resultados: precisión, calidad y tiempos claros.
              Trabajamos con industria, automotriz y mantenimiento.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {why.map((w) => (
                <div key={w} className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                  ✅ {w}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-sm font-bold" style={{ color: brand.colors.blue }}>
              Cómo trabajamos
            </div>
            <div className="mt-4 grid gap-3">
              {steps.map((st, idx) => (
                <div key={st.title} className="flex gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-white"
                    style={{ background: brand.colors.orange }}
                  >
                    {idx + 1}
                  </div>
                  <div>
                    <div className="font-semibold">{st.title}</div>
                    <div className="text-sm text-slate-600">{st.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* QUOTE */}
      <section id="cotizacion" className="bg-slate-950">
        <div className="mx-auto max-w-6xl px-4 py-14 text-white">
          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <div className="text-xs uppercase tracking-wide text-white/60">Cotización</div>
              <h2 className="mt-2 text-3xl font-extrabold">Solicita tu cotización</h2>
              <p className="mt-4 text-white/75">
                Cuéntanos qué necesitas (pieza, reparación o repuesto). Te respondemos con una propuesta.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  className="rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-black"
                  href="#contacto"
                >
                  Enviar solicitud
                </a>
                <a
                  className="rounded-2xl border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold"
                  href="https://wa.me/57"
                  target="_blank"
                  rel="noreferrer"
                >
                  WhatsApp
                </a>
              </div>
            </div>

            <form className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="grid gap-3 sm:grid-cols-2">
                <input className="rounded-xl bg-black/30 p-3 text-sm placeholder:text-white/40" placeholder="Nombre" />
                <input className="rounded-xl bg-black/30 p-3 text-sm placeholder:text-white/40" placeholder="Empresa" />
                <input className="rounded-xl bg-black/30 p-3 text-sm placeholder:text-white/40" placeholder="Teléfono" />
                <input className="rounded-xl bg-black/30 p-3 text-sm placeholder:text-white/40" placeholder="Correo" />
                <textarea
                  className="sm:col-span-2 rounded-xl bg-black/30 p-3 text-sm placeholder:text-white/40"
                  placeholder="Describe tu solicitud"
                  rows={5}
                />
              </div>
              <button
                type="button"
                className="mt-4 w-full rounded-xl px-4 py-3 text-sm font-semibold text-white"
                style={{ background: brand.colors.orange }}
              >
                Enviar
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contacto" className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-500">Contacto</div>
            <h2 className="mt-2 text-3xl font-extrabold" style={{ color: brand.colors.blue }}>
              Contáctanos
            </h2>
            <div className="mt-4 grid gap-3 text-slate-700">
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="text-sm font-bold">Teléfono</div>
                <div className="mt-1 text-sm text-slate-600">(pendiente)</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="text-sm font-bold">WhatsApp</div>
                <div className="mt-1 text-sm text-slate-600">(pendiente)</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="text-sm font-bold">Dirección</div>
                <div className="mt-1 text-sm text-slate-600">Colombia</div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <div className="text-sm font-bold" style={{ color: brand.colors.blue }}>
              Ubicación
            </div>
            <p className="mt-3 text-sm text-slate-600">
              Aquí pondremos un mapa cuando nos compartas la dirección exacta.
            </p>
            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
              Mapa (pendiente)
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm font-extrabold" style={{ color: brand.colors.blue }}>
              {brand.name}
            </div>
            <div className="text-xs text-slate-500">© 2026 Tornirepuestos</div>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-slate-600">
            <a className="hover:text-slate-900" href="#inicio">
              Inicio
            </a>
            <a className="hover:text-slate-900" href="#servicios">
              Servicios
            </a>
            <a className="hover:text-slate-900" href="#productos">
              Productos
            </a>
            <a className="hover:text-slate-900" href="#contacto">
              Contacto
            </a>
          </div>
        </div>
      </footer>

      {/* WhatsApp floating */}
      <a
        href="#cotizacion"
        className="fixed bottom-5 right-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-lg"
        style={{ background: brand.colors.orange }}
        aria-label="WhatsApp"
      >
        💬
      </a>
    </div>
  );
}
