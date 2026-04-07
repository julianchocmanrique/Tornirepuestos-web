import Link from "next/link";
import Image from "next/image";
import { categories } from "@/lib/categories";

export const metadata = {
  title: "Tornirepuestos · Categorías",
};

export default function Page() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="text-xs uppercase tracking-wide text-slate-500">Catálogo</div>
        <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-slate-900">
          Categorías
        </h1>
        <p className="mt-3 max-w-3xl text-sm text-slate-600">
          Selecciona una categoría para ver el detalle y cotizar más rápido.
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
              <Link
                key={c.slug}
                href={`/categorias/${c.slug}`}
                className={`group relative overflow-hidden rounded-3xl border border-slate-200 bg-[#0F2A44]/90 shadow-sm transition hover:-translate-y-0.5 hover:shadow ${span}`}
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
                    <div className="mt-2 text-2xl font-extrabold leading-tight">
                      {c.title}
                    </div>
                    <p className="mt-2 max-w-[54ch] text-sm text-white/80">
                      {c.desc}
                    </p>
                  </div>

                  <div className="mt-6 flex items-center justify-between gap-3">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-white/85">
                      <span>Ver detalle</span>
                    </div>
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-white">
                      →
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
