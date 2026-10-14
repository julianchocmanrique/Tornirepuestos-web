"use client";
import { usePathname } from "next/navigation";
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  if (path === "/j2rankia" || path.startsWith("/j2rankia/")) return null;
  return <>{children}</>;
}
