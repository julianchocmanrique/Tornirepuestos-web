"use client";
import { usePathname } from "next/navigation";
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  if (path === "/prueba-baile" || path.startsWith("/prueba-baile/")) return null;
  return <>{children}</>;
}
