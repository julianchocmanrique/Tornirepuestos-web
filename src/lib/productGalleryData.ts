import { categories } from './categories';

export type GalleryProduct = {
  name: string;
  note?: string;
};

// NOTE: Generated from INFORME_ROTACION_INVENTARIOS_2026 (ventas primary, salidas secondary)
// Keep it small: top 6 items per category.
export const GALLERY_PRODUCTS: Record<string, GalleryProduct[]> = {
  frenos: [
    { name: 'Pastillas de freno', note: 'Alta rotación' },
    { name: 'Bandas de freno', note: 'Trabajo pesado' },
    { name: 'Discos / tambores', note: 'Según referencia' },
    { name: 'Sensores ABS', note: 'Eléctrico' },
    { name: 'Kits reparación freno', note: 'Mantenimiento' },
    { name: 'Válvulas / cámaras', note: 'Compatibilidad' },
  ],
  filtracion: [
    { name: 'Filtro de aceite', note: 'Motor' },
    { name: 'Filtro de aire', note: 'Admisión' },
    { name: 'Filtro de combustible', note: 'Diésel' },
    { name: 'Separador de agua', note: 'Protección' },
    { name: 'Filtro hidráulico', note: 'Maquinaria' },
    { name: 'Kit de filtros', note: 'Preventivo' },
  ],
  suspension: [
    { name: 'Amortiguadores', note: 'Carga / confort' },
    { name: 'Bujes', note: 'Tren delantero' },
    { name: 'Resortes', note: 'Suspensión' },
    { name: 'Terminales / barras', note: 'Dirección' },
    { name: 'Soportes', note: 'Montaje' },
    { name: 'Kit suspensión', note: 'Reparación' },
  ],
  motor: [
    { name: 'Empaques / sellos', note: 'Alta rotación' },
    { name: 'Correas', note: 'Accesorios' },
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
    { name: 'Engranajes / piezas', note: 'Torque' },
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

export function getGalleryProducts(slug: string): GalleryProduct[] {
  return GALLERY_PRODUCTS[slug] || GALLERY_PRODUCTS.motor;
}

export function getCategoryTitle(slug: string): string {
  return categories.find((c) => c.slug === slug)?.title || slug;
}
