import type { Category } from "@/lib/categories";

export function seoParagraph(cat: Category) {
  // Texto SEO corto, natural y útil (sin keyword stuffing)
  // Enfocado a Santa Marta + envíos Colombia + categoría
  return `En Tornirepuestos (Santa Marta) cotizas ${cat.title.toLowerCase()} para vehículos pesados, buses y maquinaria. Te asesoramos para validar compatibilidad y referencia, y coordinamos envío a todo Colombia (a convenir). Escríbenos por WhatsApp con placa, referencia o una foto para recibir disponibilidad y precio.`;
}
