import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

import { CategoriesAnimatedGrid } from "@/components/CategoriesAnimatedGrid";
import { FaqTabs } from "@/components/FaqTabs";
import { categories } from "@/lib/categories";
import { STORE_LOCATIONS } from "@/lib/locations";
import { DEFAULT_OG_IMAGE, absoluteUrl } from "@/lib/seo";
import { SEO_SOLUTIONS } from "@/lib/seoSolutions";
import { wa } from "@/lib/wa";

const brand = {
  name: "TORNIREPUESTOS",
  tagline: "¿Tu camión está listo para rodar?",
  subtitle:
    "Menos paradas, más camino. Cotiza repuestos para camión por WhatsApp con asesoría rápida y envío nacional.",
  colors: {
    blue: "var(--tp-blue-800)",
    accent: "var(--tp-action-primary)", // rojo promo
  },
};

const heroPhones = ["305 356 0953", "310 655 1629", "305 232 5233"];

const BASE_PATH = "";
const LOGO_SRC = `${BASE_PATH}/tornirepuestos.jpeg`;

const trust = [
  { k: "+20 años", v: "Experiencia y respaldo" },
  { k: "Cotización ágil", v: "Por WhatsApp" },
  { k: "Envíos", v: "A todo Colombia" },
  { k: "Asesoría", v: "Compatibilidad y referencia" },
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
    title: "Entrega ",
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
    category: "General",
    q: "¿Atienden qué tipo de vehículos?",
    a: "Vehículos pesados, buses y maquinaria. También atendemos flotas y talleres.",
  },
  {
    category: "General",
    q: "¿Cómo hago una cotización?",
    a: "Escríbenos por WhatsApp con la placa, una referencia o una foto clara de la pieza. Si tienes medidas o marca/modelo, mejor.",
  },
  {
    category: "General",
    q: "¿Puedo cotizar con solo una foto?",
    a: "Sí. Una foto bien tomada + datos básicos (medidas/referencia) ayuda a validar compatibilidad.",
  },
  {
    category: "General",
    q: "¿Qué información acelera la cotización?",
    a: "Placa, referencia, foto de la etiqueta, medidas (si aplica) y ciudad de destino.",
  },
  {
    category: "General",
    q: "¿Hacen envíos a otras ciudades?",
    a: "Sí. Enviamos a todo Colombia. Te confirmamos opciones y tiempos según destino.",
  },
  {
    category: "General",
    q: "¿Cómo sé si la pieza es compatible?",
    a: "Te ayudamos a confirmar compatibilidad antes de comprar. La idea es evitar devoluciones y pérdidas de tiempo.",
  },
];

export const metadata: Metadata = {
  title: "Inicio",
  description:
    "Cotiza repuestos para vehículos pesados, buses y maquinaria en Tornirepuestos. Atención por WhatsApp y envíos a todo Colombia.",
  alternates: {
    canonical: "/",
  },
  keywords: [
    "repuestos vehículos pesados",
    "repuestos para buses",
    "repuestos maquinaria",
    "tornirepuestos",
    "repuestos santa marta",
  ],
  openGraph: {
    type: "website",
    url: absoluteUrl("/"),
    title: "Tornirepuestos",
    description:
      "Cotiza repuestos para vehículos pesados, buses y maquinaria en Tornirepuestos.",
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "Tornirepuestos",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tornirepuestos",
    description:
      "Cotiza repuestos para vehículos pesados, buses y maquinaria en Tornirepuestos.",
    images: [DEFAULT_OG_IMAGE],
  },
};

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/80">
      {children}
    </span>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect x="1.5" y="1.5" width="29" height="29" rx="7" fill="#10B84A" />
      <circle cx="16" cy="16" r="9.4" stroke="#fff" strokeWidth="2.4" />
      <path
        d="M21.13 19.6c-.27.75-1.36 1.36-2.2 1.53-.58.12-1.33.2-3.63-.72-3-1.2-4.94-4.13-5.09-4.33-.15-.2-1.2-1.56-1.2-2.98 0-1.41.77-2.1 1.04-2.38.28-.28.6-.36.8-.36h.58c.2 0 .44-.07.68.51.25.59.86 2.07.93 2.21.08.15.12.31.03.52-.1.2-.15.32-.29.49-.14.17-.3.38-.44.52-.14.13-.28.27-.12.52.16.25.72 1.15 1.54 1.85 1.06.92 1.96 1.2 2.24 1.33.28.13.44.1.61-.07.17-.18.69-.77.88-1.03.19-.26.38-.22.64-.12.26.09 1.66.75 1.94.88.29.13.48.2.54.31.07.11.07.63-.18 1.33Z"
        fill="#fff"
      />
    </svg>
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
      style={{ background: "var(--tp-action-primary)" }}
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
  const localBusinessJsonLd = {
    "@context": "https://schema.org",
    "@graph": STORE_LOCATIONS.map((location, idx) => ({
      "@type": "AutoPartsStore",
      "@id": `${absoluteUrl("/")}#${location.id}`,
      name: `Tornirepuestos - ${location.name}`,
      image: absoluteUrl("/tornirepuestos.jpeg"),
      url: absoluteUrl("/"),
      telephone: "+57 310 653 1208",
      address: {
        "@type": "PostalAddress",
        streetAddress: location.streetAddress,
        addressLocality: location.locality,
        addressCountry: "CO",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: location.latitude,
        longitude: location.longitude,
      },
      branchCode: String(idx + 1),
      sameAs: [location.maps, wa(location.waText)],
    })),
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />
      {/* HERO */}
      <section id="inicio" className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={`${BASE_PATH}/tornirepuestospublicidad1.jpeg`}
            alt="Repuestos y mantenimiento"
            fill
            quality={95}
            sizes="100vw"
            className="object-cover object-left md:object-contain md:object-right md:scale-90"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/88 via-slate-950/68 to-slate-900/28" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 py-20">
          <div className="max-w-2xl text-white">
            <div className="flex flex-wrap gap-2">
              <Pill>Vehículos pesados</Pill>
              <Pill>Menos paradas</Pill>
              <Pill>Más camino</Pill>
              <Pill>Atención por WhatsApp</Pill>
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

            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm font-semibold text-white/90">
              <span className="text-white/70">Líneas de atención:</span>
              {heroPhones.map((phone) => (
                <a
                  key={phone}
                  href={`tel:+57${phone.replace(/\s+/g, "")}`}
                  className="rounded-full border border-white/20 bg-white/10 px-3 py-1 hover:bg-white/15"
                >
                  {phone}
                </a>
              ))}
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-4">
              {trust.map((t) => (
                <div
                  key={t.k}
                  className="rounded-2xl border border-white/15 bg-[var(--tp-surface-card)] px-4 py-3"
                >
                  <div className="text-sm font-extrabold">{t.k}</div>
                  <div className="text-xs text-white/70">{t.v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section id="categorias" className="bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <div className="text-xs uppercase tracking-wide text-slate-500">Catálogo</div>
          <h2
            className="mt-2 text-3xl font-extrabold"
            style={{ color: "var(--tp-blue-800)" }}
          >
            Categorías
          </h2>
          <p className="mt-3 max-w-3xl text-sm text-slate-600">
            Un solo catálogo por categorías, cada una con imagen y estilo “destacado”.
            Entra a cada categoría para ver el detalle y cotizar más rápido.
          </p>

          <CategoriesAnimatedGrid categories={categories} />

        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mt-2 text-3xl font-extrabold" style={{ color: "var(--tp-blue-800)" }}>
            Soluciones más buscadas
          </h2>
          <p className="mt-2 max-w-3xl text-sm text-slate-600">
            Guías rápidas para referencias con alta intención de compra. Entra, revisa compatibilidad y cotiza por WhatsApp.
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {SEO_SOLUTIONS.map((item) => (
              <Link
                key={item.slug}
                href={`/${item.slug}`}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-300 hover:bg-white"
              >
                <div className="text-sm font-extrabold text-slate-900">{item.title}</div>
                <div className="mt-2 text-sm text-slate-600">{item.summary}</div>
                <div className="mt-3 text-sm font-semibold text-red-600">Ver solución →</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* HIGHLIGHTS */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-4 lg:grid-cols-3">
          {highlights.map((h) => (
            <div
              key={h.title}
              className="rounded-3xl border border-white/10 bg-[var(--tp-surface-card)] p-7 text-white shadow-[0_18px_60px_rgba(2,6,23,0.55)] backdrop-blur"
            >
              <div
                className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 text-white shadow-[0_10px_30px_rgba(225,6,0,0.28)]"
                style={{ background: "var(--tp-action-primary)" }}
              >
                ⚙️
              </div>
              <div className="text-lg font-extrabold">{h.title}</div>
              <p className="mt-2 text-sm text-white/75">{h.desc}</p>
            </div>
          ))}
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
                coordinamos envío .
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
                <div className="rounded-2xl border border-white/10 bg-[var(--tp-surface-card)] p-4">
                  <div className="text-sm font-bold">1) Envíanos datos</div>
                  <div className="mt-1 text-xs text-white/70">placa / referencia / foto</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-[var(--tp-surface-card)] p-4">
                  <div className="text-sm font-bold">2) Cotizamos</div>
                  <div className="mt-1 text-xs text-white/70">disponibilidad + precio</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-[var(--tp-surface-card)] p-4">
                  <div className="text-sm font-bold">3) Entregamos</div>
                  <div className="mt-1 text-xs text-white/70">envío </div>
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[var(--tp-surface-card)]">
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
                    style={{ color: "var(--tp-action-primary)" }}
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
        <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-500">Nosotros</div>
            <h2
              className="mt-2 text-3xl font-extrabold"
              style={{ color: "var(--tp-blue-800)" }}
            >
              Repuestos con respaldo
            </h2>
            <p className="mt-4 text-slate-600">
              Somos una empresa confiable con más de 20 años de trayectoria,
              especializada en la comercialización de partes y piezas para vehículos
              pesados. Nuestro objetivo es simple: ayudarte a conseguir la pieza
              correcta, a tiempo y con asesoría clara.
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
                "Envíos a todo Colombia",
              ].map((x) => (
                <div
                  key={x}
                  className="flex items-center gap-3 rounded-3xl bg-[var(--tp-surface-card)] px-6 py-4 text-white shadow-[0_18px_60px_rgba(2,6,23,0.35)]"
                >
                  <span style={{ color: "var(--tp-action-primary)" }}>▲</span>
                  <span className="text-base font-semibold">{x}</span>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <Link
                href="/nosotros"
                className="inline-flex items-center gap-2 text-sm font-semibold"
                style={{ color: "var(--tp-action-primary)" }}
              >
                Ver historia completa →
              </Link>
            </div>
          </div>

          {/* Mantener este bloque CLARO como la referencia */}
          <div className="rounded-3xl border border-white/10 bg-[var(--tp-surface-card)] p-6 text-white shadow-[0_18px_60px_rgba(2,6,23,0.35)] backdrop-blur">
            <div className="text-sm font-extrabold text-white/90">
              Lo que dicen nuestros clientes
            </div>
            <div className="mt-4 grid gap-4">
              {testimonials.map((t, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-white/10 bg-[var(--tp-surface-card)] p-5 text-white shadow-[0_10px_30px_rgba(2,6,23,0.25)] backdrop-blur"
                >
                  <div className="text-sm text-white/90">“{t.quote}”</div>
                  <div className="mt-2 text-xs text-white/60">{t.meta}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ (OSCURO gris premium) */}
      <section id="faq" className="bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <div className="text-xs uppercase tracking-wide text-slate-500">FAQ</div>
          <h2
            className="mt-2 text-3xl font-extrabold"
            style={{ color: "var(--tp-blue-800)" }}
          >
            Preguntas frecuentes
          </h2>

          <FaqTabs items={faqs} />

          <div className="mt-10 rounded-2xl border border-white/20 bg-[var(--tp-surface-card)] p-6 text-white">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-sm font-extrabold text-white/95">¿Listo para cotizar?</div>
                <div className="mt-1 text-sm text-white/75">
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
                style={{ background: "var(--tp-action-primary)" }}
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
              style={{ color: "var(--tp-blue-800)" }}
            >
              Contáctanos
            </h2>
            <p className="mt-3 text-sm text-slate-600">
              Para una respuesta más rápida, envíanos la referencia o una foto.
            </p>

            <div className="mt-6 grid gap-3 text-slate-700">
              <div className="rounded-2xl border border-slate-300 bg-white p-6">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                  <WhatsAppIcon className="h-7 w-7" />
                  <span>WhatsApp</span>
                </div>
                <div className="mt-1 text-sm text-slate-600">+57 310 653 1208</div>
                <a
                  className="mt-3 inline-flex items-center gap-2 text-sm font-semibold"
                  style={{ color: "var(--tp-action-primary)" }}
                  href={wa(
                    "Hola, quiero cotizar un repuesto. Es para: (camión/bus/maquinaria). Referencia o foto: ____. Ciudad destino: ____."
                  )}
                  target="_blank"
                  rel="noreferrer"
                >
                  Abrir WhatsApp →
                </a>
              </div>

              <div className="rounded-2xl border border-slate-300 bg-white p-6">
                <div className="text-sm font-bold text-slate-900">✉️ Correo</div>
                <a
                  href="mailto:ventas@tornirepuestos.com"
                  className="mt-1 inline-block text-sm text-slate-700 hover:text-slate-900"
                >
                  ventas@tornirepuestos.com
                </a>

              </div>

              <div className="rounded-2xl border border-slate-300 bg-white p-6">
                <div className="text-sm font-bold text-slate-900">📍 Sedes</div>
                <div className="mt-1 space-y-1 text-sm text-slate-600">
                  {STORE_LOCATIONS.map((location) => (
                    <div key={`short-${location.id}`}>{location.name}: {location.address}</div>
                  ))}
                </div>
                <a
                  href="tel:+573106531208"
                  className="mt-3 inline-block text-sm font-semibold text-slate-700 hover:text-slate-900"
                >
                  Llamar: +57 310 653 1208
                </a>

              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-300 bg-white p-6 text-slate-900">
            <div className="text-sm font-extrabold text-slate-900">Ubicaciones</div>
            <p className="mt-3 text-sm text-slate-600">
              Tenemos dos sedes en Santa Marta. Si vienes por repuesto urgente, escríbenos por WhatsApp y te guiamos.
            </p>

            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              {STORE_LOCATIONS.map((location) => (
                <article key={location.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="text-sm font-extrabold text-slate-900">{location.name}</div>
                  <div className="mt-1 text-sm text-slate-600">{location.address}</div>

                  <div className="mt-3 overflow-hidden rounded-2xl bg-white">
                    <iframe
                      title={`Mapa ${location.name}`}
                      className="h-[270px] w-full"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      src={location.embed}
                    />
                  </div>

                  <div className="mt-3 flex flex-wrap gap-3">
                    <a
                      href={location.maps}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex w-full items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold text-white sm:w-auto"
                      style={{ background: "var(--tp-action-primary)" }}
                    >
                      Cómo llegar
                    </a>
                    <a
                      href={wa(location.waText)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 sm:w-auto"
                    >
                      Pedir ubicación por WhatsApp
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="relative h-9 w-12 overflow-hidden rounded-xl border border-slate-200 bg-white">
              <Image
                src={LOGO_SRC}
                alt="Logo Tornirepuestos"
                fill
                className="object-contain p-0.5"
                unoptimized
              />
            </div>
            <div>
              <div className="text-sm font-extrabold" style={{ color: "var(--tp-blue-800)" }}>
                {brand.name}
              </div>
              <div className="text-xs text-slate-500">© 2026 Tornirepuestos</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-slate-600">
            <a className="hover:text-slate-900" href="/">
              Inicio
            </a>
            <a className="hover:text-slate-900" href="/categorias">
              Categorías
            </a>
            <a className="hover:text-slate-900" href="/nosotros">
              Nosotros
            </a>
            <a className="hover:text-slate-900" href="/preguntas">
              Preguntas
            </a>
            <a className="hover:text-slate-900" href="/contacto">
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
        className="fixed bottom-5 right-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl shadow-lg"
        aria-label="WhatsApp"
        title="Cotizar por WhatsApp"
      >
        <WhatsAppIcon className="h-12 w-12" />
      </a>
    </div>
  );
}
