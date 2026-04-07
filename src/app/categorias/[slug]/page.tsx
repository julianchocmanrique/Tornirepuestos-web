import Link from "next/link";
import Image from "next/image";
import { categories, getCategoryBySlug } from "@/lib/categories";
import { wa } from "@/lib/wa";
import { seoParagraph } from "./seo";

export function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cat = getCategoryBySlug(slug);

  if (!cat) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16">
        <h1 className="text-2xl font-extrabold">Categoría no encontrada</h1>
        <p className="mt-2 text-white/70">Vuelve al catálogo.</p>
        <Link className="mt-6 inline-block underline" href="/categorias">
          Ver categorías
        </Link>
      </div>
    );
  }

  const waText = `Quiero cotizar: ${cat.title}. Es para: (camión/bus/maquinaria). Referencia o foto: ____. Ciudad destino: ____.`;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={cat.img}
            alt={cat.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/70 to-slate-950/10" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(225,6,0,0.45),transparent_55%)]" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 py-16 text-white">
          <div className="flex items-center justify-between gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm"
            >
              ← Inicio
            </Link>
            <Link
              href="/categorias"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm"
            >
              Ver categorías
            </Link>
          </div>

          <div className="mt-10 max-w-3xl">
            <div className="text-[11px] font-semibold tracking-[0.18em] text-white/75">
              {cat.kicker}
            </div>
            <h1 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">
              {cat.title}
            </h1>
            <p className="mt-4 text-white/80">{cat.desc}</p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={wa(waText)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold text-white"
                style={{ background: "#E10600" }}
              >
                Cotizar por WhatsApp
              </a>
              <a
                href="#detalle"
                className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white hover:bg-white/15"
              >
                Ver detalle
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* SEO copy */}
      <section className="mx-auto max-w-6xl px-4 pt-10">
        <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-7 shadow-[0_18px_60px_rgba(2,6,23,0.55)] backdrop-blur">
          <div className="text-xs uppercase tracking-wide text-white/60">
            Información
          </div>
          <p className="mt-3 text-sm leading-relaxed text-white/75">
            {seoParagraph(cat)}
          </p>
        </div>
      </section>

      {/* Detail */}
      <section id="detalle" className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-7 shadow-[0_18px_60px_rgba(2,6,23,0.55)] backdrop-blur">
            <div className="text-xs uppercase tracking-wide text-white/60">
              Qué puedes cotizar
            </div>
            <h2 className="mt-2 text-2xl font-extrabold text-white">
              {cat.title}
            </h2>
            <ul className="mt-4 space-y-2 text-sm text-white/75">
              {cat.whatYouCanAsk.map((x) => (
                <li key={x} className="flex gap-2">
                  <span className="mt-0.5" style={{ color: "#E10600" }}>
                    ▲
                  </span>
                  <span>{x}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-white/75">
              <div className="font-extrabold">Para cotizar más rápido</div>
              <div className="mt-2">
                Envíanos por WhatsApp: placa (si aplica), referencia o foto clara, y la
                ciudad de destino.
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="text-xs uppercase tracking-wide text-white/60">Checklist</div>
              <div className="mt-2 text-sm font-extrabold text-white">¿Qué datos enviar?</div>
              <ul className="mt-3 space-y-2 text-sm text-white/75">
                {[
                  "Placa o modelo del vehículo",
                  "Referencia (si la tienes)",
                  "Foto clara de la pieza / etiqueta",
                  "Medidas (si aplica)",
                  "Ciudad destino",
                ].map((x) => (
                  <li key={x} className="flex gap-2">
                    <span className="mt-0.5" style={{ color: "#E10600" }}>
                      •
                    </span>
                    <span>{x}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-7 shadow-[0_18px_60px_rgba(2,6,23,0.55)] backdrop-blur">
            <div className="text-xs uppercase tracking-wide text-white/60">
              Ejemplos
            </div>
            <h2 className="mt-2 text-2xl font-extrabold text-white">
              Productos más pedidos
            </h2>
            <div className="mt-5 grid gap-3">
              {cat.productsExample.map((p) => (
                <div
                  key={p.name}
                  className="rounded-2xl border border-white/10 bg-white/5 p-5"
                >
                  <div className="text-sm font-extrabold text-white">{p.name}</div>
                  <div className="mt-1 text-xs text-white/60">{p.note}</div>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <a
                href={wa(waText)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm font-semibold"
                style={{ color: "#E10600" }}
              >
                Cotizar {cat.title} →
              </a>
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-white/75">
              <div className="font-extrabold">Preguntas frecuentes de esta categoría</div>
              <div className="mt-2 space-y-2">
                <div>• ¿Tienen disponibilidad inmediata?</div>
                <div>• ¿Sirve para mi referencia / modelo?</div>
                <div>• ¿Cuánto tarda el envío a mi ciudad?</div>
              </div>
              <div className="mt-4">
                <a
                  href={wa(
                    `${waText}\n\n¿Tienen disponibilidad? ¿Me confirmas compatibilidad y tiempo de envío?`
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-semibold"
                  style={{ color: "#E10600" }}
                >
                  Preguntar por WhatsApp →
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer nav */}
      <footer className="border-t border-white/10 bg-slate-950">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-white/60">
            Tornirepuestos · Santa Marta
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-white/70">
            <Link className="hover:text-white" href="/">
              Inicio
            </Link>
            <Link className="hover:text-white" href="/categorias">
              Categorías
            </Link>
            <a className="hover:text-white" href={wa(waText)} target="_blank" rel="noreferrer">
              WhatsApp
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
