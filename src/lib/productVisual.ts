type ProductVisualInput = {
  code?: string;
  name: string;
  category?: string;
  variant?: number;
};

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

function hashText(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function esc(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function crop(text: string, size: number) {
  return text.length <= size ? text : `${text.slice(0, size - 1)}...`;
}

function resolveFamily(input: ProductVisualInput): Family {
  const haystack = `${input.name} ${input.category || ""}`.toLowerCase();
  if (/(freno|pastilla|disco|valvula|camara|balata)/.test(haystack)) return "frenos";
  if (/(filtro|filtracion|aire|combustible)/.test(haystack)) return "filtracion";
  if (/(suspension|amortiguador|muelle|resorte|bolsa)/.test(haystack)) return "suspension";
  if (/(motor|empaque|sello|piston|biela|culata)/.test(haystack)) return "motor";
  if (/(electrico|luz|faro|conector|cable|sensor|rele|relay)/.test(haystack)) return "electricos";
  if (/(transmision|clutch|caja|cardan|cruceta)/.test(haystack)) return "transmision";
  if (/(rodamiento|reten|ruleman)/.test(haystack)) return "rodamientos";
  if (/(manguera|racor|abrazadera|tubo)/.test(haystack)) return "mangueras";
  if (/(lubricante|grasa|aditivo|hidraulico|refrigerante|aceite)/.test(haystack))
    return "lubricantes";
  if (/(tornillo|tuerca|arandela|tornilleria|perno)/.test(haystack)) return "tornilleria";
  if (/(herramienta|llave|destornillador|alicate|dados)/.test(haystack)) return "herramientas";
  if (/(diferencial|corona|piñon|planetario|eje)/.test(haystack)) return "diferenciales";
  return "general";
}

const PALETTES = [
  { bg1: "#0b1f36", bg2: "#1a3b5f", ac1: "#e10600", ac2: "#ffb703" },
  { bg1: "#11222f", bg2: "#1f3f57", ac1: "#2dd4bf", ac2: "#f59e0b" },
  { bg1: "#181e36", bg2: "#2b2f59", ac1: "#ef4444", ac2: "#60a5fa" },
  { bg1: "#15211c", bg2: "#274336", ac1: "#22c55e", ac2: "#f97316" },
  { bg1: "#241a2f", bg2: "#3b2d52", ac1: "#a855f7", ac2: "#f43f5e" },
];

function splitLines(text: string, maxLineLen: number, maxLines: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length <= maxLineLen) {
      current = next;
    } else {
      if (current) lines.push(current);
      current = word;
      if (lines.length >= maxLines - 1) break;
    }
  }
  if (lines.length < maxLines && current) lines.push(current);
  if (lines.length > maxLines) lines.length = maxLines;
  if (lines.length === maxLines) lines[maxLines - 1] = crop(lines[maxLines - 1], maxLineLen);
  return lines;
}

function familyLabel(family: Family): string {
  const map: Record<Family, string> = {
    frenos: "FRENOS",
    filtracion: "FILTRACION",
    suspension: "SUSPENSION",
    motor: "MOTOR",
    electricos: "ELECTRICOS",
    transmision: "TRANSMISION",
    rodamientos: "RODAMIENTOS",
    mangueras: "MANGUERAS",
    lubricantes: "LUBRICANTES",
    tornilleria: "TORNILLERIA",
    herramientas: "HERRAMIENTAS",
    diferenciales: "DIFERENCIALES",
    general: "GENERAL",
  };
  return map[family];
}

export function productVisualDataUrl(input: ProductVisualInput): string {
  const seedSource = `${input.code || ""}|${input.name}|${input.category || ""}|${input.variant || 0}`;
  const seed = hashText(seedSource);
  const family = resolveFamily(input);
  const palette = PALETTES[seed % PALETTES.length];
  const code = crop((input.code || "INV").toUpperCase(), 22);
  const category = crop((input.category || family).replace(/-/g, " ").toUpperCase(), 28);
  const nameLines = splitLines(input.name.toUpperCase(), 28, 3);

  const bars = Array.from({ length: 7 })
    .map((_, i) => {
      const h = 54 + ((seed >> (i + 2)) % 108);
      const x = 730 + i * 42;
      return `<rect x="${x}" y="${560 - h}" width="24" height="${h}" rx="6" fill="#ffffff" opacity="0.14"/>`;
    })
    .join("");

  const titleSvg = nameLines
    .map(
      (line, i) =>
        `<text x="58" y="${286 + i * 58}" fill="#ffffff" font-family="Arial, sans-serif" font-size="50" font-weight="800">${esc(
          line
        )}</text>`
    )
    .join("");

  const familyText = familyLabel(family);

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${palette.bg1}" />
      <stop offset="100%" stop-color="${palette.bg2}" />
    </linearGradient>
    <radialGradient id="glow" cx="80%" cy="30%" r="52%">
      <stop offset="0%" stop-color="${palette.ac1}" stop-opacity="0.26" />
      <stop offset="100%" stop-color="${palette.ac1}" stop-opacity="0" />
    </radialGradient>
  </defs>
  <rect width="1200" height="800" fill="url(#bg)" />
  <rect width="1200" height="800" fill="url(#glow)" />
  <rect x="0" y="0" width="1200" height="128" fill="rgba(255,255,255,0.06)" />
  <rect x="58" y="44" width="215" height="48" rx="14" fill="rgba(255,255,255,0.86)" />
  <text x="76" y="77" fill="#0b1f36" font-family="Arial, sans-serif" font-size="28" font-weight="800">${esc(
    code
  )}</text>
  <rect x="290" y="44" width="226" height="48" rx="14" fill="rgba(255,255,255,0.12)" />
  <text x="312" y="77" fill="rgba(255,255,255,0.9)" font-family="Arial, sans-serif" font-size="23" font-weight="700">${esc(
    familyText
  )}</text>
  <text x="58" y="150" fill="rgba(255,255,255,0.88)" font-family="Arial, sans-serif" font-size="24" letter-spacing="2">${esc(
    category
  )}</text>
  <line x1="58" y1="172" x2="760" y2="172" stroke="rgba(255,255,255,0.22)" stroke-width="6" />
  ${titleSvg}
  <text x="58" y="570" fill="rgba(255,255,255,0.76)" font-family="Arial, sans-serif" font-size="28">Inventario disponible para cotizacion</text>
  <rect x="58" y="606" width="282" height="74" rx="20" fill="rgba(255,255,255,0.14)" />
  <text x="90" y="652" fill="#fff" font-family="Arial, sans-serif" font-size="30" font-weight="700">Stock y cotizacion</text>
  <rect x="710" y="250" width="420" height="420" rx="36" fill="rgba(255,255,255,0.05)" />
  <rect x="740" y="282" width="360" height="14" rx="7" fill="rgba(255,255,255,0.16)" />
  <rect x="740" y="316" width="260" height="14" rx="7" fill="rgba(255,255,255,0.1)" />
  <rect x="740" y="420" width="320" height="18" rx="9" fill="${palette.ac1}" opacity="0.38" />
  <rect x="740" y="456" width="280" height="12" rx="6" fill="rgba(255,255,255,0.12)" />
  <rect x="740" y="480" width="330" height="12" rx="6" fill="rgba(255,255,255,0.12)" />
  ${bars}
</svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
