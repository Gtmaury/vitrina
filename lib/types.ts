export type Lang = "es" | "en";

export type Currency = "USD" | "VES" | "COP" | "MXN" | "ARS" | "EUR";

export type CardStyle = "paper" | "ink" | "clinic";

export type Channel = "whatsapp" | "instagram" | "threads" | "linkedin";

export type LineItem = {
  id: string;
  name: string;
  qty: number;
  unitCost: number;
  unitPrice: number;
};

export type Offer = {
  business: string;
  city: string;
  whatsapp: string;
  currency: Currency;
  taxPreset: string;
  taxPercent: number;
  taxIncluded: boolean;
  discountPercent: number;
  title: string;
  note: string;
  validDays: number;
  lines: LineItem[];
  cardStyle: CardStyle;
};

export type QuoteLine = {
  id: string;
  name: string;
  qty: number;
  entered: number;
  cost: number;
  belowCost: boolean;
};

export type Quote = {
  lines: QuoteLine[];
  entered: number;
  discount: number;
  base: number;
  tax: number;
  total: number;
  cost: number;
  margin: number;
  marginPct: number | null;
  belowCost: boolean;
};
