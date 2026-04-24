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
            <div className="relative h-16 w-16 overflow-hidden rounded-full border border-slate-200 bg-[#111c9d] shadow-sm ring-2 ring-slate-100">
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
              <div className="text-sm leading-tight text-slate-600 sm:text-base">Santa Marta · 2 sedes</div>
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
