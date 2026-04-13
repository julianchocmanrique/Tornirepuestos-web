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
    "photo-1613214150384-14921ff659b2",
    "photo-1486262715619-67b85e0b08d3",
    "photo-1711199694531-e982a79ea381",
    "photo-1736161999520-0a20fa297a89",
    "photo-1589391349202-900abe66462a",
  ],
  filtracion: [
    "photo-1527383418406-f85a3b146499",
    "photo-1429772011165-0c2e054367b8",
    "photo-1711199694531-e982a79ea381",
    "photo-1613214150384-14921ff659b2",
    "photo-1487754180451-c456f719a1fc",
  ],
  suspension: [
    "photo-1669136048337-5daa3adef7b2",
    "photo-1598023707207-276835c2b5fe",
    "photo-1711199694531-e982a79ea381",
    "photo-1708716334127-251478e5ff37",
    "photo-1736161999520-0a20fa297a89",
  ],
  motor: [
    "photo-1429772011165-0c2e054367b8",
    "photo-1711199694531-e982a79ea381",
    "photo-1589391349202-900abe66462a",
    "photo-1527383418406-f85a3b146499",
    "photo-1613214150384-14921ff659b2",
  ],
  electricos: [
    "photo-1486262715619-67b85e0b08d3",
    "photo-1711199694531-e982a79ea381",
    "photo-1527383418406-f85a3b146499",
    "photo-1708716334127-251478e5ff37",
    "photo-1605701249987-f0bb9b505d06",
  ],
  transmision: [
    "photo-1711199694531-e982a79ea381",
    "photo-1589391349202-900abe66462a",
    "photo-1736161999520-0a20fa297a89",
    "photo-1613214150384-14921ff659b2",
    "photo-1429772011165-0c2e054367b8",
  ],
  rodamientos: [
    "photo-1589391349202-900abe66462a",
    "photo-1708716334127-251478e5ff37",
    "photo-1736161999520-0a20fa297a89",
    "photo-1605701249987-f0bb9b505d06",
    "photo-1711199694531-e982a79ea381",
  ],
  mangueras: [
    "photo-1598023707207-276835c2b5fe",
    "photo-1487754180451-c456f719a1fc",
    "photo-1708716334127-251478e5ff37",
    "photo-1527383418406-f85a3b146499",
    "photo-1736161999520-0a20fa297a89",
  ],
  lubricantes: [
    "photo-1487754180451-c456f719a1fc",
    "photo-1527383418406-f85a3b146499",
    "photo-1429772011165-0c2e054367b8",
    "photo-1598023707207-276835c2b5fe",
    "photo-1711199694531-e982a79ea381",
  ],
  tornilleria: [
    "photo-1605701249987-f0bb9b505d06",
    "photo-1708716334127-251478e5ff37",
    "photo-1736161999520-0a20fa297a89",
    "photo-1589391349202-900abe66462a",
    "photo-1527383418406-f85a3b146499",
  ],
  herramientas: [
    "photo-1708716334127-251478e5ff37",
    "photo-1605701249987-f0bb9b505d06",
    "photo-1711199694531-e982a79ea381",
    "photo-1736161999520-0a20fa297a89",
    "photo-1598023707207-276835c2b5fe",
  ],
  diferenciales: [
    "photo-1736161999520-0a20fa297a89",
    "photo-1711199694531-e982a79ea381",
    "photo-1589391349202-900abe66462a",
    "photo-1605701249987-f0bb9b505d06",
    "photo-1429772011165-0c2e054367b8",
  ],
  general: [
    "photo-1527383418406-f85a3b146499",
    "photo-1613214150384-14921ff659b2",
    "photo-1429772011165-0c2e054367b8",
    "photo-1711199694531-e982a79ea381",
    "photo-1736161999520-0a20fa297a89",
    "photo-1605701249987-f0bb9b505d06",
    "photo-1708716334127-251478e5ff37",
    "photo-1487754180451-c456f719a1fc",
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
  const id = pool[seed % pool.length];

  // URL unica por producto con variacion visible (color/luz) para evitar repeticion perceptible.
  const sat = -12 + (seed % 25); // -12 .. 12
  const exp = -10 + ((seed >> 4) % 21); // -10 .. 10
  const con = -10 + ((seed >> 8) % 21); // -10 .. 10
  const usm = 10 + ((seed >> 12) % 18); // 10 .. 27
  const hue = (seed % 360).toString(16).padStart(6, "0").slice(0, 6);
  const alpha = 14 + ((seed >> 6) % 20); // 14 .. 33
  const blendModes = ["multiply", "overlay", "softlight", "hardlight"];
  const blendMode = blendModes[(seed >> 10) % blendModes.length];

  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&h=800&q=68&crop=entropy&sat=${sat}&exp=${exp}&con=${con}&usm=${usm}&blend=${hue}&blend-mode=${blendMode}&blend-alpha=${alpha}&v=${seed}`;
}

export function productVisualDataUrl(input: ProductVisualInput): string {
  return pickPhoto(input);
}
