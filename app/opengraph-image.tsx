import { ImageResponse } from "next/og";

export const dynamic = "force-static";
export const alt = "Jérémy Lanfranchi: growth marketer and photographer";
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
          background: "#07080c",
          color: "#f6f4f0",
          padding: "72px 80px",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 22,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: "rgba(246,244,240,0.55)",
          }}
        >
          JL
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: 88,
              lineHeight: 0.9,
              fontWeight: 600,
              letterSpacing: "-0.04em",
              maxWidth: 920,
            }}
          >
            Jérémy Lanfranchi
          </div>
          <div
            style={{
              fontSize: 32,
              lineHeight: 1.35,
              color: "rgba(246,244,240,0.72)",
              maxWidth: 820,
            }}
          >
            Growth marketer, photographer, traveler.
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 22,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#e85d4c",
          }}
        >
          <span>Paris, France</span>
          <span>jeremylanfranchi.com</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
