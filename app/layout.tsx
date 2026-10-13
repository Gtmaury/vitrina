import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vitrina",
  description: "Cotiza una oferta local y publica el mensaje.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full bg-background text-foreground">{children}</body>
    </html>
  );
}
