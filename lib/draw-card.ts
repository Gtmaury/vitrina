import { formatMoney } from "./format";
import type { Lang, Offer } from "./types";
import { quoteOffer } from "./quote";

export type CardFonts = {
  display: string;
  sans: string;
};

const PALETTES = {
  paper: { bg: "#f4ecdf", ink: "#1c1915", muted: "#6b5e51", accent: "#9a4328", rule: "#ddcfbb" },
  ink: { bg: "#1c1915", ink: "#f4ecdf", muted: "#cbbba6", accent: "#e7a07a", rule: "#3a332c" },
  clinic: { bg: "#f7f5f2", ink: "#1e3a34", muted: "#5d726c", accent: "#1e3a34", rule: "#d5ddd9" },
} as const;

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (ctx.measureText(next).width <= maxWidth) {
      current = next;
      continue;
    }
    if (current) lines.push(current);
    current = word;
    if (lines.length === maxLines) break;
  }
  if (current && lines.length < maxLines) lines.push(current);
  if (lines.length === maxLines && words.length > 0) {
    const consumed = lines.join(" ").split(/\s+/).length;
    if (consumed < words.length) {
      let last = lines[maxLines - 1];
      while (last.length > 0 && ctx.measureText(`${last}…`).width > maxWidth) last = last.slice(0, -1);
      lines[maxLines - 1] = `${last.replace(/[\s,.-]+$/, "")}…`;
    }
  }
  return lines.length ? lines : [""];
}

export function drawCard(
  canvas: HTMLCanvasElement,
  offer: Offer,
  lang: Lang,
  fonts: CardFonts,
  bolivarLine?: string | null,
) {
  const size = 1080;
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = size * ratio;
  canvas.height = size * ratio;
  canvas.style.width = "100%";
  canvas.style.height = "auto";
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

  const palette = PALETTES[offer.cardStyle];
  const quote = quoteOffer(offer);
  const pad = 84;

  ctx.fillStyle = palette.bg;
  ctx.fillRect(0, 0, size, size);

  ctx.strokeStyle = palette.accent;
  ctx.lineWidth = 8;
  ctx.strokeRect(36, 36, size - 72, size - 72);

  const business = offer.business.trim() || (lang === "es" ? "Tu negocio" : "Your shop");
  const city = offer.city.trim();
  ctx.fillStyle = palette.accent;
  ctx.font = `600 28px ${fonts.sans}`;
  ctx.textBaseline = "top";
  const eyebrow = [business, city].filter(Boolean).join("  ·  ").toUpperCase();
  ctx.fillText(eyebrow.slice(0, 48), pad, 92);

  ctx.strokeStyle = palette.rule;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(pad, 146);
  ctx.lineTo(size - pad, 146);
  ctx.stroke();

  const title = offer.title.trim() || (lang === "es" ? "Oferta de la semana" : "This week's offer");
  ctx.fillStyle = palette.ink;
  ctx.font = `650 72px ${fonts.display}`;
  const titleLines = wrap(ctx, title, size - pad * 2, 3);
  titleLines.forEach((line, index) => {
    ctx.fillText(line, pad, 180 + index * 82);
  });

  let y = 180 + titleLines.length * 82 + 28;
  ctx.font = `500 32px ${fonts.sans}`;
  const visible = offer.lines
    .map((line, index) => ({ line, row: quote.lines[index] }))
    .filter((item) => item.line.name.trim() && item.row && item.row.entered > 0)
    .slice(0, 4);

  visible.forEach(({ line, row }) => {
    const amount = formatMoney(row.entered, offer.currency, lang);
    ctx.fillStyle = palette.ink;
    ctx.textAlign = "left";
    const qty = row.qty === 1 ? "" : `${row.qty} × `;
    const label = `${qty}${line.name.trim()}`;
    ctx.fillText(label.slice(0, 36), pad, y);
    ctx.textAlign = "right";
    ctx.fillText(amount, size - pad, y);
    ctx.textAlign = "left";
    y += 52;
  });

  const hidden = offer.lines.filter((line, index) => {
    const row = quote.lines[index];
    return line.name.trim() && row && row.entered > 0;
  }).length - visible.length;
  if (hidden > 0) {
    ctx.fillStyle = palette.muted;
    ctx.font = `500 28px ${fonts.sans}`;
    ctx.fillText(lang === "es" ? `+ ${hidden} más` : `+ ${hidden} more`, pad, y);
    y += 48;
  }

  const totalTop = Math.max(y + 24, 760);
  ctx.strokeStyle = palette.rule;
  ctx.beginPath();
  ctx.moveTo(pad, totalTop);
  ctx.lineTo(size - pad, totalTop);
  ctx.stroke();

  ctx.fillStyle = palette.muted;
  ctx.font = `600 26px ${fonts.sans}`;
  ctx.textAlign = "left";
  const totalLabel = offer.taxIncluded
    ? lang === "es"
      ? "TOTAL · IVA INCLUIDO"
      : "TOTAL · VAT INCLUDED"
    : "TOTAL";
  ctx.fillText(totalLabel, pad, totalTop + 28);

  ctx.fillStyle = palette.ink;
  ctx.font = `650 92px ${fonts.display}`;
  ctx.fillText(formatMoney(quote.total, offer.currency, lang), pad, totalTop + 68);
  if (bolivarLine) {
    ctx.fillStyle = palette.accent;
    ctx.font = `600 28px ${fonts.sans}`;
    ctx.fillText(bolivarLine, pad, totalTop + 172);
  }

  const days = Math.max(1, Math.round(offer.validDays || 1));
  ctx.fillStyle = palette.muted;
  ctx.font = `500 26px ${fonts.sans}`;
  const footer = lang === "es" ? `Válida por ${days} días` : `Valid for ${days} days`;
  ctx.fillText(footer, pad, 980);

  ctx.fillStyle = palette.accent;
  ctx.textAlign = "right";
  ctx.font = `600 24px ${fonts.sans}`;
  ctx.fillText("VITRINA", size - pad, 980);
  ctx.textAlign = "left";
}
