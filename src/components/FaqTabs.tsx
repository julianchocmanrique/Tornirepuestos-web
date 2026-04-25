'use client';

import { useState } from 'react';

export type FaqItem = { q: string; a: string; category: string };

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

export function FaqTabs({ items }: { items: FaqItem[] }) {
  const [openQ, setOpenQ] = useState<string | null>(null);

  return (
    <div>
      <div className="mt-6 divide-y divide-slate-100 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_4px_20px_rgba(2,6,23,0.07)]">
        {items.map((f) => {
          const isOpen = openQ === f.q;
          return (
            <div key={f.q}>
              <button
                type="button"
                onClick={() => setOpenQ((prev) => (prev === f.q ? null : f.q))}
                className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left transition-colors hover:bg-slate-50"
              >
                <div className="text-sm font-semibold text-slate-900">{f.q}</div>
                <ChevronIcon open={isOpen} />
              </button>
              {isOpen && (
                <div className="px-6 pb-5 text-sm leading-relaxed text-slate-600">{f.a}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
