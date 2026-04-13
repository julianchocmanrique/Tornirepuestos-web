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

function iconSvg(family: Family, seed: number, ac1: string, ac2: string) {
  const wobble = (seed % 9) - 4;
  switch (family) {
    case "frenos":
      return `<circle cx="865" cy="395" r="128" fill="none" stroke="${ac2}" stroke-width="20"/><circle cx="865" cy="395" r="52" fill="${ac1}" opacity="0.88"/><circle cx="865" cy="395" r="10" fill="#fff"/>`;
    case "filtracion":
      return `<rect x="770" y="280" width="190" height="240" rx="34" fill="${ac1}" opacity="0.86"/><rect x="800" y="312" width="130" height="174" rx="20" fill="#ffffff" opacity="0.94"/><line x1="815" y1="352" x2="915" y2="352" stroke="${ac2}" stroke-width="9"/>`;
    case "suspension":
      return `<path d="M785 300 C910 300, 820 510, 945 510" fill="none" stroke="${ac2}" stroke-width="19" stroke-linecap="round"/><circle cx="786" cy="300" r="18" fill="${ac1}"/><circle cx="944" cy="510" r="18" fill="${ac1}"/>`;
    case "motor":
      return `<rect x="760" y="300" width="220" height="178" rx="30" fill="${ac1}" opacity="0.85"/><rect x="790" y="330" width="64" height="120" rx="18" fill="#fff" opacity="0.9"/><rect x="885" y="330" width="64" height="120" rx="18" fill="#fff" opacity="0.9"/>`;
    case "electricos":
      return `<path d="M840 280 L920 280 L875 380 H945 L810 520 L850 415 H780 Z" fill="${ac2}" opacity="0.96"/><circle cx="880" cy="402" r="${24 + wobble}" fill="${ac1}" opacity="0.85"/>`;
    case "transmision":
      return `<circle cx="835" cy="392" r="78" fill="none" stroke="${ac2}" stroke-width="18"/><circle cx="932" cy="430" r="54" fill="none" stroke="${ac1}" stroke-width="14"/><line x1="892" y1="415" x2="881" y2="407" stroke="#fff" stroke-width="8" />`;
    case "rodamientos":
      return `<circle cx="870" cy="395" r="116" fill="none" stroke="${ac1}" stroke-width="24"/><circle cx="870" cy="395" r="75" fill="none" stroke="${ac2}" stroke-width="17"/><circle cx="870" cy="395" r="34" fill="#fff" opacity="0.95"/>`;
    case "mangueras":
      return `<path d="M745 480 C790 280, 955 540, 990 330" fill="none" stroke="${ac1}" stroke-width="26" stroke-linecap="round"/><circle cx="744" cy="480" r="16" fill="${ac2}"/><circle cx="990" cy="330" r="16" fill="${ac2}"/>`;
    case "lubricantes":
      return `<path d="M885 278 C952 359, 956 402, 888 488 C820 402, 822 359, 885 278 Z" fill="${ac2}" opacity="0.94"/><circle cx="885" cy="406" r="52" fill="${ac1}" opacity="0.7"/>`;
    case "tornilleria":
      return `<rect x="780" y="365" width="210" height="42" rx="12" fill="${ac1}" opacity="0.92"/><polygon points="760,386 790,350 790,422" fill="${ac2}"/><rect x="920" y="350" width="70" height="70" rx="12" fill="none" stroke="${ac2}" stroke-width="12"/>`;
    case "herramientas":
      return `<path d="M778 476 L916 338 L948 370 L810 508 Z" fill="${ac1}" opacity="0.9"/><circle cx="952" cy="332" r="30" fill="none" stroke="${ac2}" stroke-width="12"/>`;
    case "diferenciales":
      return `<line x1="760" y1="400" x2="980" y2="400" stroke="${ac2}" stroke-width="20"/><circle cx="870" cy="400" r="64" fill="none" stroke="${ac1}" stroke-width="18"/><circle cx="760" cy="400" r="22" fill="${ac1}"/><circle cx="980" cy="400" r="22" fill="${ac1}"/>`;
    default:
      return `<rect x="782" y="302" width="205" height="205" rx="28" fill="${ac1}" opacity="0.85"/><circle cx="885" cy="404" r="58" fill="${ac2}" opacity="0.75"/>`;
  }
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

  const icon = iconSvg(family, seed, palette.ac1, palette.ac2);

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
  <rect x="0" y="0" width="1200" height="118" fill="rgba(255,255,255,0.08)" />
  <rect x="58" y="44" width="215" height="48" rx="14" fill="rgba(255,255,255,0.9)" />
  <text x="76" y="77" fill="#0b1f36" font-family="Arial, sans-serif" font-size="28" font-weight="800">${esc(
    code
  )}</text>
  <text x="58" y="150" fill="rgba(255,255,255,0.88)" font-family="Arial, sans-serif" font-size="24" letter-spacing="2">${esc(
    category
  )}</text>
  <line x1="58" y1="172" x2="620" y2="172" stroke="rgba(255,255,255,0.28)" stroke-width="6" />
  ${titleSvg}
  <text x="58" y="570" fill="rgba(255,255,255,0.76)" font-family="Arial, sans-serif" font-size="28">Inventario disponible para cotizacion</text>
  <rect x="58" y="606" width="282" height="74" rx="20" fill="${palette.ac1}" />
  <text x="90" y="652" fill="#fff" font-family="Arial, sans-serif" font-size="30" font-weight="700">Stock y cotizacion</text>
  ${bars}
  ${icon}
</svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
