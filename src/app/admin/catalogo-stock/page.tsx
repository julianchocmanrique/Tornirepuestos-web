import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getCookieName, verifySessionToken } from "@/lib/adminAuth";
import { StockUploadForm } from "./stock-upload-form";

export default async function AdminCatalogoStockPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getCookieName())?.value;

  if (!verifySessionToken(token)) {
    redirect("/admin/login");
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10">
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-6 py-6 text-white">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">Panel administrativo</p>
              <h1 className="mt-2 text-3xl font-extrabold">Actualizar stock por Excel</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-200">
                Carga un archivo de inventario para sincronizar stock del catálogo de forma automática.
              </p>
            </div>
            <Link
              href="/admin/login"
              className="rounded-xl border border-slate-500/60 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20"
            >
              Cambiar usuario
            </Link>
          </div>
        </div>

        <div className="grid gap-6 p-6 lg:grid-cols-[1.2fr_0.8fr]">
          <StockUploadForm />

          <aside className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <h2 className="text-sm font-extrabold uppercase tracking-wide text-slate-700">Recomendaciones</h2>
            <ul className="mt-3 space-y-3 text-sm text-slate-600">
              <li>Usa archivo `.xlsx` o `.xls` exportado del sistema de inventario.</li>
              <li>Encabezados válidos: `Codigo Producto` y `Existencias`.</li>
              <li>Si el archivo no cambia stock, se mostrará éxito sin cambios.</li>
            </ul>
          </aside>
        </div>
      </section>
    </main>
  );
}
