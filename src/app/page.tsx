import Image from "next/image";

const brand = {
  name: "TORNIREPUESTOS",
  tagline: "Repuestos para vehículos pesados, buses y maquinaria",
  subtitle:
    "Cotiza por WhatsApp en minutos. Te ayudamos a identificar la referencia correcta y coordinamos envío a todo Colombia (a convenir).",
  colors: {
    blue: "#0F2A44",
    accent: "#E10600", // rojo más profundo (tipo promo)
  },
};

const BASE_PATH = "/tornirepuestos";
const LOGO_SRC = `${BASE_PATH}/logo-tornirepuestos.jpg`;

const WHATSAPP_PHONE_E164 = "573106531208";
const WHATSAPP_LINK = `https://api.whatsapp.com/send?phone=${WHATSAPP_PHONE_E164}`;

const WA_PREFIX = "Hola, te contactamos desde tornirepuestos.com.%0A%0A";

function wa(text: string) {
  // Siempre agrega un saludo + origen del contacto (tornirepuestos.com)
  return `${WHATSAPP_LINK}&text=${WA_PREFIX}${encodeURIComponent(text)}`;
}

const trust = [
  { k: "+20 años", v: "Experiencia y respaldo" },
  { k: "Cotización ágil", v: "Por WhatsApp" },
  { k: "Envíos", v: "A todo Colombia (a convenir)" },
  { k: "Asesoría", v: "Compatibilidad y referencia" },
];

const categories = [
  {
    title: "Frenos",
    kicker: "DISCOS · BANDAS · VÁLVULAS",
    desc: "Componentes de freno para trabajo pesado y alto rendimiento.",
    img: "https://images.unsplash.com/photo-1613214150384-14921ff659b2?auto=format&fit=crop&w=1800&q=75",
  },
  {
    title: "Filtración",
    kicker: "ACEITE · AIRE · COMBUSTIBLE",
    desc: "Filtros y separadores para proteger el motor y mejorar eficiencia.",
    img: "https://images.unsplash.com/photo-1650064173648-2ed372656fa3?auto=format&fit=crop&w=1600&q=75",
  },
  {
    title: "Suspensión",
    kicker: "NEUMÁTICA · RÍGIDA",
    desc: "Confort, estabilidad y control de carga para ruta y ciudad.",
    img: "https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=1600&q=75",
  },
  {
    title: "Motor",
    kicker: "SELLOS · EMPAQUES",
    desc: "Consumibles y repuestos para mantenimiento preventivo.",
    img: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1600&q=75",
  },
  {
    title: "Eléctricos y luces",
    kicker: "LUCES · CONECTORES",
    desc: "Iluminación y eléctricos para seguridad y señalización.",
    img: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=1600&q=75",
  },
  {
    title: "Transmisión",
    kicker: "FULLER · CRUCETAS",
    desc: "Componentes para torque, fuerza y durabilidad.",
    img: "https://images.unsplash.com/photo-1519682577862-22b62b24e493?auto=format&fit=crop&w=1600&q=75",
  },
  {
    title: "Rodamientos y retenedores",
    kicker: "KITS · RETENES",
    desc: "Repuestos de precisión para reducir desgaste y vibración.",
    img: "https://images.unsplash.com/photo-1581092334651-ddf26d9a09d1?auto=format&fit=crop&w=1600&q=75",
  },
  {
    title: "Mangueras y racorería",
    kicker: "AIRE · ABRAZADERAS",
    desc: "Conexiones seguras para sistemas de aire y servicio.",
    img: "https://images.unsplash.com/photo-1581579185169-55a8b1d9f4b8?auto=format&fit=crop&w=1600&q=75",
  },
  {
    title: "Lubricantes y grasas",
    kicker: "ACEITES · ADITIVOS",
    desc: "Lubricación para trabajo pesado y protección del tren motriz.",
    img: "https://images.unsplash.com/photo-1607603750909-408e193868c7?auto=format&fit=crop&w=1600&q=75",
  },
  {
    title: "Tornillería",
    kicker: "ANCLAJES · FIJACIÓN",
    desc: "Tornillería y fijación para mantenimiento y montaje.",
    img: "https://images.unsplash.com/photo-1583912268189-1c8e0c24a8cf?auto=format&fit=crop&w=1600&q=75",
  },
  {
    title: "Herramientas",
    kicker: "TALLER · SOPORTE",
    desc: "Herramientas y apoyo para taller y servicio.",
    img: "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?auto=format&fit=crop&w=1600&q=75",
  },
  {
    title: "Diferenciales",
    kicker: "TRACCIÓN · CARGA",
    desc: "Componentes y repuestos para transmisión final.",
    img: "https://images.unsplash.com/photo-1601933470928-cd037d0b045b?auto=format&fit=crop&w=1600&q=75",
  },
];

const highlights = [
  {
    title: "Cotiza rápido",
    desc: "Envíanos placa, referencia o una foto. Te respondemos con disponibilidad y precio.",
  },
  {
    title: "Te ayudamos a acertar",
    desc: "Validamos compatibilidad para que compres la pieza correcta desde el inicio.",
  },
  {
    title: "Entrega a convenir",
    desc: "Coordinamos envío según tu ciudad y urgencia. También puedes recoger en tienda.",
  },
];

const testimonials = [
  {
    quote:
      "Me ayudaron a identificar la referencia correcta y la cotización fue rápida.",
    meta: "Cliente · Transporte",
  },
  {
    quote:
      "Buen servicio y cumplimiento. Llegó bien embalado y a tiempo.",
    meta: "Taller · Santa Marta",
  },
  {
    quote:
      "Asesoría clara para compatibilidad. Recomendados para pesado y bus.",
    meta: "Cliente · Costa Caribe",
  },
];

const faqs = [
  {
    q: "¿Cómo hago una cotización?",
    a: "Escríbenos por WhatsApp con la placa, una referencia o una foto clara de la pieza. Si tienes medidas o marca/modelo, mejor.",
  },
  {
    q: "¿Hacen envíos a otras ciudades?",
    a: "Sí. Enviamos a todo Colombia (a convenir). Te confirmamos opciones y tiempos según destino.",
  },
  {
    q: "¿Atienden qué tipo de vehículos?",
    a: "Vehículos pesados, buses y maquinaria. También atendemos flotas y talleres.",
  },
  {
    q: "¿Puedo cotizar con solo una foto?",
    a: "Sí. Una foto bien tomada + datos básicos (medidas/referencia) ayuda a validar compatibilidad.",
  },
  {
    q: "¿Qué información acelera la cotización?",
    a: "Placa, referencia, foto de la etiqueta, medidas (si aplica) y ciudad de destino.",
  },
  {
    q: "¿Cómo sé si la pieza es compatible?",
    a: "Te ayudamos a confirmar compatibilidad antes de comprar. La idea es evitar devoluciones y pérdidas de tiempo.",
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
                src={LOGO_SRC}
                alt="Logo Tornirepuestos"
                fill
                className="object-contain p-1"
                priority
                unoptimized
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
              className="rounded-3xl border border-white/10 bg-slate-950/70 p-7 text-white shadow-[0_18px_60px_rgba(2,6,23,0.55)] backdrop-blur"
            >
              <div
                className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 text-white shadow-[0_10px_30px_rgba(225,6,0,0.28)]"
                style={{ background: brand.colors.accent }}
              >
                ⚙️
              </div>
              <div className="text-lg font-extrabold">{h.title}</div>
              <p className="mt-2 text-sm text-white/75">{h.desc}</p>
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
            Categorías
          </h2>
          <p className="mt-3 max-w-3xl text-sm text-slate-600">
            Un solo catálogo por categorías, cada una con imagen y estilo “destacado”.
            Todas abren WhatsApp con mensaje prellenado.
          </p>

          <div className="mt-8 grid grid-cols-12 gap-4">
            {categories.map((c, idx) => {
              const tone = idx % 3 === 0 ? "red" : "dark";
              const span =
                idx % 7 === 0
                  ? "col-span-12 md:col-span-8"
                  : idx % 5 === 0
                    ? "col-span-12 md:col-span-6"
                    : "col-span-12 md:col-span-4";

              return (
                <a
                  key={c.title}
                  href={wa(
                    `Quiero cotizar: ${c.title}. Es para: (camión/bus/maquinaria). Referencia o foto: ____. Ciudad destino: ____.`
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className={`group relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-900 shadow-sm transition hover:-translate-y-0.5 hover:shadow ${span}`}
                >
                  <div className="absolute inset-0">
                    <Image
                      src={c.img}
                      alt={c.title}
                      fill
                      className="object-cover opacity-80 transition duration-500 group-hover:scale-[1.03]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/85 via-slate-950/35 to-transparent" />
                    {tone === "red" && (
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(225,6,0,0.45),transparent_55%)]" />
                    )}
                  </div>

                  <div className="relative flex h-full min-h-[210px] flex-col justify-between p-6 text-white">
                    <div>
                      <div className="text-[11px] font-semibold tracking-[0.18em] text-white/70">
                        {c.kicker}
                      </div>
                      <div className="mt-2 text-2xl font-extrabold leading-tight">{c.title}</div>
                      <p className="mt-2 max-w-[54ch] text-sm text-white/80">{c.desc}</p>
                    </div>

                    <div className="mt-6 flex items-center justify-between gap-3">
                      <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-white/85">
                        <span className="text-base">💬</span>
                        <span>Cotizar</span>
                      </div>
                      <div
                        className="inline-flex h-10 w-10 items-center justify-center rounded-2xl text-white"
                        style={{ background: brand.colors.accent }}
                        aria-hidden
                      >
                        ↗
                      </div>
                    </div>
                  </div>
                </a>
              );
            })}
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
                  Hola, te contactamos desde tornirepuestos.com.

                  Quiero cotizar un repuesto. Es para: (camión/bus/maquinaria).
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
              Repuestos con respaldo
            </h2>
            <p className="mt-4 text-slate-600">
              Somos un local de repuestos en Santa Marta con experiencia en el sector.
              Atendemos vehículos pesados, buses y maquinaria con un objetivo simple:
              ayudarte a conseguir la pieza correcta, a tiempo y con asesoría clara.
            </p>
            <p className="mt-3 text-slate-600">
              Si no tienes la referencia exacta, no pasa nada: con una foto o la placa
              te guiamos para validar compatibilidad y darte opciones.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                "Asesoría para compatibilidad",
                "Cotización clara por WhatsApp",
                "Atención a flotas y talleres",
                "Envíos a todo Colombia (a convenir)",
              ].map((x) => (
                <div
                  key={x}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
                >
                  <span style={{ color: brand.colors.accent }}>✔</span> {x}
                </div>
              ))}
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
                className="group rounded-3xl border border-slate-200/70 bg-white/70 p-6 backdrop-blur"
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

          <div className="mt-10 rounded-3xl border border-slate-200/70 bg-white/70 p-7 shadow-[0_10px_30px_rgba(2,6,23,0.10)] backdrop-blur">
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
              <div className="rounded-3xl border border-slate-200/70 bg-white/70 p-6 shadow-[0_10px_30px_rgba(2,6,23,0.10)] backdrop-blur">
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

              <div className="rounded-3xl border border-slate-200/70 bg-white/70 p-6 shadow-[0_10px_30px_rgba(2,6,23,0.10)] backdrop-blur">
                <div className="text-sm font-bold">Correo</div>
                <div className="mt-1 text-sm text-slate-600">ventas@tornirepuestos.com</div>
                <div className="mt-3 text-xs text-slate-500">
                  Si es urgente, WhatsApp es más rápido.
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200/70 bg-white/70 p-6 shadow-[0_10px_30px_rgba(2,6,23,0.10)] backdrop-blur">
                <div className="text-sm font-bold">Dirección</div>
                <div className="mt-1 text-sm text-slate-600">
                  Calle 30 N 60-250, Santa Marta, Colombia
                </div>
                <div className="mt-3 text-xs text-slate-500">
                  (Podemos agregar el link de Google Maps cuando me confirmes la ubicación exacta.)
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
                src={LOGO_SRC}
                alt="Logo Tornirepuestos"
                fill
                className="object-contain p-1"
                unoptimized
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
