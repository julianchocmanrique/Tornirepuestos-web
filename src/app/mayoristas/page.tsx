import type { Metadata } from "next";
import Link from "next/link";

import { DEFAULT_OG_IMAGE, absoluteUrl } from "@/lib/seo";
import { WHOLESALE_WHATSAPP_DISPLAY, waWholesale } from "@/lib/wa";
import { MayoristaForm } from "./MayoristaForm";

const benefits = [
  "Precios especiales por volumen",
  "Más de 10.000 referencias",
  "Envíos nacionales",
  "Atención personalizada",
  "Garantías",
  "Asesor comercial exclusivo",
];

const buyerTypes = [
  "Almacenes de repuestos",
  "Talleres",
  "Empresas transportadoras",
  "Flotas",
  "Comercializadores",
  "Distribuidores",
];

const mainBrands = ["Cummins", "Eaton", "Fuller", "Meritor", "Fleetguard", "Spicer", "Timken", "Bendix"];

export const metadata: Metadata = {
  title: "Mayoristas Tornirepuestos | Programa para distribuidores",
  description:
    "Conviértete en distribuidor Tornirepuestos. Abastecemos almacenes, talleres, flotas y comercializadores con precios por volumen, más de 10.000 referencias y envíos nacionales.",
  alternates: {
    canonical: "/mayoristas",
  },
  openGraph: {
    type: "website",
    url: absoluteUrl("/mayoristas"),
    title: "Mayoristas Tornirepuestos | Programa para distribuidores",
    description:
      "Programa mayorista para almacenes, talleres, flotas y comercializadores de repuestos para trabajo pesado en Colombia.",
    images: [DEFAULT_OG_IMAGE],
  },
};

export default function MayoristasPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(229,9,9,0.24),transparent_36%),linear-gradient(135deg,rgba(15,23,42,0.96),rgba(2,6,23,1))]" />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-16 lg:grid-cols-[1.12fr_0.88fr] lg:items-center lg:py-20">
          <div>
            <div className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-white/70">
              Programa mayorista
            </div>
            <h1 className="mt-5 max-w-3xl text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
              Conviértete en Distribuidor Tornirepuestos
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/78">
              Abastecemos almacenes, talleres, flotas y comercializadores en toda Colombia con repuestos para trabajo pesado, acompañamiento comercial y soporte por referencia.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {benefits.map((benefit) => (
                <div key={benefit} className="flex items-center gap-3 rounded-2xl border border-white/12 bg-white/[0.07] px-4 py-3 text-sm font-semibold text-white/88">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-500 text-xs font-black text-white">✓</span>
                  {benefit}
                </div>
              ))}
            </div>

            <div className="mt-9 flex flex-wrap gap-3">
              <a
                href={waWholesale("Hola, quiero información para ser cliente mayorista Tornirepuestos. ¿Me puede contactar un asesor comercial?")}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-2xl px-7 py-4 text-sm font-extrabold uppercase tracking-wide text-white shadow-[0_18px_40px_rgba(229,9,9,0.28)] transition hover:opacity-90"
                style={{ background: "var(--tp-action-primary)" }}
              >
                Quiero ser cliente mayorista
              </a>
              <Link
                href="#formulario-mayorista"
                className="inline-flex items-center justify-center rounded-2xl border border-white/18 bg-white/10 px-7 py-4 text-sm font-bold text-white transition hover:bg-white/15"
              >
                Llenar formulario
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/14 bg-white/[0.06] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-md">
            <div className="rounded-[1.5rem] bg-white p-6 text-slate-900">
              <div className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">Aliado comercial</div>
              <h2 className="mt-3 text-2xl font-black">Compra por volumen con respaldo</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                Creamos una ruta de atención para compradores frecuentes: validación de marcas, equivalencias, disponibilidad y seguimiento comercial.
              </p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-2xl font-black text-slate-950">10.000+</div>
                  <div className="mt-1 text-xs font-semibold text-slate-500">referencias</div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-2xl font-black text-slate-950">CO</div>
                  <div className="mt-1 text-xs font-semibold text-slate-500">envío nacional</div>
                </div>
                <div className="col-span-2 rounded-2xl border border-red-100 bg-red-50 p-4">
                  <div className="text-sm font-black text-red-700">Asesor comercial exclusivo</div>
                  <div className="mt-1 text-xs leading-relaxed text-red-900/70">
                    Línea mayorista: {WHOLESALE_WHATSAPP_DISPLAY}.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <div className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">Perfil mayorista</div>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">¿Quién puede comprar al por mayor?</h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {buyerTypes.map((type) => (
                <div key={type} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-bold text-slate-800">
                  {type}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <div className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">Marcas principales</div>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">Referencias para trabajo pesado</h2>
            <div className="mt-6 flex flex-wrap gap-3">
              {mainBrands.map((brand) => (
                <div key={brand} className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-800 shadow-sm">
                  {brand}
                </div>
              ))}
              <div className="rounded-full border border-red-100 bg-red-50 px-5 py-3 text-sm font-black text-red-700">
                Y muchas más
              </div>
            </div>
            <p className="mt-5 text-sm leading-relaxed text-slate-600">
              Si manejas marcas específicas o equivalencias de alta rotación, compártelas en el formulario para que el asesor pueda priorizar tu solicitud.
            </p>
          </div>
        </div>
      </section>

      <section id="formulario-mayorista" className="mx-auto max-w-6xl px-4 pb-16">
        <div className="mb-7 max-w-3xl">
          <div className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">Solicitud comercial</div>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">Cuéntanos sobre tu empresa</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Esta información nos ayuda a clasificar prospectos, identificar volumen de compra y asignar la atención adecuada.
          </p>
        </div>
        <MayoristaForm />
      </section>
    </main>
  );
}
