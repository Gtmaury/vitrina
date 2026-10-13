import type { Offer, Quote } from "./types";

function rateOf(offer: Pick<Offer, "taxPercent">) {
  const percent = Number.isFinite(offer.taxPercent) ? offer.taxPercent : 0;
  return Math.min(Math.max(percent, 0), 100) / 100;
}

function discountOf(offer: Pick<Offer, "discountPercent">) {
  const percent = Number.isFinite(offer.discountPercent) ? offer.discountPercent : 0;
  return Math.min(Math.max(percent, 0), 100) / 100;
}

export function quoteOffer(offer: Offer): Quote {
  const rate = rateOf(offer);
  const discountRate = discountOf(offer);

  const lines = offer.lines.map((line) => {
    const qty = Number.isFinite(line.qty) ? Math.max(line.qty, 0) : 0;
    const unitPrice = Number.isFinite(line.unitPrice) ? Math.max(line.unitPrice, 0) : 0;
    const unitCost = Number.isFinite(line.unitCost) ? Math.max(line.unitCost, 0) : 0;
    const entered = qty * unitPrice;
    const netUnit = offer.taxIncluded && rate > 0 ? unitPrice / (1 + rate) : unitPrice;
    return {
      id: line.id,
      name: line.name,
      qty,
      entered,
      cost: qty * unitCost,
      belowCost: unitCost > 0 && netUnit < unitCost,
    };
  });

  const entered = lines.reduce((sum, line) => sum + line.entered, 0);
  const discount = entered * discountRate;
  const afterDiscount = entered - discount;
  const cost = lines.reduce((sum, line) => sum + line.cost, 0);

  let base = afterDiscount;
  let tax = 0;
  let total = afterDiscount;

  if (offer.taxIncluded) {
    total = afterDiscount;
    base = rate > 0 ? total / (1 + rate) : total;
    tax = total - base;
  } else {
    base = afterDiscount;
    tax = base * rate;
    total = base + tax;
  }

  const margin = base - cost;
  const marginPct = base > 0 ? margin / base : null;

  return {
    lines,
    entered,
    discount,
    base,
    tax,
    total,
    cost,
    margin,
    marginPct,
    belowCost: lines.some((line) => line.belowCost),
  };
}
