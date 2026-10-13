import type { Lang, Offer } from "./types";

function line(id: string, name: string, qty: number, unitCost: number, unitPrice: number) {
  return { id, name, qty, unitCost, unitPrice };
}

export function presetCafe(lang: Lang): Offer {
  const es = lang === "es";
  return {
    business: es ? "Taller Norte" : "North Workshop",
    city: es ? "Barquisimeto" : "Barquisimeto",
    whatsapp: "584121112233",
    currency: "USD",
    taxPreset: "ve",
    taxPercent: 16,
    taxIncluded: false,
    discountPercent: 0,
    title: es ? "Taller de espresso para dos" : "Espresso workshop for two",
    note: es
      ? "Incluye 200 g de café y el puesto en la barra. Cupo de 8 personas."
      : "Includes 200 g of coffee and a seat at the bar. Eight seats.",
    validDays: 14,
    cardStyle: "paper",
    lines: [
      line("cafe-1", es ? "Taller de espresso" : "Espresso workshop", 2, 18, 45),
      line("cafe-2", es ? "Bolsa de café 250 g" : "250 g coffee bag", 1, 6, 14),
    ],
  };
}

export function presetBeauty(lang: Lang): Offer {
  const es = lang === "es";
  return {
    business: es ? "Sala Luma" : "Luma Room",
    city: "Valencia",
    whatsapp: "584241110000",
    currency: "USD",
    taxPreset: "none",
    taxPercent: 0,
    taxIncluded: false,
    discountPercent: 10,
    title: es ? "Ritual de piel, marzo" : "Skin ritual, March",
    note: es
      ? "Reserva por WhatsApp. El descuento aplica si confirmas esta semana."
      : "Book on WhatsApp. The discount applies if you confirm this week.",
    validDays: 7,
    cardStyle: "paper",
    lines: [
      line("beauty-1", es ? "Limpieza facial" : "Facial cleansing", 1, 12, 35),
      line("beauty-2", es ? "Hidratación" : "Hydration treatment", 1, 8, 22),
    ],
  };
}

export function presetPaint(lang: Lang): Offer {
  const es = lang === "es";
  return {
    business: "Casa Pigmento",
    city: "Maracaibo",
    whatsapp: "584261234567",
    currency: "USD",
    taxPreset: "ve",
    taxPercent: 16,
    taxIncluded: false,
    discountPercent: 0,
    title: es ? "Pintura de una habitación" : "One-room paint job",
    note: es
      ? "Precio para una habitación de hasta 12 m², paredes lisas, dos manos."
      : "Price for one room up to 12 m², smooth walls, two coats.",
    validDays: 10,
    cardStyle: "ink",
    lines: [
      line("paint-1", es ? "Pintura mate 4 L" : "Matte paint 4 L", 2, 18, 32),
      line("paint-2", es ? "Mano de obra" : "Labor", 1, 25, 70),
    ],
  };
}

export function presetClinic(lang: Lang): Offer {
  const es = lang === "es";
  return {
    business: es ? "Consulta Alba" : "Alba Practice",
    city: "Caracas",
    whatsapp: "584141234567",
    currency: "USD",
    taxPreset: "none",
    taxPercent: 0,
    taxIncluded: false,
    discountPercent: 0,
    title: es ? "Limpieza y control" : "Cleaning and checkup",
    note: es
      ? "Turno de 40 minutos. Escribe el día que te queda bien."
      : "A 40-minute visit. Send the day that works for you.",
    validDays: 30,
    cardStyle: "clinic",
    lines: [line("clinic-1", es ? "Limpieza y control" : "Cleaning and checkup", 1, 15, 40)],
  };
}

export function presetElectronics(lang: Lang): Offer {
  const es = lang === "es";
  return {
    business: es ? "Mostrador Sur" : "South Counter",
    city: "San Cristóbal",
    whatsapp: "584247778899",
    currency: "USD",
    taxPreset: "ve",
    taxPercent: 16,
    taxIncluded: true,
    title: es ? "Televisor 50\" con instalación" : "50\" TV with installation",
    note: es
      ? "Instalación en la ciudad, de lunes a sábado. El precio ya incluye IVA."
      : "City installation, Monday to Saturday. The price already includes VAT.",
    validDays: 5,
    discountPercent: 0,
    cardStyle: "ink",
    lines: [
      line("tv-1", es ? "Televisor 50\"" : "50\" television", 1, 280, 429),
      line("tv-2", es ? "Instalación en pared" : "Wall installation", 1, 15, 35),
    ],
  };
}

export const PRESET_BUILDERS = [
  { id: "cafe", build: presetCafe },
  { id: "beauty", build: presetBeauty },
  { id: "paint", build: presetPaint },
  { id: "clinic", build: presetClinic },
  { id: "electronics", build: presetElectronics },
] as const;
