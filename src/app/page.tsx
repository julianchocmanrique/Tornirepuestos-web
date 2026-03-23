import Image from "next/image";

const brand = {
  name: "TORNIREPUESTOS",
  tagline: "Repuestos para vehículos pesados · Buses · Maquinaria",
  subtitle:
    "Cotiza por WhatsApp en minutos. Envíos a todo Colombia (a convenir) y asesoría para encontrar la pieza correcta.",
  colors: {
    blue: "#0F2A44",
    accent: "#EF4444", // premium red
  },
};

const WHATSAPP_PHONE_E164 = "573106531208";
const WHATSAPP_LINK = `https://api.whatsapp.com/send?phone=${WHATSAPP_PHONE_E164}`;

function wa(text: string) {
  return `${WHATSAPP_LINK}&text=${encodeURIComponent(text)}`;
}

const trust = [
  { k: "+20 años", v: "Trayectoria" },
  { k: "Envíos", v: "A todo Colombia (a convenir)" },
  { k: "Asesoría", v: "Para flotas y talleres" },
  { k: "Stock", v: "Rotación constante" },
];

const categories = [
  { title: "Frenos", desc: "Bandas, disco, cámaras, válvulas, accesorios" },
  { title: "Filtración", desc: "Filtros de aceite, aire, combustible, separadores" },
  { title: "Suspensión", desc: "Rígida y neumática" },
  { title: "Motor", desc: "Componentes, sellos, empaques, consumibles" },
  { title: "Eléctricos y luces", desc: "Lámparas, stops, bombillos, conectores" },
  { title: "Transmisión", desc: "Fuller, crucetas, cardanes" },
  { title: "Rodamientos y retenedores", desc: "Rodamientos, retenes, kits" },
  { title: "Mangueras y racorería", desc: "Aire de servicio, abrazaderas, accesorios" },
  { title: "Lubricantes y grasas", desc: "Lubricantes, grasas, aditivos" },
  { title: "Tornillería", desc: "Tornillería en general" },
  { title: "Herramientas", desc: "Apoyo para taller" },
  { title: "Diferenciales", desc: "Componentes y repuestos" },
];

const highlights = [
  {
    title: "Cotiza en 60 segundos",
    desc: "Envíanos placa, referencia o foto. Te confirmamos disponibilidad y precio.",
  },
  {
    title: "Acompañamiento real",
    desc: "Si no estás seguro de la pieza, te guiamos para evitar errores de compatibilidad.",
  },
  {
    title: "Envíos a todo el país",
    desc: "Coordinamos la mejor opción según ciudad y urgencia (a convenir).",
  },
];

const testimonials = [
  {
    quote:
      "Excelente atención. Me ayudaron a encontrar la referencia exacta y llegó rápido.",
    meta: "Cliente · Transporte",
  },
  {
    quote:
      "Muy buen servicio y cumplimiento. Recomendados para repuestos de pesado.",
    meta: "Taller · Santa Marta",
  },
  {
    quote:
      "Cotización clara y asesoría. Se nota la experiencia.",
    meta: "Flota · Costa Caribe",
  },
];

const faqs = [
  {
    q: "¿Cómo hago una cotización?",
    a: "Escríbenos por WhatsApp con placa, referencia o una foto de la pieza. Entre más datos nos compartas, más rápido cotizamos.",
  },
  {
    q: "¿Hacen envíos a otras ciudades?",
    a: "Sí. Envíos a todo Colombia (a convenir). Coordinamos la opción según destino y urgencia.",
  },
  {
    q: "¿Qué tipo de vehículos atienden?",
    a: "Vehículos pesados, buses y maquinaria. También apoyamos talleres y flotas.",
  },
  {
    q: "¿Puedo cotizar con solo una foto?",
    a: "Sí. Una foto clara + medidas o referencia ayuda mucho para validar compatibilidad.",
  },
];

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/80">
      {children}
    </span>
  );
}

function PrimaryButton({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className="inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold text-white shadow-sm transition"
      style={{ background: brand.colors.accent }}
    >
      {children}
    </a>
  );
}

function SecondaryButton({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
    >
      {children}
    </a>
  );
}

export default function Page() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* TOP BAR */}
      <div className="bg-slate-950 text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2 text-xs">
          <div className="hidden sm:block text-white/80">
            Envíos a todo Colombia (a convenir) · Cotiza por WhatsApp
          </div>
          <a
            href={wa(
              "Hola, quiero cotizar un repuesto. Es para: (camión/bus/maquinaria). Referencia o foto: ____. Ciudad destino: ____."
            )}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-white/90"
          >
            <span>💬</span>
            <span className="font-semibold">WhatsApp: +57 310 653 1208</span>
          </a>
        </div>
      </div>

      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <a href="#inicio" className="flex items-center gap-3">
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
              <div
                className="text-sm font-extrabold tracking-wide"
                style={{ color: brand.colors.blue }}
              >
                {brand.name}
              </div>
              <div className="text-xs text-slate-600">Santa Marta · Repuestos</div>
            </div>
          </a>

          <nav className="hidden items-center gap-6 text-sm text-slate-700 md:flex">
            <a className="hover:text-slate-900" href="#inicio">
              Inicio
            </a>
            <a className="hover:text-slate-900" href="#categorias">
              Categorías
            </a>
            <a className="hover:text-slate-900" href="#nosotros">
              Nosotros
            </a>
            <a className="hover:text-slate-900" href="#faq">
              Preguntas
            </a>
            <a className="hover:text-slate-900" href="#contacto">
              Contacto
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <a
              className="hidden rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 md:inline-flex"
              href="tel:+573106531208"
              title="Llamar"
            >
              📞
            </a>
            <a
              className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold text-white"
              style={{ background: brand.colors.accent }}
              href={wa(
                "Hola, quiero cotizar un repuesto. Es para: (camión/bus/maquinaria). Referencia o foto: ____. Ciudad destino: ____."
              )}
              target="_blank"
              rel="noreferrer"
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
            src="https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=2400&q=70"
            alt="Repuestos y mantenimiento"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-slate-950/30" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 py-20">
          <div className="max-w-2xl text-white">
            <div className="flex flex-wrap gap-2">
              <Pill>Vehículos pesados</Pill>
              <Pill>Buses</Pill>
              <Pill>Maquinaria</Pill>
              <Pill>Flotas & Talleres</Pill>
            </div>

            <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl">
              {brand.tagline}
            </h1>
            <p className="mt-4 text-lg text-white/80">{brand.subtitle}</p>

            <div className="mt-8 flex flex-wrap gap-3">
              <PrimaryButton
                href={wa(
                  "Hola, quiero cotizar un repuesto. Es para: (camión/bus/maquinaria). Referencia o foto: ____. Ciudad destino: ____."
                )}
              >
                Cotizar por WhatsApp
              </PrimaryButton>
              <SecondaryButton href="#categorias">Ver categorías</SecondaryButton>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-4">
              {trust.map((t) => (
                <div
                  key={t.k}
                  className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3"
                >
                  <div className="text-sm font-extrabold">{t.k}</div>
                  <div className="text-xs text-white/70">{t.v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* HIGHLIGHTS */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-4 lg:grid-cols-3">
          {highlights.map((h) => (
            <div
              key={h.title}
              className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm"
            >
              <div
                className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl text-white"
                style={{ background: brand.colors.blue }}
              >
                ⚙️
              </div>
              <div className="text-lg font-extrabold">{h.title}</div>
              <p className="mt-2 text-sm text-slate-600">{h.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section id="categorias" className="bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <div className="text-xs uppercase tracking-wide text-slate-500">Catálogo</div>
          <h2
            className="mt-2 text-3xl font-extrabold"
            style={{ color: brand.colors.blue }}
          >
            Categorías principales
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-slate-600">
            Si no encuentras la categoría exacta, igual escríbenos. Con una foto o
            referencia te ayudamos a ubicar la pieza.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((c) => (
              <a
                key={c.title}
                href={wa(
                  `Hola, quiero cotizar: ${c.title}. Es para: (camión/bus/maquinaria). Referencia o foto: ____. Ciudad destino: ____.`
                )}
                target="_blank"
                rel="noreferrer"
                className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-lg font-extrabold">{c.title}</div>
                    <p className="mt-2 text-sm text-slate-600">{c.desc}</p>
                  </div>
                  <div
                    className="inline-flex h-10 w-10 items-center justify-center rounded-2xl text-white"
                    style={{ background: brand.colors.accent }}
                    aria-hidden
                  >
                    ↗
                  </div>
                </div>
                <div
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold"
                  style={{ color: brand.colors.accent }}
                >
                  Cotizar esta categoría <span className="transition group-hover:translate-x-0.5">→</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* PREMIUM CTA */}
      <section className="bg-slate-950">
        <div className="mx-auto max-w-6xl px-4 py-14 text-white">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="text-xs uppercase tracking-wide text-white/60">
                Cotización rápida
              </div>
              <h2 className="mt-2 text-3xl font-extrabold">
                Pídenos la pieza por WhatsApp
              </h2>
              <p className="mt-4 text-white/75">
                Envía referencia, placa o foto. Te confirmamos disponibilidad, precio y
                coordinamos envío a convenir.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <PrimaryButton
                  href={wa(
                    "Hola, quiero cotizar un repuesto. Es para: (camión/bus/maquinaria). Referencia o foto: ____. Ciudad destino: ____."
                  )}
                >
                  Abrir WhatsApp
                </PrimaryButton>
                <SecondaryButton href="tel:+573106531208">Llamar</SecondaryButton>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-sm font-bold">1) Envíanos datos</div>
                  <div className="mt-1 text-xs text-white/70">placa / referencia / foto</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-sm font-bold">2) Cotizamos</div>
                  <div className="mt-1 text-xs text-white/70">disponibilidad + precio</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-sm font-bold">3) Entregamos</div>
                  <div className="mt-1 text-xs text-white/70">envío a convenir</div>
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5">
              <div className="absolute inset-0">
                <Image
                  src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=70"
                  alt="Vehículo pesado"
                  fill
                  className="object-cover opacity-35"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/70 via-slate-950/30 to-transparent" />
              </div>
              <div className="relative p-8">
                <div className="text-sm font-bold">Mensaje sugerido</div>
                <div className="mt-3 rounded-2xl border border-white/10 bg-black/30 p-5 text-sm text-white/80">
                  Hola, quiero cotizar un repuesto. Es para: (camión/bus/maquinaria).
                  Referencia o foto: ____.
                  Ciudad destino: ____.
                </div>
                <div className="mt-4">
                  <a
                    href={wa(
                      "Hola, quiero cotizar un repuesto. Es para: (camión/bus/maquinaria). Referencia o foto: ____. Ciudad destino: ____."
                    )}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-semibold"
                    style={{ color: brand.colors.accent }}
                  >
                    Usar este mensaje →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT + TESTIMONIALS */}
      <section id="nosotros" className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-500">Nosotros</div>
            <h2
              className="mt-2 text-3xl font-extrabold"
              style={{ color: brand.colors.blue }}
            >
              Servicio y cumplimiento
            </h2>
            <p className="mt-4 text-slate-600">
              Tornirepuestos es una empresa con trayectoria en el mercado, enfocada en
              atender necesidades de repuestos para vehículos pesados, buses y maquinaria.
              Nuestra prioridad es que consigas la pieza correcta, con asesoría clara y
              tiempos definidos.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {["Asesoría para compatibilidad", "Atención a flotas y talleres", "Repuestos de calidad", "Envíos a convenir"].map(
                (x) => (
                  <div
                    key={x}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
                  >
                    <span style={{ color: brand.colors.accent }}>✔</span> {x}
                  </div>
                )
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <div className="text-sm font-extrabold" style={{ color: brand.colors.blue }}>
              Lo que dicen nuestros clientes
            </div>
            <div className="mt-4 grid gap-4">
              {testimonials.map((t, i) => (
                <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="text-sm text-slate-800">“{t.quote}”</div>
                  <div className="mt-2 text-xs text-slate-500">{t.meta}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <div className="text-xs uppercase tracking-wide text-slate-500">FAQ</div>
          <h2
            className="mt-2 text-3xl font-extrabold"
            style={{ color: brand.colors.blue }}
          >
            Preguntas frecuentes
          </h2>

          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            {faqs.map((f) => (
              <details
                key={f.q}
                className="group rounded-3xl border border-slate-200 bg-white p-6"
              >
                <summary className="cursor-pointer list-none">
                  <div className="flex items-start justify-between gap-4">
                    <div className="text-sm font-extrabold text-slate-900">{f.q}</div>
                    <div
                      className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-2xl text-white"
                      style={{ background: brand.colors.accent }}
                      aria-hidden
                    >
                      +
                    </div>
                  </div>
                </summary>
                <p className="mt-3 text-sm text-slate-600">{f.a}</p>
              </details>
            ))}
          </div>

          <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-7">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-sm font-extrabold">¿Listo para cotizar?</div>
                <div className="mt-1 text-sm text-slate-600">
                  Escríbenos por WhatsApp y te respondemos.
                </div>
              </div>
              <a
                href={wa(
                  "Hola, quiero cotizar un repuesto. Es para: (camión/bus/maquinaria). Referencia o foto: ____. Ciudad destino: ____."
                )}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold text-white"
                style={{ background: brand.colors.accent }}
              >
                Cotizar ahora
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contacto" className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-500">Contacto</div>
            <h2
              className="mt-2 text-3xl font-extrabold"
              style={{ color: brand.colors.blue }}
            >
              Contáctanos
            </h2>
            <p className="mt-3 text-sm text-slate-600">
              Para una respuesta más rápida, envíanos la referencia o una foto.
            </p>

            <div className="mt-6 grid gap-3 text-slate-700">
              <div className="rounded-3xl border border-slate-200 bg-white p-6">
                <div className="text-sm font-bold">WhatsApp</div>
                <div className="mt-1 text-sm text-slate-600">+57 310 653 1208</div>
                <a
                  className="mt-3 inline-flex items-center gap-2 text-sm font-semibold"
                  style={{ color: brand.colors.accent }}
                  href={wa(
                    "Hola, quiero cotizar un repuesto. Es para: (camión/bus/maquinaria). Referencia o foto: ____. Ciudad destino: ____."
                  )}
                  target="_blank"
                  rel="noreferrer"
                >
                  Abrir WhatsApp →
                </a>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6">
                <div className="text-sm font-bold">Correo</div>
                <div className="mt-1 text-sm text-slate-600">ventas@tornirepuestos.com</div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6">
                <div className="text-sm font-bold">Dirección</div>
                <div className="mt-1 text-sm text-slate-600">
                  Calle 30 N 60-250, Santa Marta, Colombia
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <div className="text-sm font-extrabold" style={{ color: brand.colors.blue }}>
              Ubicación
            </div>
            <p className="mt-3 text-sm text-slate-600">
              Si quieres, mañana dejamos el mapa integrado (Google Maps) con un link
              directo.
            </p>
            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
              Santa Marta, Colombia
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="relative h-9 w-9 overflow-hidden rounded-xl border border-slate-200 bg-white">
              <Image
                src="/logo-tornirepuestos.jpg"
                alt="Logo Tornirepuestos"
                fill
                className="object-contain p-1"
              />
            </div>
            <div>
              <div className="text-sm font-extrabold" style={{ color: brand.colors.blue }}>
                {brand.name}
              </div>
              <div className="text-xs text-slate-500">© 2026 Tornirepuestos</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-slate-600">
            <a className="hover:text-slate-900" href="#inicio">
              Inicio
            </a>
            <a className="hover:text-slate-900" href="#categorias">
              Categorías
            </a>
            <a className="hover:text-slate-900" href="#nosotros">
              Nosotros
            </a>
            <a className="hover:text-slate-900" href="#faq">
              Preguntas
            </a>
            <a className="hover:text-slate-900" href="#contacto">
              Contacto
            </a>
          </div>
        </div>
      </footer>

      {/* WhatsApp floating */}
      <a
        href={wa(
          "Hola, quiero cotizar un repuesto. Es para: (camión/bus/maquinaria). Referencia o foto: ____. Ciudad destino: ____."
        )}
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-5 right-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-lg"
        style={{ background: brand.colors.accent }}
        aria-label="WhatsApp"
        title="Cotizar por WhatsApp"
      >
        💬
      </a>
    </div>
  );
}
