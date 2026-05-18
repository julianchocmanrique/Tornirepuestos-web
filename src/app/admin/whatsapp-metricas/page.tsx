import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getCookieName, verifySessionToken } from "@/lib/adminAuth";
import { getWaStats } from "@/lib/waStats";

export default async function AdminWhatsappMetricasPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getCookieName())?.value;

  if (!verifySessionToken(token)) {
    redirect("/admin/login");
  }

  const stats = await getWaStats();
  const byDayEntries = Object.entries(stats.byDay).sort((a, b) =>
    a[0] < b[0] ? 1 : -1,
  );

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-6 py-6 text-white">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">
                Panel administrativo
              </p>
              <h1 className="mt-2 text-3xl font-extrabold">
                Métricas de WhatsApp
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-200">
                Seguimiento interno de clics a cotización por WhatsApp.
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href="/admin/catalogo-stock"
                className="rounded-xl border border-slate-500/60 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20"
              >
                Ir a catálogo stock
              </Link>
              <Link
                href="/admin/login"
                className="rounded-xl border border-slate-500/60 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20"
              >
                Cambiar usuario
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-4 p-6 md:grid-cols-3">
          <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Total de clics
            </p>
            <p className="mt-2 text-3xl font-extrabold text-slate-900">
              {stats.totalClicks}
            </p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Último clic
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {stats.lastClickAt
                ? new Date(stats.lastClickAt).toLocaleString("es-CO")
                : "Sin registros"}
            </p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Días con actividad
            </p>
            <p className="mt-2 text-3xl font-extrabold text-slate-900">
              {byDayEntries.length}
            </p>
          </article>
        </div>

        <div className="grid gap-6 p-6 pt-0 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 p-4">
            <h2 className="text-lg font-extrabold text-slate-900">
              Clics por día
            </h2>
            <div className="mt-3 max-h-[420px] overflow-auto">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="py-2">Fecha</th>
                    <th className="py-2">Clics</th>
                  </tr>
                </thead>
                <tbody>
                  {byDayEntries.length === 0 ? (
                    <tr>
                      <td className="py-3 text-slate-500" colSpan={2}>
                        Aún no hay datos.
                      </td>
                    </tr>
                  ) : (
                    byDayEntries.map(([day, count]) => (
                      <tr key={day} className="border-b border-slate-100">
                        <td className="py-2 font-medium text-slate-800">{day}</td>
                        <td className="py-2 font-semibold text-slate-900">
                          {count}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 p-4">
            <h2 className="text-lg font-extrabold text-slate-900">
              Últimos clics
            </h2>
            <div className="mt-3 max-h-[420px] space-y-3 overflow-auto">
              {stats.recentEvents.length === 0 ? (
                <p className="text-sm text-slate-500">Aún no hay eventos.</p>
              ) : (
                stats.recentEvents.map((event) => (
                  <article
                    key={`${event.at}-${event.ip}-${event.referer}`}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700"
                  >
                    <p>
                      <span className="font-semibold text-slate-900">Fecha:</span>{" "}
                      {new Date(event.at).toLocaleString("es-CO")}
                    </p>
                    <p className="truncate">
                      <span className="font-semibold text-slate-900">IP:</span>{" "}
                      {event.ip || "N/D"}
                    </p>
                    <p className="truncate">
                      <span className="font-semibold text-slate-900">Referer:</span>{" "}
                      {event.referer || "N/D"}
                    </p>
                    <p className="mt-1 break-words text-slate-600">
                      {event.text}
                    </p>
                  </article>
                ))
              )}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
