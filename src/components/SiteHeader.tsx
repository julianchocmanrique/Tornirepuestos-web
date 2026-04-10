import Image from 'next/image';
import Link from 'next/link';

import { wa } from '@/lib/wa';

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M16 3C9.372 3 4 8.19 4 14.588c0 2.52.85 4.85 2.3 6.75L5 29l7.98-2.07c1.84.97 3.96 1.53 6.24 1.53 6.628 0 12-5.19 12-11.588C31.22 8.19 22.628 3 16 3Z"
        fill="#25D366"
      />
      <path
        d="M25.27 20.88c-.39 1.08-1.94 1.98-3.15 2.23-.84.17-1.93.31-5.59-1.16-4.68-1.86-7.7-6.43-7.93-6.74-.22-.31-1.88-2.43-1.88-4.64 0-2.2 1.2-3.28 1.63-3.72.43-.44.93-.55 1.24-.55.3 0 .62 0 .89.01.29.01.68-.1 1.06.8.39.93 1.34 3.22 1.45 3.45.12.23.2.5.05.8-.15.31-.23.5-.46.77-.22.27-.48.6-.69.81-.22.21-.44.43-.19.82.25.39 1.11 1.78 2.38 2.88 1.63 1.41 3.01 1.85 3.44 2.05.43.2.68.17.94-.1.26-.27 1.06-1.2 1.35-1.62.29-.41.58-.34.98-.2.4.14 2.55 1.16 2.99 1.37.44.21.73.31.84.48.11.17.11.98-.28 2.06Z"
        fill="#fff"
      />
    </svg>
  );
}

export function SiteHeader() {
  const phone = '+57 310 653 1208';
  const waText = 'Hola, quiero cotizar un repuesto. ¿Me ayudas con disponibilidad y precio?';

  return (
    <header className="sticky top-0 z-50">

      <div className="border-b border-slate-200/70 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-slate-200 bg-white">
              <Image src="/logo-tornirepuestos.jpg" alt="Tornirepuestos" fill className="object-contain" />
            </div>
            <div>
              <div className="text-sm font-extrabold text-slate-900">TORNIREPUESTOS</div>
              <div className="text-xs text-slate-600">Santa Marta · Repuestos</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 text-sm text-slate-700 md:flex">
            <Link className="hover:text-slate-900" href="/">
              Inicio
            </Link>
            <Link className="hover:text-slate-900" href="/categorias#categorias">
              Categorías
            </Link>
            <Link className="hover:text-slate-900" href="/nosotros">
              Nosotros
            </Link>
            <Link className="hover:text-slate-900" href="/#faq">
              Preguntas
            </Link>
            <Link className="hover:text-slate-900" href="/#contacto">
              Contacto
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <a
              className="hidden rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 md:inline-flex"
              href={`tel:${phone.replace(/\s+/g, '')}`}
              aria-label="Llamar"
            >
              ✆
            </a>
            <a
              className="inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-semibold text-white shadow-sm"
              style={{ background: 'var(--tp-action-primary)' }}
              href={wa(waText)}
              target="_blank"
              rel="noreferrer"
            >
              Solicitar Cotización
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
