import type { Metadata } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import { VitrinaLoader } from "@/components/vitrina-loader";

const sans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm",
});

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
});

export const metadata: Metadata = {
  title: "Vitrina — cotiza y publica la oferta",
  description:
    "Arma el precio de una oferta local, guarda el margen en el mostrador y sal con el mensaje de WhatsApp y la tarjeta para Instagram, Threads y LinkedIn.",
  openGraph: {
    title: "Vitrina — cotiza y publica la oferta",
    description:
      "Precio, margen y mensaje listos para el mostrador. Hecho por Mauricio González.",
    locale: "es_VE",
  },
};

export default function Home() {
  return (
    <div className={`${sans.variable} ${display.variable}`}>
      <VitrinaLoader />
    </div>
  );
}
