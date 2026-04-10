'use client';

import { useMemo, useState } from 'react';

export type FaqItem = { q: string; a: string; category: string };

export function FaqTabs({ items }: { items: FaqItem[] }) {
  const categories = useMemo(() => {
    const set = new Set(items.map((i) => i.category));
    const list = Array.from(set);
    // Prefer "General" first if present
    list.sort((a, b) => (a === 'General' ? -1 : b === 'General' ? 1 : a.localeCompare(b)));
    return list;
  }, [items]);

  const [active, setActive] = useState(categories[0] || 'General');
  const [openQ, setOpenQ] = useState<string | null>(null);

  const filtered = useMemo(() => items.filter((i) => i.category === active), [items, active]);

  return (
    <div>
      <div className="mt-6 flex flex-wrap gap-4 border-b border-slate-200">
        {categories.map((c) => {
          const is = c === active;
          return (
            <button
              key={c}
              type="button"
              onClick={() => {
                setActive(c);
                setOpenQ(null);
              }}
              className={
                "relative -mb-px pb-3 text-sm font-semibold transition " +
                (is ? 'text-slate-950' : 'text-slate-500 hover:text-slate-800')
              }
            >
              {c}
              {is ? (
                <span
                  className="absolute left-0 right-0 -bottom-px h-[3px] rounded-full"
                  style={{ background: 'var(--tp-action-primary)' }}
                />
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="mt-6 rounded-3xl border border-slate-200 bg-white shadow-[0_18px_60px_rgba(2,6,23,0.08)]">
        {filtered.map((f, idx) => {
          const isOpen = openQ === f.q;
          return (
            <div key={f.q} className={idx === 0 ? '' : 'border-t border-slate-200'}>
              <button
                type="button"
                onClick={() => setOpenQ((prev) => (prev === f.q ? null : f.q))}
                className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left"
              >
                <div className="text-sm font-extrabold text-slate-950">{f.q}</div>
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700">
                  <span className={"transition " + (isOpen ? 'rotate-180' : '')}>⌄</span>
                </div>
              </button>

              {isOpen ? (
                <div className="px-6 pb-5 text-sm leading-relaxed text-slate-600">{f.a}</div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
