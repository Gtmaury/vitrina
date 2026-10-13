import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#f3ecdf",
          color: "#1c1915",
          padding: "72px",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 28, letterSpacing: 6, color: "#9a4328" }}>
          HERRAMIENTA PARA EL MOSTRADOR
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 120, fontWeight: 650, lineHeight: 0.9 }}>Vitrina</div>
          <div style={{ marginTop: 24, fontSize: 36, maxWidth: 860 }}>
            Cotiza la oferta. El margen se queda. El mensaje sale listo.
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 28 }}>Mauricio González</div>
      </div>
    ),
    size,
  );
}
