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
  const [isCartOpen, setIsCartOpen] = useState(false);
  const lastScrollY = useRef(0);
  const sliderTrackRef = useRef<HTMLDivElement | null>(null);
  const sliderCycleWidthRef = useRef(0);
  const sliderOffsetRef = useRef(0);
  const sliderDirectionRef = useRef<-1 | 1>(-1); // -1 = izquierda, 1 = derecha

  useEffect(() => {
    const measure = () => {
      const el = sliderTrackRef.current;
      if (!el) return;
      const cycle = el.scrollWidth / 2;
      if (!cycle || Number.isNaN(cycle)) return;
      sliderCycleWidthRef.current = cycle;
      if (sliderOffsetRef.current === 0) {
        sliderOffsetRef.current = -cycle / 2;
        el.style.transform = `translateX(${sliderOffsetRef.current}px)`;
      }
    };

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [topSellers.length]);

  useEffect(() => {
    lastScrollY.current = window.scrollY;

    const handleScroll = () => {
      const currentY = window.scrollY;
      const deltaY = currentY - lastScrollY.current;
      if (deltaY > 0.5) sliderDirectionRef.current = 1; // bajar => derecha
      if (deltaY < -0.5) sliderDirectionRef.current = -1; // subir => izquierda

      lastScrollY.current = currentY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let rafId = 0;
    let lastTs = 0;

    const tick = (ts: number) => {
      const el = sliderTrackRef.current;
      const cycle = sliderCycleWidthRef.current;
      if (el && cycle > 0) {
        if (!lastTs) lastTs = ts;
        const dt = (ts - lastTs) / 16.6667;
        lastTs = ts;

        const speed = 0.58; // mas lento y continuo
        let next = sliderOffsetRef.current + sliderDirectionRef.current * speed * dt;

        if (next > 0) next -= cycle;
        if (next < -cycle) next += cycle;

        sliderOffsetRef.current = next;
        el.style.transform = `translateX(${next}px)`;
      }

      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
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

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("tp_quote_cart_v1");
      if (!saved) return;
      const parsed = JSON.parse(saved) as string[];
      if (Array.isArray(parsed)) setSelectedIds(parsed);
    } catch {
      // ignore localStorage parsing issues
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem("tp_quote_cart_v1", JSON.stringify(selectedIds));
    } catch {
      // ignore localStorage write issues
    }
  }, [selectedIds]);

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

  const canIgnoreCardToggle = (target: EventTarget | null) => {
    if (!(target instanceof Element)) return false;
    return Boolean(target.closest("a, button, input, select, textarea, label"));
  };

  return (
    <div className="mt-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="text-xs uppercase tracking-wide text-slate-500">Más vendidos</div>
        <h2 className="mt-1 text-2xl font-extrabold text-slate-900">Productos destacados</h2>
        <div className="mt-4 overflow-hidden pb-2">
          <div ref={sliderTrackRef} className="tp-catalog-slider-track">
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

      <section className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredItems.map((item, idx) => (
          <article
            key={item.id}
            role="button"
            tabIndex={0}
            aria-pressed={selectedIds.includes(item.id)}
            onClick={(e) => {
              if (canIgnoreCardToggle(e.target)) return;
              toggleProductSelection(item.id);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                toggleProductSelection(item.id);
              }
            }}
            className={`cursor-pointer overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
              selectedIds.includes(item.id)
                ? "border-red-300 ring-2 ring-red-200"
                : "border-slate-200"
            }`}
          >
            <div className="border-b border-slate-200 bg-slate-50 px-4 py-2">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-slate-500">Código</div>
                  <div className="text-sm font-extrabold text-slate-900">{item.code}</div>
                </div>
                <div
                  className={`rounded-lg border px-2 py-1 text-xs font-semibold ${
                    selectedIds.includes(item.id)
                      ? "border-red-200 bg-red-50 text-red-700"
                      : "border-slate-300 bg-white text-slate-700"
                  }`}
                >
                  {selectedIds.includes(item.id) ? "Seleccionado" : "Toca para agregar"}
                </div>
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

      <button
        onClick={() => setIsCartOpen((v) => !v)}
        className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold text-white shadow-lg"
        style={{ background: "var(--tp-action-primary)" }}
        aria-label="Abrir cotización"
      >
        <span>Cotización</span>
        <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs">{selectedItems.length}</span>
      </button>

      {isCartOpen && (
        <div className="fixed inset-0 z-50">
          <button
            onClick={() => setIsCartOpen(false)}
            className="absolute inset-0 bg-slate-950/35"
            aria-label="Cerrar cotización"
          />
          <aside className="absolute right-0 top-0 h-full w-full max-w-md border-l border-slate-200 bg-white p-4 shadow-2xl">
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-500">Cotización</div>
                <div className="text-lg font-extrabold text-slate-900">
                  {selectedItems.length} producto(s)
                </div>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="rounded-lg border border-slate-300 px-2 py-1 text-sm text-slate-700"
              >
                Cerrar
              </button>
            </div>

            <div className="mt-3 max-h-[62vh] space-y-2 overflow-auto pr-1">
              {selectedItems.length === 0 && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                  No has agregado productos todavía.
                </div>
              )}
              {selectedItems.map((item) => (
                <div key={`drawer-${item.id}`} className="rounded-xl border border-slate-200 bg-white p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate text-xs font-semibold text-slate-500">{item.code}</div>
                      <div className="line-clamp-2 text-sm font-bold text-slate-900">{item.name}</div>
                    </div>
                    <button
                      onClick={() => setSelectedIds((prev) => prev.filter((id) => id !== item.id))}
                      className="rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-xs font-semibold text-red-700"
                    >
                      Quitar
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-2 border-t border-slate-200 pt-3">
              <button
                onClick={() => setSelectedIds([])}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Limpiar todo
              </button>
              <a
                href={selectedItems.length ? wa(quotationText) : undefined}
                target="_blank"
                rel="noreferrer"
                className={`inline-flex w-full items-center justify-center rounded-xl px-3 py-2 text-sm font-semibold text-white ${
                  selectedItems.length ? "" : "pointer-events-none opacity-60"
                }`}
                style={{ background: "var(--tp-action-primary)" }}
              >
                Enviar cotización completa
              </a>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
