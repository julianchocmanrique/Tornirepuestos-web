import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tornirepuestos",
  description: "Soluciones en Tornería y Repuestos Industriales",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
