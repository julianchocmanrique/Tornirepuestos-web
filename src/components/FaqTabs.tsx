'use client';

import { useMemo, useState } from 'react';

export type FaqItem = { q: string; a: string; category: string };

export function FaqTabs({ items }: { items: FaqItem[] }) {
  const [openQ, setOpenQ] = useState<string | null>(null);

  return (
    <div>
      <div className="mt-6 rounded-3xl border border-slate-200 bg-white shadow-[0_18px_60px_rgba(2,6,23,0.08)]">
        {items.map((f, idx) => {
          const isOpen = openQ === f.q;
          return (
            <div key={f.q} className={idx === 0 ? '' : 'border-t border-slate-200'}>
              <button
                type="button"
                onClick={() => setOpenQ((prev) => (prev === f.q ? null : f.q))}
                className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left"
              >
                <div className="text-sm font-extrabold text-slate-950">{f.q}</div>
                <span className={"text-slate-500 transition " + (isOpen ? 'rotate-180' : '')}>⌄</span>
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

