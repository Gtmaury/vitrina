import { parseDolares } from "@/lib/dolar";

const SOURCE = "https://ve.dolarapi.com/v1/dolares";

export async function GET() {
  try {
    const response = await fetch(SOURCE, { cache: "no-store" });
    if (!response.ok) {
      return Response.json({ error: "unavailable" }, { status: 502 });
    }
    const board = parseDolares(await response.json());
    if (!board) {
      return Response.json({ error: "unavailable" }, { status: 502 });
    }
    return Response.json(board, {
      headers: { "Cache-Control": "public, max-age=300" },
    });
  } catch {
    return Response.json({ error: "unavailable" }, { status: 502 });
  }
}
