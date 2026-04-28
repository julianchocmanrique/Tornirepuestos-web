export const SITE_NAME = "Tornirepuestos";
export const SITE_URL = "https://tornirepuestos.com";
export const DEFAULT_OG_IMAGE = "/hero/og-whatsapp.png";

export function absoluteUrl(path: string) {
  if (!path || path === "/") return `${SITE_URL}/`;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
