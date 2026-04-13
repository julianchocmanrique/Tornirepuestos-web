import { wa } from "@/lib/wa";
import type { Metadata } from "next";
import { DEFAULT_OG_IMAGE, absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Canales de contacto de Tornirepuestos en Santa Marta. Atención en dos sedes.",
  alternates: {
    canonical: "/contacto",
  },
  openGraph: {
    type: "website",
    url: absoluteUrl("/contacto"),
    title: "Contacto | Tornirepuestos",
    description: "Canales de contacto de Tornirepuestos en Santa Marta. Atención en dos sedes.",
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contacto | Tornirepuestos",
    description: "Canales de contacto de Tornirepuestos en Santa Marta. Atención en dos sedes.",
    images: [DEFAULT_OG_IMAGE],
  },
};

export default function ContactoPage() {
  const locations = [
    {
      id: "sede-principal",
      name: "Sede Principal",
      address: "Calle 30 N 60-250, Santa Marta, Colombia",
      embed:
        "https://www.google.com/maps?q=Calle%2030%20N%2060-250,%20Santa%20Marta,%20Colombia&output=embed",
      maps: "https://www.google.com/maps/search/?api=1&query=Calle%2030%20N%2060-250,%20Santa%20Marta,%20Colombia",
      waText:
        "Quiero llegar a la sede principal (Calle 30 N 60-250). ¿Me compartes ubicación y referencia?",
    },
    {
      id: "sede-2",
      name: "Sede 2",
      address: "Sector Bomba Zuca / Troncal del Caribe, Santa Marta",
      embed: "https://www.google.com/maps?q=11.183433,-74.194969&output=embed",
      maps:
        "https://www.google.com/maps/dir/Torni+Repuestos,+Santa+Marta,+Magdalena/11.183433,-74.194969/@11.2231232,-74.1953911,13.17z/data=!4m8!4m7!1m5!1m1!1s0x8ef4f60b4f12e23d:0xf825f5fb9f7f9bbc!2m2!1d-74.1950117!2d11.18341!1m0?entry=ttu&g_ep=EgoyMDI2MDQwOC4wIKXMDSoASAFQAw%3D%3D",
      waText: "Quiero llegar a la sede 2 (11.183433, -74.194969). ¿Me ayudas con la ubicación?",
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <main className="mx-auto max-w-6xl px-4 py-14">
        <div className="text-xs uppercase tracking-wide text-slate-500">Contacto</div>
        <h1 className="mt-2 text-4xl font-extrabold tracking-tight">Hablemos</h1>
        <p className="mt-3 max-w-3xl text-sm text-slate-600">
          Estamos en Santa Marta con dos sedes. Te ayudamos a encontrar la referencia correcta y cotizar rápido.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm font-bold text-slate-900">WhatsApp</div>
            <a
              href={wa("Hola, quiero cotizar un repuesto. ¿Me ayudan por favor?")}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-block text-sm font-semibold text-[var(--tp-action-primary)]"
            >
              Abrir chat
            </a>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm font-bold text-slate-900">Teléfono</div>
            <a href="tel:+573106531208" className="mt-2 inline-block text-sm text-slate-700">
              +57 310 653 1208
            </a>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm font-bold text-slate-900">Correo</div>
            <a
              href="mailto:ventas@tornirepuestos.com"
              className="mt-2 inline-block text-sm text-slate-700"
            >
              ventas@tornirepuestos.com
            </a>
          </article>
        </div>

        <section className="mt-8">
          <h2 className="text-2xl font-extrabold tracking-tight">Nuestras sedes</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {locations.map((location) => (
              <article key={location.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="text-sm font-bold text-slate-900">{location.name}</div>
                <div className="mt-1 text-sm text-slate-600">{location.address}</div>
                <div className="mt-3 overflow-hidden rounded-xl border border-slate-200">
                  <iframe
                    title={`Mapa ${location.name}`}
                    className="h-56 w-full"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    src={location.embed}
                  />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <a
                    href={location.maps}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold text-white"
                    style={{ background: "var(--tp-action-primary)" }}
                  >
                    Cómo llegar
                  </a>
                  <a
                    href={wa(location.waText)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Pedir ubicación por WhatsApp
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
