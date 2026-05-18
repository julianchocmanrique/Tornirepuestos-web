import type { Metadata } from "next";

import { DEFAULT_OG_IMAGE, absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Política de Tratamiento de Datos",
  description:
    "Conoce la política de tratamiento de datos personales de Tornirepuestos y los canales para ejercer tus derechos.",
  alternates: {
    canonical: "/politica-tratamiento-datos",
  },
  openGraph: {
    type: "website",
    url: absoluteUrl("/politica-tratamiento-datos"),
    title: "Política de Tratamiento de Datos | Tornirepuestos",
    description:
      "Conoce cómo tratamos los datos personales y cómo puedes ejercer tus derechos en Tornirepuestos.",
    images: [DEFAULT_OG_IMAGE],
  },
};

export default function PoliticaTratamientoDatosPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="mx-auto max-w-4xl px-4 py-14">
        <div className="text-xs uppercase tracking-wide text-slate-500">Legal</div>
        <h1 className="mt-2 text-4xl font-extrabold tracking-tight">
          Política de Tratamiento de Datos Personales
        </h1>
        <p className="mt-3 text-sm text-slate-600">
          Última actualización: 18 de mayo de 2026.
        </p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-slate-700">
          <section>
            <h2 className="text-xl font-extrabold text-slate-900">1. Responsable</h2>
            <p className="mt-2">
              Tornirepuestos es responsable del tratamiento de los datos personales
              recolectados a través de este sitio web y de sus canales de atención.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-extrabold text-slate-900">2. Finalidad del tratamiento</h2>
            <p className="mt-2">
              Usamos la información para atender solicitudes, cotizaciones,
              seguimiento comercial, servicio al cliente, mejora de procesos y
              cumplimiento de obligaciones legales.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-extrabold text-slate-900">3. Datos que recolectamos</h2>
            <p className="mt-2">
              Podemos tratar datos como nombre, teléfono, correo electrónico,
              empresa, ciudad, placa o referencia técnica compartida para cotización.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-extrabold text-slate-900">4. Derechos del titular</h2>
            <p className="mt-2">
              Puedes conocer, actualizar, rectificar y solicitar supresión de tus
              datos, además de revocar autorizaciones cuando aplique.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-extrabold text-slate-900">5. Canales de atención</h2>
            <p className="mt-2">
              Para ejercer tus derechos o resolver dudas, escríbenos a{" "}
              <a
                href="mailto:ventas@tornirepuestos.com"
                className="font-semibold text-[var(--tp-action-primary)]"
              >
                ventas@tornirepuestos.com
              </a>{" "}
              o contáctanos al{" "}
              <a
                href="tel:+573106531208"
                className="font-semibold text-[var(--tp-action-primary)]"
              >
                +57 310 653 1208
              </a>
              .
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}
