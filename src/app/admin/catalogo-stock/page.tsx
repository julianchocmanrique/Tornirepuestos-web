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
    <main className="mx-auto w-full max-w-3xl px-4 py-12">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Actualizar stock por Excel</h1>
            <p className="mt-1 text-sm text-slate-600">
              Carga un Excel con columnas de codigo y stock. Por defecto no modifica productos destacados.
            </p>
          </div>
          <Link href="/admin/login" className="text-sm font-semibold text-slate-600 hover:text-slate-900">
            Cambiar usuario
          </Link>
        </div>

        <StockUploadForm />
      </div>
    </main>
  );
}
