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
        <p className="mt-2 text-slate-600">Vuelve al catálogo.</p>
        <Link className="mt-6 inline-block underline" href="/categorias">
          Ver categorías
        </Link>
      </div>
    );
  }

  const waText = `Quiero cotizar: ${cat.title}. Es para: (camión/bus/maquinaria). Referencia o foto: ____. Ciudad destino: ____.`;

  return (
    <div className="min-h-screen bg-white">
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
        <div className="rounded-3xl border border-slate-200/70 bg-white/70 p-7 shadow-[0_10px_30px_rgba(2,6,23,0.10)] backdrop-blur">
          <div className="text-xs uppercase tracking-wide text-slate-500">
            Información
          </div>
          <p className="mt-3 text-sm leading-relaxed text-slate-700">
            {seoParagraph(cat)}
          </p>
        </div>
      </section>

      {/* Detail */}
      <section id="detalle" className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-200/70 bg-white/70 p-7 shadow-[0_10px_30px_rgba(2,6,23,0.10)] backdrop-blur">
            <div className="text-xs uppercase tracking-wide text-slate-500">
              Qué puedes cotizar
            </div>
            <h2 className="mt-2 text-2xl font-extrabold text-slate-900">
              {cat.title}
            </h2>
            <ul className="mt-4 space-y-2 text-sm text-slate-700">
              {cat.whatYouCanAsk.map((x) => (
                <li key={x} className="flex gap-2">
                  <span className="mt-0.5" style={{ color: "#E10600" }}>
                    ✔
                  </span>
                  <span>{x}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-700">
              <div className="font-extrabold">Para cotizar más rápido</div>
              <div className="mt-2">
                Envíanos por WhatsApp: placa (si aplica), referencia o foto clara, y la
                ciudad de destino.
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200/70 bg-white/70 p-7 shadow-[0_10px_30px_rgba(2,6,23,0.10)] backdrop-blur">
            <div className="text-xs uppercase tracking-wide text-slate-500">
              Ejemplos
            </div>
            <h2 className="mt-2 text-2xl font-extrabold text-slate-900">
              Productos más pedidos
            </h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {cat.productsExample.map((p) => (
                <div
                  key={p.name}
                  className="rounded-2xl border border-slate-200 bg-white p-5"
                >
                  <div className="text-sm font-extrabold text-slate-900">{p.name}</div>
                  <div className="mt-1 text-xs text-slate-500">{p.note}</div>
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
          </div>
        </div>
      </section>

      {/* Footer nav */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-slate-600">
            Tornirepuestos · Santa Marta
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-slate-600">
            <Link className="hover:text-slate-900" href="/">
              Inicio
            </Link>
            <Link className="hover:text-slate-900" href="/categorias">
              Categorías
            </Link>
            <a className="hover:text-slate-900" href={wa(waText)} target="_blank" rel="noreferrer">
              WhatsApp
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
