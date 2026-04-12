import Image from 'next/image';
import Link from 'next/link';

import { wa } from '@/lib/wa';

export function SiteHeader() {
  const phone = '+57 310 653 1208';
  const waText = 'Hola, quiero cotizar un repuesto. ¿Me ayudas con disponibilidad y precio?';

  return (
    <header className="sticky top-0 z-50">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative h-11 w-11 overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <Image
                src="/logo-header-square.jpg"
                alt="Tornirepuestos"
                fill
                className="object-contain"
              />
            </div>
            <div>
              <div className="text-sm font-extrabold text-slate-900">TORNIREPUESTOS</div>
              <div className="text-xs text-slate-600">Santa Marta · Repuestos</div>
            </div>
          </Link>

          <nav className="flex items-center gap-5 overflow-x-auto whitespace-nowrap text-sm text-slate-700">
            <Link className="hover:text-slate-900" href="/">
              Inicio
            </Link>
            <Link className="hover:text-slate-900" href="/catalogo">
              Catálogo
            </Link>
            <Link className="hover:text-slate-900" href="/categorias">
              Categorías
            </Link>
            <Link className="hover:text-slate-900" href="/nosotros">
              Nosotros
            </Link>
            <Link className="hover:text-slate-900" href="/preguntas">
              Preguntas
            </Link>
            <Link className="hover:text-slate-900" href="/contacto">
              Contacto
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <a
              className="hidden rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 lg:inline-flex"
              href={`tel:${phone.replace(/\s+/g, '')}`}
              aria-label="Llamar"
            >
              📞
            </a>
            <a
              className="hidden items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold text-white lg:inline-flex"
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
