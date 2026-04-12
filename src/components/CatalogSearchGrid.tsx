"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

import { wa } from "@/lib/wa";

export type CatalogItem = {
  id: string;
  code: string;
  name: string;
  description: string;
  groupSup: string;
  groupInf: string;
  kind: string;
  stock: number;
  totalSales: number;
  lastSaleDate: string;
};

type Props = {
  items: CatalogItem[];
  topSellers: CatalogItem[];
};

const imageByKeyword: Array<{ keys: string[]; images: string[] }> = [
  {
    keys: ["filtro", "filtr"],
    images: [
      "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=1200&q=75",
      "https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=1200&q=75",
    ],
  },
  {
    keys: ["freno", "banda", "disco"],
    images: [
      "https://images.unsplash.com/photo-1625047509168-a7026f36de04?auto=format&fit=crop&w=1200&q=75",
      "https://images.unsplash.com/photo-1609521263047-f8f205293f24?auto=format&fit=crop&w=1200&q=75",
    ],
  },
  {
    keys: ["amort", "susp", "buje"],
    images: [
      "https://images.unsplash.com/photo-1669136048337-5daa3adef7b2?auto=format&fit=crop&w=1200&q=75",
      "https://images.unsplash.com/photo-1615906655593-ad0386982a0f?auto=format&fit=crop&w=1200&q=75",
    ],
  },
  {
    keys: ["aceite", "grasa", "lubric"],
    images: [
      "https://images.unsplash.com/photo-1625047509248-ec889cbff17f?auto=format&fit=crop&w=1200&q=75",
      "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=1200&q=75",
    ],
  },
  {
    keys: ["alternador", "arranque", "luz", "electr", "bombillo"],
    images: [
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=75",
      "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=1200&q=75",
    ],
  },
  {
    keys: ["rodamiento", "balinera", "reten"],
    images: [
      "https://images.unsplash.com/photo-1589391349202-900abe66462a?auto=format&fit=crop&w=1200&q=75",
      "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=1200&q=75",
    ],
  },
  {
    keys: ["manguera", "abrazadera", "racor"],
    images: [
      "https://images.unsplash.com/photo-1598023707207-276835c2b5fe?auto=format&fit=crop&w=1200&q=75",
      "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=75",
    ],
  },
  {
    keys: ["tornillo", "tuerca", "arandela", "perno"],
    images: [
      "https://images.unsplash.com/photo-1605701249987-f0bb9b505d06?auto=format&fit=crop&w=1200&q=75",
      "https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&w=1200&q=75",
    ],
  },
];

const fallbackImages = [
  "https://images.unsplash.com/photo-1429772011165-0c2e054367b8?auto=format&fit=crop&w=1200&q=75",
  "https://images.unsplash.com/photo-1711199694531-e982a79ea381?auto=format&fit=crop&w=1200&q=75",
];

function getImageForItem(item: CatalogItem, seed = 0) {
  const source = `${item.name} ${item.groupInf} ${item.groupSup}`.toLowerCase();
  const match = imageByKeyword.find((entry) => entry.keys.some((k) => source.includes(k)));
  const pool = match ? match.images : fallbackImages;
  return pool[(seed + item.code.length) % pool.length];
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("es-CO").format(value);
}

function formatLastSale(date: string) {
  if (!date) return "Sin venta reciente";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "Sin venta reciente";
  return d.toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
}

export function CatalogSearchGrid({ items, topSellers }: Props) {
  const [query, setQuery] = useState("");
  const [groupSupFilter, setGroupSupFilter] = useState("all");
  const [groupInfFilter, setGroupInfFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"relevance" | "sales-desc" | "stock-desc" | "name-asc">(
    "relevance"
  );
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const lastScrollY = useRef(0);
  const [sliderDirection, setSliderDirection] = useState<"left" | "right">("left");

  useEffect(() => {
    lastScrollY.current = window.scrollY;

    const handleScroll = () => {
      const currentY = window.scrollY;
      const deltaY = currentY - lastScrollY.current;
      if (deltaY > 0.5) setSliderDirection("right"); // bajar => derecha
      if (deltaY < -0.5) setSliderDirection("left"); // subir => izquierda

      lastScrollY.current = currentY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const groupSupOptions = useMemo(
    () => Array.from(new Set(items.map((item) => item.groupSup))).sort((a, b) => a.localeCompare(b)),
    [items]
  );

  const groupInfOptions = useMemo(() => {
    const source =
      groupSupFilter === "all"
        ? items
        : items.filter((item) => item.groupSup === groupSupFilter);
    return Array.from(new Set(source.map((item) => item.groupInf))).sort((a, b) => a.localeCompare(b));
  }, [items, groupSupFilter]);

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = items.filter((item) => {
      const matchesQuery =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        item.groupInf.toLowerCase().includes(q) ||
        item.groupSup.toLowerCase().includes(q);

      const matchesGroupSup = groupSupFilter === "all" || item.groupSup === groupSupFilter;
      const matchesGroupInf = groupInfFilter === "all" || item.groupInf === groupInfFilter;
      return matchesQuery && matchesGroupSup && matchesGroupInf;
    });

    if (sortBy === "sales-desc") {
      return [...base].sort((a, b) => b.totalSales - a.totalSales);
    }
    if (sortBy === "stock-desc") {
      return [...base].sort((a, b) => b.stock - a.stock);
    }
    if (sortBy === "name-asc") {
      return [...base].sort((a, b) => a.name.localeCompare(b.name));
    }
    return base;
  }, [items, query, groupSupFilter, groupInfFilter, sortBy]);

  const selectedItems = useMemo(
    () => items.filter((item) => selectedIds.includes(item.id)),
    [items, selectedIds]
  );

  const quotationText = useMemo(() => {
    if (selectedItems.length === 0) return "";
    const lines = selectedItems.map((item, idx) => `${idx + 1}. ${item.name} (${item.code})`);
    return `Hola, quiero una cotización completa de estos productos:\n\n${lines.join(
      "\n"
    )}\n\nCiudad destino: ____.\nDatos adicionales: ____.`;
  }, [selectedItems]);

  const toggleProductSelection = (itemId: string) => {
    setSelectedIds((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  return (
    <div className="mt-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="text-xs uppercase tracking-wide text-slate-500">Más vendidos</div>
        <h2 className="mt-1 text-2xl font-extrabold text-slate-900">Productos destacados</h2>
        <div className="mt-4 overflow-hidden pb-2">
          <div
            className={`tp-catalog-slider-track ${
              sliderDirection === "left" ? "tp-catalog-slider-dir-left" : "tp-catalog-slider-dir-right"
            }`}
          >
            {[...topSellers, ...topSellers].map((item, idx) => (
            <article
              key={`${item.id}-${idx}`}
              className="min-w-[260px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="relative h-32">
                <Image
                  src={getImageForItem(item, idx)}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-900/25 to-transparent" />
                <div className="absolute left-2 top-2 rounded-lg bg-white/90 px-2 py-1 text-[10px] font-semibold text-slate-700">
                  {item.code}
                </div>
              </div>
              <div className="space-y-2 p-3">
                <div className="line-clamp-2 text-sm font-extrabold text-slate-900">{item.name}</div>
                <div className="text-xs text-slate-600">{item.groupInf}</div>
                <div className="text-xs text-slate-600">Ventas: {formatNumber(item.totalSales)}</div>
              </div>
            </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <label htmlFor="catalog-search" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Buscar producto
        </label>
        <input
          id="catalog-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por código, nombre o categoría..."
          className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-800 outline-none ring-red-500/25 placeholder:text-slate-400 focus:ring-2"
        />

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <select
            value={groupSupFilter}
            onChange={(e) => {
              setGroupSupFilter(e.target.value);
              setGroupInfFilter("all");
            }}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none ring-red-500/25 focus:ring-2"
          >
            <option value="all">Grupo principal: todos</option>
            {groupSupOptions.map((group) => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
          </select>

          <select
            value={groupInfFilter}
            onChange={(e) => setGroupInfFilter(e.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none ring-red-500/25 focus:ring-2"
          >
            <option value="all">Subgrupo: todos</option>
            {groupInfOptions.map((group) => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(e.target.value as "relevance" | "sales-desc" | "stock-desc" | "name-asc")
            }
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none ring-red-500/25 focus:ring-2"
          >
            <option value="relevance">Orden: relevancia</option>
            <option value="sales-desc">Más vendidos</option>
            <option value="stock-desc">Mayor stock</option>
            <option value="name-asc">Nombre A-Z</option>
          </select>

          <button
            onClick={() => {
              setQuery("");
              setGroupSupFilter("all");
              setGroupInfFilter("all");
              setSortBy("relevance");
            }}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Limpiar filtros
          </button>
        </div>
      </section>

      <div className="mt-4 text-sm text-slate-600">
        Mostrando <span className="font-bold text-slate-900">{formatNumber(filteredItems.length)}</span> productos con stock
      </div>

      {selectedItems.length > 0 && (
        <section className="mt-4 rounded-3xl border border-red-200 bg-red-50 p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-wide text-red-700">Carrito de cotización</div>
              <div className="text-sm font-bold text-slate-900">
                {selectedItems.length} producto(s) seleccionados
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedIds([])}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Limpiar carrito
              </button>
              <a
                href={wa(quotationText)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold text-white"
                style={{ background: "var(--tp-action-primary)" }}
              >
                Enviar cotización completa
              </a>
            </div>
          </div>
          <div className="mt-3 max-h-28 overflow-auto rounded-xl border border-red-100 bg-white p-3 text-xs text-slate-700">
            {selectedItems.map((item) => (
              <div key={`cart-${item.id}`} className="truncate">
                • {item.code} - {item.name}
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredItems.map((item, idx) => (
          <article
            key={item.id}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="border-b border-slate-200 bg-slate-50 px-4 py-2">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-slate-500">Código</div>
                  <div className="text-sm font-extrabold text-slate-900">{item.code}</div>
                </div>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(item.id)}
                    onChange={() => toggleProductSelection(item.id)}
                    className="h-4 w-4 accent-red-600"
                  />
                  <span>Agregar</span>
                </label>
              </div>
            </div>

            <div className="relative h-44 bg-slate-100">
              <Image
                src={getImageForItem(item, idx)}
                alt={item.name}
                fill
                className="object-cover"
              />
            </div>

            <div className="space-y-3 p-4">
              <div className="line-clamp-2 min-h-[2.6rem] text-sm font-extrabold text-slate-900">
                {item.name}
              </div>
              <div className="line-clamp-2 text-xs text-slate-600">{item.description}</div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-2 py-2">
                  <div className="text-slate-500">Stock</div>
                  <div className="font-bold text-slate-900">{formatNumber(item.stock)}</div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-2 py-2">
                  <div className="text-slate-500">Ventas</div>
                  <div className="font-bold text-slate-900">{formatNumber(item.totalSales)}</div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700">
                <div className="font-semibold text-slate-900">{item.groupInf}</div>
                <div className="text-slate-500">{formatLastSale(item.lastSaleDate)}</div>
              </div>

              <a
                href={wa(`Quiero cotizar ${item.name} (${item.code}).`)}
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
      </section>
    </div>
  );
}
