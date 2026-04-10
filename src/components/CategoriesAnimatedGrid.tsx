'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';

type Category = {
  slug: string;
  title: string;
  kicker: string;
  desc: string;
  img: string;
};

function useScrollDirection() {
  const lastY = useRef<number>(0);
  const [dir, setDir] = useState<'up' | 'down'>('down');

  useEffect(() => {
    lastY.current = window.scrollY;
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        if (Math.abs(y - lastY.current) > 2) {
          setDir(y > lastY.current ? 'down' : 'up');
          lastY.current = y;
        }
        ticking = false;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return dir;
}

export function CategoriesAnimatedGrid({ categories }: { categories: Category[] }) {
  const dir = useScrollDirection();

  const items = useMemo(() => categories.map((c, idx) => ({ c, idx })), [categories]);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const els = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]'));

    // Initial state
    for (const el of els) {
      el.dataset.state = 'out';
      el.dataset.dir = 'down';
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const el = e.target as HTMLElement;
          if (e.isIntersecting) {
            el.dataset.state = 'in';
            el.dataset.dir = dir;
          } else {
            // when leaving viewport, push out in the current scroll direction
            el.dataset.state = 'out';
            el.dataset.dir = dir;
          }
        }
      },
      {
        root: null,
        threshold: 0.18,
        rootMargin: '0px 0px -10% 0px',
      }
    );

    for (const el of els) io.observe(el);
    return () => io.disconnect();
  }, [dir]);

  return (
    <div ref={rootRef} className="mt-8 grid grid-cols-12 gap-4">
      {items.map(({ c, idx }) => {
        const tone = idx % 3 === 0 ? 'red' : 'dark';
        const span =
          idx % 7 === 0
            ? 'col-span-12 md:col-span-8'
            : idx % 5 === 0
              ? 'col-span-12 md:col-span-6'
              : 'col-span-12 md:col-span-4';

        const from = idx % 2 === 0 ? 'left' : 'right';

        return (
          <Link
            key={c.slug}
            href={`/categorias/${c.slug}`}
            data-reveal
            data-from={from}
            className={`tp-reveal tp-card group relative overflow-hidden rounded-3xl border border-slate-200 bg-[var(--tp-surface-card)] shadow-sm transition ${span}`}
          >
            <div className="absolute inset-0">
              <Image
                src={c.img}
                alt={c.title}
                fill
                className="tp-card__img object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/85 via-slate-950/35 to-transparent" />
              {tone === 'red' && (
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(225,6,0,0.45),transparent_55%)]" />
              )}
            </div>

            <div className="relative flex h-full min-h-[210px] flex-col justify-between p-6 text-white">
              <div>
                <div className="text-[11px] font-semibold tracking-[0.18em] text-white/70">{c.kicker}</div>
                <div className="mt-2 text-2xl font-extrabold leading-tight">{c.title}</div>
                <p className="mt-2 max-w-[54ch] text-sm text-white/80">{c.desc}</p>
              </div>

              <div className="mt-6 flex items-center justify-between gap-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-white/85">
                  <span>Ver detalle</span>
                </div>
                <div
                  className="inline-flex h-10 w-10 items-center justify-center rounded-2xl text-white"
                  style={{ background: 'var(--tp-action-primary)' }}
                  aria-hidden
                >
                  →
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
