import type { Currency, Lang } from "./types";

export function currencyLabel(currency: Currency) {
  return currency === "VES" ? "Bs" : currency;
}

export function formatMoney(amount: number, currency: Currency, lang: Lang) {
  if (currency === "VES") return formatBolivares(amount);
  const locale = lang === "es" ? "es-419" : "en-US";
  const fraction = currency === "COP" ? 0 : 2;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: fraction,
    maximumFractionDigits: fraction,
  }).format(Number.isFinite(amount) ? amount : 0);
}

export function formatBolivares(amount: number) {
  const formatted = new Intl.NumberFormat("es-VE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);
  return `Bs. ${formatted}`;
}

export function formatRateTime(iso: string, lang: Lang) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(lang === "es" ? "es-VE" : "en-US", {
    timeZone: "America/Caracas",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatPercent(value: number, lang: Lang) {
  return new Intl.NumberFormat(lang === "es" ? "es-419" : "en-US", {
    style: "percent",
    maximumFractionDigits: 1,
  }).format(value);
}

export function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

export function slugify(value: string) {
  const slug = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return slug || "oferta";
}
