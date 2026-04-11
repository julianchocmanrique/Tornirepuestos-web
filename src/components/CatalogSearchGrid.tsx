"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

import { wa } from "@/lib/wa";

export type CatalogItem = {
  id: string;
  code: string;
  name: string;
  note: string;
  categorySlug: string;
  categoryTitle: string;
  image: string;
  kind: string;
};

type Props = {
  items: CatalogItem[];
};

export function CatalogSearchGrid({ items }: Props) {
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [kindFilter, setKindFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"relevance" | "name-asc" | "name-desc" | "code-asc">(
    "relevance"
  );

  const categories = useMemo(
    () =>
      Array.from(new Set(items.map((item) => item.categorySlug))).map((slug) => ({
        slug,
        title: items.find((item) => item.categorySlug === slug)?.categoryTitle || slug,
      })),
    [items]
  );

  const kinds = useMemo(
    () => Array.from(new Set(items.map((item) => item.kind))).sort((a, b) => a.localeCompare(b)),
    [items]
  );

  const filteredItems = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    const base = items.filter((item) => {
      const matchesQuery =
        !normalized ||
        item.name.toLowerCase().includes(normalized) ||
        item.note.toLowerCase().includes(normalized) ||
        item.code.toLowerCase().includes(normalized) ||
        item.categoryTitle.toLowerCase().includes(normalized);

      const matchesCategory = categoryFilter === "all" || item.categorySlug === categoryFilter;
      const matchesKind = kindFilter === "all" || item.kind === kindFilter;

      return matchesQuery && matchesCategory && matchesKind;
    });

    if (sortBy === "name-asc") {
      return [...base].sort((a, b) => a.name.localeCompare(b.name));
    }
    if (sortBy === "name-desc") {
      return [...base].sort((a, b) => b.name.localeCompare(a.name));
    }
    if (sortBy === "code-asc") {
      return [...base].sort((a, b) => a.code.localeCompare(b.code));
    }
    return base;
  }, [items, query, categoryFilter, kindFilter, sortBy]);

  return (
    <div className="mt-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <label htmlFor="catalog-search" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Buscar en catálogo
        </label>
        <input
          id="catalog-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ejemplo: disco, filtro, ALT-001, frenos..."
          className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-800 outline-none ring-red-500/30 placeholder:text-slate-400 focus:ring-2"
        />

        <div className="mt-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Filtros</div>
          <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setCategoryFilter("all")}
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                categoryFilter === "all"
                  ? "border-red-200 bg-red-50 text-red-700"
                  : "border-slate-200 bg-white text-slate-700"
              }`}
            >
              Todas
            </button>
            {categories.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => setCategoryFilter(cat.slug)}
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                  categoryFilter === cat.slug
                    ? "border-red-200 bg-red-50 text-red-700"
                    : "border-slate-200 bg-white text-slate-700"
                }`}
              >
                {cat.title}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <select
            value={kindFilter}
            onChange={(e) => setKindFilter(e.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none ring-red-500/30 focus:ring-2"
          >
            <option value="all">Tipo de producto: todos</option>
            {kinds.map((kind) => (
              <option key={kind} value={kind}>
                {kind}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "relevance" | "name-asc" | "name-desc" | "code-asc")}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none ring-red-500/30 focus:ring-2"
          >
            <option value="relevance">Orden: relevancia</option>
            <option value="name-asc">Nombre A-Z</option>
            <option value="name-desc">Nombre Z-A</option>
            <option value="code-asc">Código ascendente</option>
          </select>

          <button
            onClick={() => {
              setQuery("");
              setCategoryFilter("all");
              setKindFilter("all");
              setSortBy("relevance");
            }}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Limpiar filtros
          </button>
        </div>
      </div>

      <div className="mt-4 text-sm text-slate-600">
        Mostrando <span className="font-bold text-slate-900">{filteredItems.length}</span> productos
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredItems.map((item) => (
          <article
            key={item.id}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="border-b border-slate-200 bg-slate-50 px-4 py-2">
              <div className="text-[11px] uppercase tracking-wide text-slate-500">Código</div>
              <div className="text-sm font-extrabold text-slate-900">{item.code}</div>
            </div>

            <div className="relative h-40 bg-slate-100">
              <Image src={item.image} alt={item.name} fill className="object-cover" />
            </div>

            <div className="space-y-3 p-4">
              <div>
                <div className="line-clamp-2 min-h-[2.5rem] text-sm font-extrabold text-slate-900">
                  {item.name}
                </div>
                <div className="mt-1 line-clamp-2 text-xs text-slate-600">{item.note}</div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
                <div className="font-semibold text-slate-900">Categoría</div>
                <div>{item.categoryTitle}</div>
              </div>

              <a
                href={wa(`Quiero cotizar ${item.name} (${item.code}). Ciudad destino: ____.`)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-full items-center justify-center rounded-xl px-3 py-2 text-sm font-semibold text-white"
                style={{ background: "var(--tp-action-primary)" }}
              >
                Cotizar por WhatsApp
              </a>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
