import { wa } from "@/lib/wa";

export const metadata = {
  title: "Tornirepuestos · Contacto",
  description: "Canales de contacto de Tornirepuestos en Santa Marta.",
};

export default function ContactoPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <main className="mx-auto max-w-6xl px-4 py-14">
        <div className="text-xs uppercase tracking-wide text-slate-500">Contacto</div>
        <h1 className="mt-2 text-4xl font-extrabold tracking-tight">Hablemos</h1>
        <p className="mt-3 max-w-3xl text-sm text-slate-600">
          Estamos en Santa Marta. Te ayudamos a encontrar la referencia correcta y cotizar rápido.
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
      </main>
    </div>
  );
}
