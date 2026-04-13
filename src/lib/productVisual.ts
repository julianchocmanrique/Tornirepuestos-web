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

function esc(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function categoryLabel(category?: string) {
  if (!category) return "REPUESTO";
  const normalized = category.replace(/-/g, " ").toUpperCase();
  return normalized.slice(0, 22);
}

function crop(text: string, size: number) {
  return text.length <= size ? text : `${text.slice(0, size - 1)}…`;
}

export function productVisualDataUrl(input: ProductVisualInput): string {
  const seed = `${input.code || ""}|${input.name}|${input.category || ""}|${input.variant || 0}`;
  const h = hashText(seed);
  const h2 = hashText(`${seed}-b`);
  const hue = h % 360;
  const hue2 = (hue + 35 + (h2 % 40)) % 360;
  const hue3 = (hue + 75) % 360;
  const bg1 = `hsl(${hue}, 78%, 26%)`;
  const bg2 = `hsl(${hue2}, 78%, 18%)`;
  const line = `hsl(${hue3}, 88%, 56%)`;

  const code = crop((input.code || "INV").toUpperCase(), 24);
  const label = crop(categoryLabel(input.category), 22);
  const title = crop(input.name.toUpperCase(), 34);

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="520" viewBox="0 0 800 520">
  <defs>
    <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${bg1}" />
      <stop offset="100%" stop-color="${bg2}" />
    </linearGradient>
    <linearGradient id="g2" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="rgba(255,255,255,0.22)" />
      <stop offset="100%" stop-color="rgba(255,255,255,0)" />
    </linearGradient>
  </defs>
  <rect width="800" height="520" fill="url(#g1)" />
  <circle cx="680" cy="-40" r="220" fill="rgba(255,255,255,0.10)" />
  <circle cx="120" cy="560" r="180" fill="rgba(255,255,255,0.08)" />
  <path d="M0 412 L800 312 L800 352 L0 452 Z" fill="${line}" opacity="0.26" />
  <rect x="48" y="46" rx="14" ry="14" width="220" height="44" fill="rgba(255,255,255,0.92)" />
  <text x="66" y="76" fill="#0f172a" font-family="Arial, sans-serif" font-size="24" font-weight="700">${esc(code)}</text>
  <text x="52" y="134" fill="rgba(255,255,255,0.92)" font-family="Arial, sans-serif" font-size="22" letter-spacing="2">${esc(label)}</text>
  <text x="52" y="194" fill="#ffffff" font-family="Arial, sans-serif" font-size="42" font-weight="800">${esc(title)}</text>
  <rect x="52" y="214" width="510" height="8" fill="url(#g2)" />
  <g transform="translate(612 248)">
    <circle cx="74" cy="74" r="74" fill="rgba(255,255,255,0.18)" />
    <circle cx="74" cy="74" r="52" fill="rgba(255,255,255,0.88)" />
    <circle cx="74" cy="74" r="32" fill="${line}" />
  </g>
</svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
