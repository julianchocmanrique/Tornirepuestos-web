"use client";
import { useEffect, useState, type ReactNode } from "react";
import type { Snapshot } from "@/lib/baile/types";

export function SearchBar({ query, onQuery, children }: { query: string; onQuery: (v: string) => void; children?: ReactNode }) {
  return <div className="dance-filters"><input aria-label="Buscar registros" placeholder="Nombre, documento, código, academia o ciudad…" value={query} onChange={e => onQuery(e.target.value)} />{children}</div>;
}
export function CategoryFilter({ s, value, onChange }: { s: Snapshot; value: string; onChange: (v: string) => void }) {
  return <select aria-label="Filtrar categoría" value={value} onChange={e => onChange(e.target.value)}><option value="">Todas las categorías</option>{s.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>;
}
export function usePage<T>(rows: T[], filterKey: string) {
  const [page, setPage] = useState(0);
  useEffect(() => setPage(0), [filterKey]);
  const last = Math.max(0, Math.ceil(rows.length / 10) - 1), current = Math.min(page, last);
  return {
    rows: rows.slice(current * 10, current * 10 + 10),
    pager: <div className="dance-pagination"><span>{rows.length ? current * 10 + 1 : 0}–{Math.min(rows.length, current * 10 + 10)} de {rows.length}</span><div><button className="dance-btn secondary small" disabled={current === 0} onClick={() => setPage(current - 1)}>Anterior</button><span>Página {current + 1} de {last + 1}</span><button className="dance-btn secondary small" disabled={current === last} onClick={() => setPage(current + 1)}>Siguiente</button></div></div>,
  };
}
export function ModuleHeading({ title, detail, children }: { title: string; detail: string; children?: ReactNode }) {
  return <div className="dance-panel-title"><div><h2>{title}</h2><p className="dance-muted">{detail}</p></div>{children}</div>;
}
