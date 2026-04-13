type ProductVisualInput = {
  code?: string;
  name: string;
  category?: string;
  variant?: number;
};

function hashText(text: string): number {
  let h = 0;
  for (let i = 0; i < text.length; i += 1) {
    h = (h * 31 + text.charCodeAt(i)) >>> 0;
  }
  return h;
}

type Family =
  | "frenos"
  | "filtracion"
  | "suspension"
  | "motor"
  | "electricos"
  | "transmision"
  | "rodamientos"
  | "mangueras"
  | "lubricantes"
  | "tornilleria"
  | "herramientas"
  | "diferenciales"
  | "general";

const PHOTO_POOL: Record<Family, string[]> = {
  frenos: [
    "https://images.unsplash.com/photo-1613214150384-14921ff659b2?auto=format&fit=crop&w=1200&q=72",
    "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=1200&q=72",
  ],
  filtracion: [
    "https://images.unsplash.com/photo-1527383418406-f85a3b146499?auto=format&fit=crop&w=1200&q=72",
    "https://images.unsplash.com/photo-1429772011165-0c2e054367b8?auto=format&fit=crop&w=1200&q=72",
  ],
  suspension: [
    "https://images.unsplash.com/photo-1669136048337-5daa3adef7b2?auto=format&fit=crop&w=1200&q=72",
    "https://images.unsplash.com/photo-1598023707207-276835c2b5fe?auto=format&fit=crop&w=1200&q=72",
  ],
  motor: [
    "https://images.unsplash.com/photo-1429772011165-0c2e054367b8?auto=format&fit=crop&w=1200&q=72",
    "https://images.unsplash.com/photo-1711199694531-e982a79ea381?auto=format&fit=crop&w=1200&q=72",
  ],
  electricos: [
    "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=1200&q=72",
    "https://images.unsplash.com/photo-1711199694531-e982a79ea381?auto=format&fit=crop&w=1200&q=72",
  ],
  transmision: [
    "https://images.unsplash.com/photo-1711199694531-e982a79ea381?auto=format&fit=crop&w=1200&q=72",
    "https://images.unsplash.com/photo-1589391349202-900abe66462a?auto=format&fit=crop&w=1200&q=72",
  ],
  rodamientos: [
    "https://images.unsplash.com/photo-1589391349202-900abe66462a?auto=format&fit=crop&w=1200&q=72",
    "https://images.unsplash.com/photo-1708716334127-251478e5ff37?auto=format&fit=crop&w=1200&q=72",
  ],
  mangueras: [
    "https://images.unsplash.com/photo-1598023707207-276835c2b5fe?auto=format&fit=crop&w=1200&q=72",
    "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=1200&q=72",
  ],
  lubricantes: [
    "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=1200&q=72",
    "https://images.unsplash.com/photo-1527383418406-f85a3b146499?auto=format&fit=crop&w=1200&q=72",
  ],
  tornilleria: [
    "https://images.unsplash.com/photo-1605701249987-f0bb9b505d06?auto=format&fit=crop&w=1200&q=72",
    "https://images.unsplash.com/photo-1708716334127-251478e5ff37?auto=format&fit=crop&w=1200&q=72",
  ],
  herramientas: [
    "https://images.unsplash.com/photo-1708716334127-251478e5ff37?auto=format&fit=crop&w=1200&q=72",
    "https://images.unsplash.com/photo-1605701249987-f0bb9b505d06?auto=format&fit=crop&w=1200&q=72",
  ],
  diferenciales: [
    "https://images.unsplash.com/photo-1736161999520-0a20fa297a89?auto=format&fit=crop&w=1200&q=72",
    "https://images.unsplash.com/photo-1711199694531-e982a79ea381?auto=format&fit=crop&w=1200&q=72",
  ],
  general: [
    "https://images.unsplash.com/photo-1527383418406-f85a3b146499?auto=format&fit=crop&w=1200&q=72",
    "https://images.unsplash.com/photo-1613214150384-14921ff659b2?auto=format&fit=crop&w=1200&q=72",
    "https://images.unsplash.com/photo-1429772011165-0c2e054367b8?auto=format&fit=crop&w=1200&q=72",
  ],
};

function resolveFamily(input: ProductVisualInput): Family {
  const haystack = `${input.name} ${input.category || ""}`.toLowerCase();

  if (/(freno|pastilla|disco|valvula|camara)/.test(haystack)) {
    return "frenos";
  }
  if (/(filtro|filtracion|aire|combustible|aceite)/.test(haystack)) {
    return "filtracion";
  }
  if (/(suspension|amortiguador|muelle|resorte|bolsa)/.test(haystack)) {
    return "suspension";
  }
  if (/(motor|empaque|sello|piston|biela)/.test(haystack)) {
    return "motor";
  }
  if (/(electrico|luz|faro|conector|cable|sensor)/.test(haystack)) {
    return "electricos";
  }
  if (/(transmision|clutch|caja|cardan|cruceta)/.test(haystack)) {
    return "transmision";
  }
  if (/(rodamiento|reten|ruleman)/.test(haystack)) {
    return "rodamientos";
  }
  if (/(manguera|racor|abrazadera|tubo)/.test(haystack)) {
    return "mangueras";
  }
  if (/(lubricante|grasa|aditivo|hidraulico|refrigerante)/.test(haystack)) {
    return "lubricantes";
  }
  if (/(tornillo|tuerca|arandela|tornilleria)/.test(haystack)) {
    return "tornilleria";
  }
  if (/(herramienta|llave|destornillador|alicate)/.test(haystack)) {
    return "herramientas";
  }
  if (/(diferencial|corona|piñon|planetario)/.test(haystack)) {
    return "diferenciales";
  }

  return "general";
}

function pickPhoto(input: ProductVisualInput): string {
  const family = resolveFamily(input);
  const pool = PHOTO_POOL[family];
  const raw = `${input.code || ""}|${input.name}|${input.category || ""}|${input.variant || 0}`;
  const seed = hashText(raw);
  return pool[seed % pool.length];
}

export function productVisualDataUrl(input: ProductVisualInput): string {
  return pickPhoto(input);
}
