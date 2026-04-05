export const WHATSAPP_PHONE_E164 = "573106531208";
export const WHATSAPP_LINK = `https://api.whatsapp.com/send?phone=${WHATSAPP_PHONE_E164}`;

// Prefijo fijo para todos los mensajes que salen desde la web.
export const WA_PREFIX = "Hola, te contactamos desde tornirepuestos.com.\n\n";

export function wa(text: string) {
  return `${WHATSAPP_LINK}&text=${encodeURIComponent(WA_PREFIX + text)}`;
}
