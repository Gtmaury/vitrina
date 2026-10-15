import { ImageResponse } from "next/og";
import { parseDolares, parseEuroOficial } from "@/lib/dolar";
import { formatBolivares } from "@/lib/format";

const WIDTH = 1200;
const HEIGHT = 750;
const SAMPLE_USD = 120.64;

const FRAUNCES =
  "https://fonts.gstatic.com/s/fraunces/v38/6NUh8FyLNQOQZAnv9bYEvDiIdE9Ea92uemAk_WBq8U_9v0c2Wa0K7iN7hzFUPJH58nib1603gg7S2nfgRYIcaRyjDg.ttf";
const DM =
  "https://fonts.gstatic.com/s/dmsans/v17/rP2tp2ywxg089UriI5-g4vlH9VoD8CmcqZG40F9JadbnoEwAfJthTg.ttf";

const FALLBACK = {
  paralelo: 1009.79,
  oficial: 877.9,
  euro: 982.76,
};

async function font(url: string) {
  const response = await fetch(url);
  if (!response.ok) return null;
  return response.arrayBuffer();
}

async function rates() {
  try {
    const [dollars, euros] = await Promise.all([
      fetch("https://ve.dolarapi.com/v1/dolares", { cache: "no-store" }),
      fetch("https://ve.dolarapi.com/v1/euros", { cache: "no-store" }),
    ]);
    const board = dollars.ok ? parseDolares(await dollars.json()) : null;
    const euro = euros.ok ? parseEuroOficial(await euros.json()) : null;
    return {
      paralelo: board?.paralelo?.promedio ?? FALLBACK.paralelo,
      oficial: board?.oficial?.promedio ?? FALLBACK.oficial,
      euro: euro?.promedio ?? FALLBACK.euro,
    };
  } catch {
    return FALLBACK;
  }
}

function Rate({
  label,
  value,
  selected,
}: {
  label: string;
  value: string;
  selected?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        borderRadius: 22,
        border: selected ? "2px solid #9a4328" : "2px solid #e4d7c4",
        background: selected ? "#f8efe6" : "#fffdf9",
        padding: "18px 20px 16px",
      }}
    >
      <div
        style={{
          display: "flex",
          color: "#6b5e52",
          fontSize: 15,
          letterSpacing: 1.4,
          fontFamily: "DM Sans",
        }}
      >
        {label}
      </div>
      <div
        style={{
          display: "flex",
          marginTop: 10,
          fontSize: 40,
          lineHeight: 1,
          fontFamily: "Fraunces",
          color: "#1c1915",
        }}
      >
        {value}
      </div>
    </div>
  );
}

export async function GET() {
  const [quote, display, sans] = await Promise.all([rates(), font(FRAUNCES), font(DM)]);
  const total = formatBolivares(SAMPLE_USD * quote.paralelo);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#f3ecdf",
          padding: 28,
          fontFamily: "DM Sans",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            background: "#fbf7f0",
            border: "1px solid #e4d7c4",
            borderRadius: 28,
            padding: "28px 32px 26px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  display: "flex",
                  color: "#9a4328",
                  fontSize: 16,
                  letterSpacing: 2.2,
                }}
              >
                HERRAMIENTA PARA EL MOSTRADOR
              </div>
              <div
                style={{
                  display: "flex",
                  marginTop: 6,
                  fontFamily: "Fraunces",
                  fontSize: 64,
                  lineHeight: 0.9,
                  color: "#1c1915",
                }}
              >
                Vitrina
              </div>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                height: 36,
                padding: "0 14px",
                borderRadius: 999,
                background: "#efe6d6",
                color: "#5c5348",
                fontSize: 16,
              }}
            >
              Dólar y euro en Bs
            </div>
          </div>

          <div style={{ display: "flex", gap: 14, marginTop: 20 }}>
            <Rate label="DÓLAR PARALELO" value={formatBolivares(quote.paralelo)} selected />
            <Rate label="DÓLAR OFICIAL BCV" value={formatBolivares(quote.oficial)} />
            <Rate label="EURO OFICIAL BCV" value={formatBolivares(quote.euro)} />
          </div>

          <div style={{ display: "flex", gap: 14, marginTop: 16, flex: 1 }}>
            <div
              style={{
                display: "flex",
                flex: 1.15,
                flexDirection: "column",
                justifyContent: "space-between",
                borderRadius: 22,
                border: "2px solid #e4d7c4",
                background: "#fffdf9",
                padding: "18px 22px 16px",
              }}
            >
              <div style={{ display: "flex", color: "#6b5e52", fontSize: 15, letterSpacing: 1.4 }}>
                OFERTA · BARQUISIMETO
              </div>
              {[
                ["Espresso para dos", "$48,00"],
                ["Taller de filtro", "$36,00"],
                ["Pastel de cacao", "$36,64"],
              ].map(([name, price]) => (
                <div key={name} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <div style={{ display: "flex", fontSize: 24, color: "#1c1915" }}>{name}</div>
                  <div style={{ display: "flex", fontFamily: "Fraunces", fontSize: 24, color: "#1c1915" }}>{price}</div>
                </div>
              ))}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  borderTop: "1px solid #eadfce",
                  paddingTop: 10,
                }}
              >
                <div style={{ display: "flex", color: "#6b5e52", fontSize: 16 }}>Total al cliente</div>
                <div style={{ display: "flex", fontFamily: "Fraunces", fontSize: 22 }}>$120,64</div>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                flex: 0.85,
                flexDirection: "column",
                justifyContent: "center",
                borderRadius: 22,
                background: "#9a4328",
                padding: "22px 24px",
              }}
            >
              <div style={{ display: "flex", color: "#f6e3d8", fontSize: 15, letterSpacing: 1.4 }}>
                TOTAL EN BOLÍVARES
              </div>
              <div
                style={{
                  display: "flex",
                  marginTop: 14,
                  fontFamily: "Fraunces",
                  fontSize: 46,
                  color: "#fffaf6",
                  lineHeight: 1,
                }}
              >
                {total}
              </div>
              <div style={{ display: "flex", marginTop: 12, color: "#f6e3d8", fontSize: 18 }}>
                Con el dólar paralelo
              </div>
              <div style={{ display: "flex", marginTop: 6, color: "#f3cbbd", fontSize: 16 }}>
                El margen no sale en el mensaje
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: WIDTH,
      height: HEIGHT,
      fonts: [
        ...(display ? [{ name: "Fraunces", data: display, weight: 600 as const }] : []),
        ...(sans ? [{ name: "DM Sans", data: sans, weight: 600 as const }] : []),
      ],
      headers: { "Cache-Control": "public, max-age=300" },
    },
  );
}
