export const WHATSAPP_PHONE_E164 = "573106531208";
export const INTERNAL_WA_MIRROR_PHONE_E164 = "573202861535";
export const WHATSAPP_LINK = `https://api.whatsapp.com/send?phone=${WHATSAPP_PHONE_E164}`;

// Prefijo fijo para todos los mensajes que salen desde la web.
export const WA_PREFIX = "Hola, te contactamos desde tornirepuestos.com.\n\n";

export function waDirect(text: string) {
  return `${WHATSAPP_LINK}&text=${encodeURIComponent(WA_PREFIX + text)}`;
}

// Ruta interna: registra el intento y luego redirige al WhatsApp público.
export function wa(text: string) {
  return `/api/wa-redirect?text=${encodeURIComponent(text)}`;
}
