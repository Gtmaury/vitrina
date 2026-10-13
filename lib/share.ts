import { presetCafe } from "./presets";
import type { CardStyle, Currency, Lang, Offer } from "./types";

const CURRENCIES: Currency[] = ["USD", "VES", "COP", "MXN", "ARS", "EUR"];
const STYLES: CardStyle[] = ["paper", "ink", "clinic"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function newLineId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `line-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function emptyOffer(lang: Lang): Offer {
  const base = presetCafe(lang);
  return {
    ...base,
    business: "",
    city: "",
    whatsapp: "",
    title: "",
    note: "",
    lines: [{ id: newLineId(), name: "", qty: 1, unitCost: 0, unitPrice: 0 }],
  };
}

function num(value: unknown, fallback = 0) {
  const n = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
  return Number.isFinite(n) ? n : fallback;
}

export function sanitizeOffer(value: unknown, lang: Lang): Offer | null {
  if (!isRecord(value) || !Array.isArray(value.lines)) return null;
  const currency = CURRENCIES.includes(value.currency as Currency)
    ? (value.currency as Currency)
    : "USD";
  const cardStyle = STYLES.includes(value.cardStyle as CardStyle)
    ? (value.cardStyle as CardStyle)
    : "paper";
  const lines = value.lines.slice(0, 12).map((line) => {
    if (!isRecord(line)) return null;
    return {
      id: typeof line.id === "string" && line.id ? line.id : newLineId(),
      name: typeof line.name === "string" ? line.name.slice(0, 80) : "",
      qty: Math.min(Math.max(num(line.qty, 1), 0), 9999),
      unitCost: Math.min(Math.max(num(line.unitCost), 0), 1_000_000_000),
      unitPrice: Math.min(Math.max(num(line.unitPrice), 0), 1_000_000_000),
    };
  });
  const cleanLines = lines.filter((line) => line !== null);
  if (cleanLines.length === 0) return null;
  return {
    business: typeof value.business === "string" ? value.business.slice(0, 80) : "",
    city: typeof value.city === "string" ? value.city.slice(0, 60) : "",
    whatsapp: typeof value.whatsapp === "string" ? value.whatsapp.replace(/[^\d+]/g, "").slice(0, 20) : "",
    currency,
    taxPreset: typeof value.taxPreset === "string" ? value.taxPreset.slice(0, 20) : "custom",
    taxPercent: Math.min(Math.max(num(value.taxPercent), 0), 100),
    taxIncluded: Boolean(value.taxIncluded),
    discountPercent: Math.min(Math.max(num(value.discountPercent), 0), 100),
    title: typeof value.title === "string" ? value.title.slice(0, 120) : "",
    note: typeof value.note === "string" ? value.note.slice(0, 280) : "",
    validDays: Math.min(Math.max(Math.round(num(value.validDays, 7)), 1), 365),
    lines: cleanLines,
    cardStyle,
  };
  void lang;
}

export function encodeOffer(offer: Offer) {
  const bytes = new TextEncoder().encode(JSON.stringify(offer));
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export function decodeOffer(encoded: string, lang: Lang): Offer | null {
  try {
    const padded = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
    const binary = atob(padded + pad);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    const json = JSON.parse(new TextDecoder().decode(bytes)) as unknown;
    return sanitizeOffer(json, lang);
  } catch {
    return null;
  }
}
