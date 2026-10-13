import { digitsOnly, formatMoney, formatPercent } from "./format";
import type { Channel, Lang, Offer } from "./types";
import { quoteOffer } from "./quote";

export type BolivarNote = {
  amount: string;
  rateLabel: string;
  rate: string;
};

const LIMITS: Record<Channel, number> = {
  whatsapp: 1200,
  instagram: 2200,
  threads: 500,
  linkedin: 3000,
};

export function channelLimit(channel: Channel) {
  return LIMITS[channel];
}

function cityPart(city: string, lang: Lang) {
  if (!city.trim()) return "";
  return lang === "es" ? ` en ${city.trim()}` : ` in ${city.trim()}`;
}

function lineRows(offer: Offer, lang: Lang) {
  const quote = quoteOffer(offer);
  return offer.lines
    .map((line, index) => {
      const row = quote.lines[index];
      const name = line.name.trim();
      if (!name || !row || row.entered <= 0) return "";
      const amount = formatMoney(row.entered, offer.currency, lang);
      const qty = row.qty === 1 ? "" : `${trimQty(row.qty)} × `;
      return `${qty}${name} — ${amount}`;
    })
    .filter(Boolean);
}

function trimQty(qty: number) {
  return Number.isInteger(qty) ? String(qty) : String(Math.round(qty * 100) / 100);
}

function moneyLines(offer: Offer, lang: Lang) {
  const quote = quoteOffer(offer);
  const rows: string[] = [];
  if (quote.discount > 0) {
    rows.push(
      lang === "es"
        ? `Descuento ${formatPercent(offer.discountPercent / 100, lang)}: −${formatMoney(quote.discount, offer.currency, lang)}`
        : `Discount ${formatPercent(offer.discountPercent / 100, lang)}: −${formatMoney(quote.discount, offer.currency, lang)}`,
    );
  }
  if (quote.tax > 0) {
    const label = offer.taxIncluded
      ? lang === "es"
        ? `IVA incluido (${offer.taxPercent}%)`
        : `VAT included (${offer.taxPercent}%)`
      : lang === "es"
        ? `IVA ${offer.taxPercent}%`
        : `VAT ${offer.taxPercent}%`;
    rows.push(`${label}: ${formatMoney(quote.tax, offer.currency, lang)}`);
  }
  rows.push(
    `${lang === "es" ? "Total" : "Total"}: ${formatMoney(quote.total, offer.currency, lang)}`,
  );
  return rows;
}

function bolivarLine(note: BolivarNote | null | undefined, lang: Lang) {
  if (!note) return "";
  return lang === "es"
    ? `En bolívares: ${note.amount} (${note.rateLabel}, ${note.rate} por dólar)`
    : `In bolívares: ${note.amount} (${note.rateLabel}, ${note.rate} per dollar)`;
}

export function messageFor(offer: Offer, channel: Channel, lang: Lang, bolivar?: BolivarNote | null) {
  const quote = quoteOffer(offer);
  const business = offer.business.trim();
  const title = offer.title.trim() || (lang === "es" ? "Oferta" : "Offer");
  const items = lineRows(offer, lang);
  const totals = moneyLines(offer, lang);
  const note = offer.note.trim();
  const days = Math.max(1, Math.round(offer.validDays || 1));
  const total = formatMoney(quote.total, offer.currency, lang);
  const inBolivares = bolivarLine(bolivar, lang);
  const who = business || (lang === "es" ? "el negocio" : "the shop");

  if (channel === "whatsapp") {
    const hello = business
      ? lang === "es"
        ? `Hola, te escribe ${business}${cityPart(offer.city, lang)}.`
        : `Hi, this is ${business}${cityPart(offer.city, lang)}.`
      : lang === "es"
        ? "Hola."
        : "Hi.";
    return [
      hello,
      "",
      title,
      "",
      ...items,
      "",
      ...totals,
      inBolivares,
      "",
      lang === "es" ? `Oferta válida por ${days} días.` : `Offer valid for ${days} days.`,
      note,
      "",
      lang === "es" ? "Responde a este mensaje y la apartamos." : "Reply to this message and we will hold it.",
    ]
      .filter((line, index, all) => line !== "" || all[index - 1] !== "")
      .join("\n")
      .trim();
  }

  if (channel === "instagram") {
    return [
      title,
      "",
      items.slice(0, 4).join("\n"),
      "",
      total,
      inBolivares,
      note,
      "",
      lang === "es"
        ? `Escríbenos por WhatsApp y lo dejamos listo.`
        : `Message us on WhatsApp and we will set it aside.`,
      [business, offer.city.trim()].filter(Boolean).join(" · "),
    ]
      .filter((line) => line !== undefined)
      .join("\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  if (channel === "threads") {
    const shortItems = items.slice(0, 2).join(" · ");
    return [
      `${title} — ${total}`,
      inBolivares,
      shortItems,
      lang === "es" ? `${who}. Escríbenos por WhatsApp.` : `${who}. Message us on WhatsApp.`,
    ]
      .filter(Boolean)
      .join("\n");
  }

  return [
    lang === "es" ? `${who} publica esta oferta:` : `${who} is posting this offer:`,
    "",
    title,
    items.slice(0, 4).map((item) => `· ${item}`).join("\n"),
    totals.join("\n"),
    inBolivares,
    note,
    "",
    offer.city.trim()
      ? lang === "es"
        ? `Si estás en ${offer.city.trim()}, escríbenos por WhatsApp.`
        : `If you are in ${offer.city.trim()}, message us on WhatsApp.`
      : lang === "es"
        ? "Escríbenos por WhatsApp para apartarla."
        : "Message us on WhatsApp to reserve it.",
  ]
    .filter((line) => line !== undefined)
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function whatsappHref(offer: Offer, lang: Lang, bolivar?: BolivarNote | null) {
  const phone = digitsOnly(offer.whatsapp);
  if (!phone) return null;
  const text = messageFor(offer, "whatsapp", lang, bolivar);
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}
