import assert from "node:assert/strict";
import test from "node:test";
import { presetElectronics, presetPaint } from "./presets.ts";
import { quoteOffer } from "./quote.ts";

test("tax is added on top when prices are net", () => {
  const offer = presetPaint("es");
  const quote = quoteOffer(offer);
  assert.equal(quote.entered, 134);
  assert.equal(quote.base, 134);
  assert.equal(Math.round(quote.tax * 100) / 100, 21.44);
  assert.equal(Math.round(quote.total * 100) / 100, 155.44);
  assert.equal(quote.cost, 61);
  assert.equal(Math.round(quote.margin * 100) / 100, 73);
});

test("tax-included prices are split back out of the total", () => {
  const offer = presetElectronics("es");
  const quote = quoteOffer(offer);
  assert.equal(quote.total, 464);
  assert.equal(Math.round(quote.base * 100) / 100, 400);
  assert.equal(Math.round(quote.tax * 100) / 100, 64);
  assert.equal(quote.cost, 295);
});

test("a percent discount applies before tax", () => {
  const offer = presetPaint("en");
  offer.discountPercent = 10;
  const quote = quoteOffer(offer);
  assert.equal(quote.discount, 13.4);
  assert.equal(Math.round(quote.base * 100) / 100, 120.6);
  assert.equal(Math.round(quote.tax * 100) / 100, 19.3);
});

test("margin ignores tax and flags a line sold under cost", () => {
  const offer = presetPaint("es");
  offer.lines[0].unitPrice = 10;
  offer.lines[1].unitPrice = 10;
  const quote = quoteOffer(offer);
  assert.equal(quote.belowCost, true);
  assert.equal(quote.base, 30);
  assert.ok(quote.margin < 0);
});
