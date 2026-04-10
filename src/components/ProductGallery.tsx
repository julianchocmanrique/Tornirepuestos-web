import Image from 'next/image';
import Link from 'next/link';

import { categories } from '@/lib/categories';
import { wa } from '@/lib/wa';

const PRODUCT_SAMPLES: Record<string, { name: string; note?: string }[]> = {
  frenos: [
    { name: 'Pastillas de freno', note: 'Camión / bus' },
    { name: 'Bandas de freno', note: 'Trabajo pesado' },
    { name: 'Discos / tambores', note: 'Según referencia' },
    { name: 'Cámaras / válvulas', note: 'Compatibilidad' },
    { name: 'Sensores ABS', note: 'Eléctrico' },
    { name: 'Kit reparación', note: 'Mantenimiento' },
  ],
  filtracion: [
    { name: 'Filtro de aceite', note: 'Motor' },
    { name: 'Filtro de aire', note: 'Admisión' },
    { name: 'Filtro de combustible', note: 'Diésel' },
    { name: 'Separador de agua', note: 'Protección' },
    { name: 'Filtro hidráulico', note: 'Maquinaria' },
    { name: 'Kit filtros', note: 'Preventivo' },
  ],
  suspension: [
    { name: 'Amortiguadores', note: 'Carga / confort' },
    { name: 'Bujes', note: 'Tren delantero' },
    { name: 'Resortes', note: 'Suspensión' },
    { name: 'Barras / terminales', note: 'Dirección' },
    { name: 'Soportes', note: 'Montaje' },
    { name: 'Kit suspensión', note: 'Reparación' },
  ],
  motor: [
    { name: 'Correas', note: 'Accesorios' },
    { name: 'Empaques / sellos', note: 'Fugas' },
    { name: 'Bombas', note: 'Refrigeración' },
    { name: 'Sensores', note: 'Control' },
    { name: 'Filtros', note: 'Mantenimiento' },
    { name: 'Componentes varios', note: 'Según referencia' },
  ],
  'electricos-y-luces': [
    { name: 'Farolas / stops', note: 'Iluminación' },
    { name: 'Bombillos / LED', note: 'Repuestos' },
    { name: 'Conectores', note: 'Cableado' },
    { name: 'Switches', note: 'Control' },
    { name: 'Fusibles / relés', note: 'Protección' },
    { name: 'Arneses', note: 'Instalación' },
  ],
  transmision: [
    { name: 'Crucetas', note: 'Cardán' },
    { name: 'Rodamientos', note: 'Soporte' },
    { name: 'Retenes', note: 'Sellado' },
    { name: 'Kits reparación', note: 'Caja/diferencial' },
    { name: 'Componentes varios', note: 'Torque' },
    { name: 'Lubricantes', note: 'Mantenimiento' },
  ],
  'rodamientos-y-retenedores': [
    { name: 'Rodamientos', note: 'Rígidos / cónicos' },
    { name: 'Retenedores', note: 'Sellado' },
    { name: 'Kits', note: 'Reparación' },
    { name: 'Sellos', note: 'Compatibilidad' },
    { name: 'Grasas', note: 'Lubricación' },
    { name: 'Accesorios', note: 'Montaje' },
  ],
};

export function ProductGallery({ slug }: { slug: string }) {
  const cat = categories.find((c) => c.slug === slug);
  const list = PRODUCT_SAMPLES[slug] || PRODUCT_SAMPLES['motor'];

  const waText = `Hola, quiero cotizar repuestos de la categoría: ${cat?.title || slug}. ¿Qué disponibilidad y precio tienen?`;

  return (
    <section className="mt-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-xs uppercase tracking-wide text-white/60">Galería</div>
          <h2 className="mt-2 text-2xl font-extrabold text-white">Productos comunes</h2>
          <p className="mt-2 max-w-2xl text-sm text-white/70">
            Referencias típicas de esta categoría. Si no ves lo que buscas, escríbenos y te ayudamos a encontrar la pieza correcta.
          </p>
        </div>
        <Link
          className="inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold text-white"
          style={{ background: 'var(--tp-action-primary)' }}
          href={wa(waText)}
          target="_blank"
          rel="noreferrer"
        >
          Cotizar por WhatsApp
        </Link>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((p) => (
          <div
            key={p.name}
            className="group relative overflow-hidden rounded-3xl border border-white/10 bg-[var(--tp-surface-card)] p-5 shadow-[0_18px_60px_rgba(2,6,23,0.35)] backdrop-blur"
          >
            {cat?.img ? (
              <div className="absolute inset-0">
                <Image
                  src={cat.img}
                  alt=""
                  fill
                  className="object-cover opacity-[0.22] transition duration-500 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/65 via-slate-950/20 to-transparent" />
              </div>
            ) : null}

            <div className="relative">
              <div className="text-sm font-extrabold text-white/95">{p.name}</div>
              {p.note ? <div className="mt-1 text-xs text-white/70">{p.note}</div> : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
