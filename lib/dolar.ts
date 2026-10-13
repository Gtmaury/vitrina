export type DolarFuente = "oficial" | "paralelo";

export type DolarQuote = {
  fuente: DolarFuente;
  promedio: number;
  fechaActualizacion: string;
};

export type DolarBoard = {
  oficial: DolarQuote | null;
  paralelo: DolarQuote | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readQuote(payload: unknown[], fuente: DolarFuente): DolarQuote | null {
  const row = payload.find(
    (item) => isRecord(item) && item.moneda === "USD" && item.fuente === fuente,
  );
  if (!isRecord(row) || typeof row.promedio !== "number" || row.promedio <= 0) return null;
  return {
    fuente,
    promedio: row.promedio,
    fechaActualizacion: typeof row.fechaActualizacion === "string" ? row.fechaActualizacion : "",
  };
}

export function parseDolares(payload: unknown): DolarBoard | null {
  if (!Array.isArray(payload)) return null;
  const board = {
    oficial: readQuote(payload, "oficial"),
    paralelo: readQuote(payload, "paralelo"),
  };
  if (!board.oficial && !board.paralelo) return null;
  return board;
}

function readStored(value: unknown, fuente: DolarFuente): DolarQuote | null {
  if (!isRecord(value) || value.fuente !== fuente) return null;
  if (typeof value.promedio !== "number" || value.promedio <= 0) return null;
  return {
    fuente,
    promedio: value.promedio,
    fechaActualizacion: typeof value.fechaActualizacion === "string" ? value.fechaActualizacion : "",
  };
}

export function readBoard(payload: unknown): DolarBoard | null {
  if (!isRecord(payload)) return null;
  const board = {
    oficial: readStored(payload.oficial, "oficial"),
    paralelo: readStored(payload.paralelo, "paralelo"),
  };
  if (!board.oficial && !board.paralelo) return null;
  return board;
}

export function toBolivares(usd: number, rate: number) {
  if (!Number.isFinite(usd) || !Number.isFinite(rate) || rate <= 0) return null;
  return usd * rate;
}
