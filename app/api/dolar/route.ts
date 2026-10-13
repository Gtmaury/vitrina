import { parseDolares, parseEuroOficial } from "@/lib/dolar";

const DOLLARS = "https://ve.dolarapi.com/v1/dolares";
const EUROS = "https://ve.dolarapi.com/v1/euros";

export async function GET() {
  try {
    const [dollarResponse, euroResponse] = await Promise.all([
      fetch(DOLLARS, { cache: "no-store" }),
      fetch(EUROS, { cache: "no-store" }),
    ]);
    const dollars = dollarResponse.ok ? parseDolares(await dollarResponse.json()) : null;
    const euroOficial = euroResponse.ok ? parseEuroOficial(await euroResponse.json()) : null;
    const board = {
      oficial: dollars?.oficial ?? null,
      paralelo: dollars?.paralelo ?? null,
      euroOficial,
    };
    if (!board.oficial && !board.paralelo && !board.euroOficial) {
      return Response.json({ error: "unavailable" }, { status: 502 });
    }
    return Response.json(board, {
      headers: { "Cache-Control": "public, max-age=300" },
    });
  } catch {
    return Response.json({ error: "unavailable" }, { status: 502 });
  }
}
