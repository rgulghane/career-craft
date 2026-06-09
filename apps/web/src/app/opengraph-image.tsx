import { ImageResponse } from "next/og";
import { messages, PROGRAM } from "@career-craft/shared";

export const alt = messages.app.metaTitle;
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
          justifyContent: "center",
          padding: "72px",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 45%, #431407 100%)",
          color: "#f8fafc",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 28,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#fbbf24",
            marginBottom: 24,
          }}
        >
          12-Week Industry Accelerator
        </div>
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            lineHeight: 1.05,
            maxWidth: 900,
          }}
        >
          {PROGRAM.name}
        </div>
        <div
          style={{
            marginTop: 32,
            fontSize: 32,
            lineHeight: 1.4,
            color: "#cbd5e1",
            maxWidth: 880,
          }}
        >
          {messages.app.metaDescription}
        </div>
      </div>
    ),
    { ...size },
  );
}
