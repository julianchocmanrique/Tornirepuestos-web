'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import { wa } from '@/lib/wa';

const navLinks = [
  { href: '/', label: 'Inicio' },
  { href: '/catalogo', label: 'Catálogo' },
  { href: '/categorias', label: 'Categorías' },
  { href: '/nosotros', label: 'Nosotros' },
  { href: '/preguntas', label: 'Preguntas' },
  { href: '/contacto', label: 'Contacto' },
];

export function SiteHeader() {
  const phone = '+57 310 653 1208';
  const waText = 'Hola, quiero cotizar un repuesto. ¿Me ayudas con disponibilidad y precio?';
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50">
      <div className="border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">

          <Link href="/" className="flex items-center gap-3">
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-[#111c9d] shadow-sm ring-2 ring-slate-100">
              <Image
                src="/tornirepuestos.jpeg"
                alt="Tornirepuestos"
                fill
                className="object-contain p-0.5"
              />
            </div>
            <div>
              <div className="text-base font-extrabold leading-tight text-slate-900 sm:text-lg">
                TORNIREPUESTOS
              </div>
              <div className="text-xs leading-tight text-slate-500 sm:text-sm">Santa Marta · 2 sedes</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-5 text-sm text-slate-600 lg:flex">
            {navLinks.map((l) => (
              <Link key={l.href} className="transition-colors hover:text-slate-900" href={l.href}>
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <a
              className="hidden rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50 lg:inline-flex"
              href={`tel:${phone.replace(/\s+/g, '')}`}
              aria-label="Llamar"
            >
              📞
            </a>
            <a
              className="hidden items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 lg:inline-flex"
              style={{ background: 'var(--tp-action-primary)' }}
              href={wa(waText)}
              target="_blank"
              rel="noreferrer"
            >
              Solicitar Cotización
            </a>

            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-50 lg:hidden"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
            >
              {mobileOpen ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="border-t border-slate-100 bg-white px-4 py-3 lg:hidden">
            <nav className="flex flex-col gap-0.5">
              {navLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900"
                  onClick={() => setMobileOpen(false)}
                >
                  {l.label}
                </Link>
              ))}
              <div className="mt-3 border-t border-slate-100 pt-3">
                <a
                  className="flex items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold text-white"
                  style={{ background: 'var(--tp-action-primary)' }}
                  href={wa(waText)}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setMobileOpen(false)}
                >
                  Solicitar Cotización
                </a>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
