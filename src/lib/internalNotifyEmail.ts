const RESEND_API_URL = "https://api.resend.com/emails";
const DEFAULT_TO = "julianchocmarique@gmail.com";
const DEFAULT_FROM = "Tornirepuestos <notificaciones@tornirepuestos.com>";

type WhatsAppNotifyPayload = {
  at: string;
  source: string;
  destinationPublic: string;
  destinationInternalMirror: string;
  path: string;
  query: string;
  userAgent: string;
  referer: string;
  ip: string;
  text: string;
};

function buildHtml(payload: WhatsAppNotifyPayload) {
  return `
    <h2>Nuevo contacto por WhatsApp</h2>
    <p><strong>Fecha:</strong> ${payload.at}</p>
    <p><strong>Destino público:</strong> ${payload.destinationPublic}</p>
    <p><strong>Destino interno:</strong> ${payload.destinationInternalMirror}</p>
    <p><strong>IP:</strong> ${payload.ip || "N/D"}</p>
    <p><strong>Referer:</strong> ${payload.referer || "N/D"}</p>
    <p><strong>User-Agent:</strong> ${payload.userAgent || "N/D"}</p>
    <p><strong>Ruta:</strong> ${payload.path}${payload.query}</p>
    <hr />
    <p><strong>Mensaje:</strong></p>
    <pre style="white-space: pre-wrap;">${payload.text}</pre>
  `;
}

export async function sendInternalEmailNotification(
  payload: WhatsAppNotifyPayload,
) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[WA_EMAIL_NOTIFY] Missing RESEND_API_KEY");
    return;
  }

  const to = process.env.INTERNAL_NOTIFY_EMAIL_TO || DEFAULT_TO;
  const from = process.env.INTERNAL_NOTIFY_EMAIL_FROM || DEFAULT_FROM;

  const res = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: "Nuevo clic a WhatsApp - Tornirepuestos",
      html: buildHtml(payload),
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(
      `[WA_EMAIL_NOTIFY] Resend failed (${res.status}): ${body || "no-body"}`,
    );
  }
}
