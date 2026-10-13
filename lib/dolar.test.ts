import assert from "node:assert/strict";
import test from "node:test";
import { parseDolares, readBoard, toBolivares } from "./dolar.ts";

const sample = [
  {
    moneda: "USD",
    fuente: "oficial",
    nombre: "Dólar",
    compra: null,
    venta: null,
    promedio: 876.7976,
    fechaActualizacion: "2026-10-13T00:00:00-04:00",
  },
  {
    moneda: "USD",
    fuente: "paralelo",
    nombre: "Paralelo",
    compra: null,
    venta: null,
    promedio: 1008.350665,
    fechaActualizacion: "2026-10-13T14:01:31.608Z",
  },
];

test("reads the official and parallel dollar, using promedio when buy and sell are empty", () => {
  const board = parseDolares(sample);
  assert.equal(board?.oficial?.promedio, 876.7976);
  assert.equal(board?.paralelo?.promedio, 1008.350665);
});

test("converts a dollar total into bolívares", () => {
  assert.equal(Math.round((toBolivares(120.64, 876.7976) ?? 0) * 100) / 100, 105776.86);
});

test("ignores a payload without a usable rate", () => {
  assert.equal(parseDolares([{ moneda: "USD", fuente: "oficial", promedio: null }]), null);
  assert.equal(toBolivares(10, 0), null);
  assert.equal(readBoard({ oficial: null, paralelo: { fuente: "paralelo", promedio: 0 } }), null);
});

test("accepts the board the app route returns", () => {
  const board = parseDolares(sample);
  assert.equal(readBoard(board)?.paralelo?.promedio, 1008.350665);
});
