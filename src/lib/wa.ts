export const WHATSAPP_PHONE_E164 = "573053560953";
export const WHOLESALE_WHATSAPP_PHONE_E164 = "573106551629";
export const WHATSAPP_DISPLAY = "+57 305 356 0953";
export const WHOLESALE_WHATSAPP_DISPLAY = "+57 310 655 1629";
export const INTERNAL_WA_MIRROR_PHONE_E164 = "573202861535";
export const WHATSAPP_LINK = `https://api.whatsapp.com/send?phone=${WHATSAPP_PHONE_E164}`;

// Prefijo fijo para todos los mensajes que salen desde la web.
export const WA_PREFIX = "Hola, te contactamos desde tornirepuestos.com.\n\n";

export function waDirect(text: string, phone = WHATSAPP_PHONE_E164) {
  return `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(WA_PREFIX + text)}`;
}

// Ruta interna: registra el intento y luego redirige al WhatsApp público.
export function wa(text: string, phone = WHATSAPP_PHONE_E164) {
  const params = new URLSearchParams({ text, phone });
  return `/api/wa-redirect?${params.toString()}`;
}

export function waWholesale(text: string) {
  return wa(text, WHOLESALE_WHATSAPP_PHONE_E164);
}
