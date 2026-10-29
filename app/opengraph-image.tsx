import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "promptHelper — AI Prompt Architect & Token Optimizer";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #05060f 0%, #0f172a 50%, #1e1b4b 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
          padding: "60px 80px",
          fontFamily: "system-ui, -apple-system, sans-serif",
          color: "white",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "14px",
              background: "linear-gradient(135deg, #8b5cf6, #3b82f6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
            }}
          >
            ✨
          </div>
          <span style={{ fontSize: "28px", fontWeight: "bold", letterSpacing: "-0.5px" }}>
            promptHelper
          </span>
          <span
            style={{
              fontSize: "14px",
              background: "rgba(16, 185, 129, 0.2)",
              color: "#34d399",
              padding: "4px 12px",
              borderRadius: "999px",
              border: "1px solid rgba(16, 185, 129, 0.4)",
              fontWeight: 600,
            }}
          >
            Gemini 3.7 Flash API
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <h1
            style={{
              fontSize: "56px",
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: "-1.5px",
              margin: 0,
              background: "linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            Architect prompts under real constraints.
          </h1>
          <p
            style={{
              fontSize: "22px",
              color: "#94a3b8",
              margin: 0,
              maxWidth: "850px",
              lineHeight: 1.4,
            }}
          >
            Zero fluff, model-tailored schemas for Claude, ChatGPT, Gemini, and DeepSeek. Built with Next.js 14 and Gemini 3.7 Flash.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <div
            style={{
              fontSize: "14px",
              color: "#e2e8f0",
              background: "rgba(255, 255, 255, 0.08)",
              padding: "10px 18px",
              borderRadius: "12px",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              fontWeight: 600,
            }}
          >
            10+ AI Models
          </div>
          <div
            style={{
              fontSize: "14px",
              color: "#e2e8f0",
              background: "rgba(255, 255, 255, 0.08)",
              padding: "10px 18px",
              borderRadius: "12px",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              fontWeight: 600,
            }}
          >
            12 Domain Schemas
          </div>
          <div
            style={{
              fontSize: "14px",
              color: "#34d399",
              background: "rgba(16, 185, 129, 0.1)",
              padding: "10px 18px",
              borderRadius: "12px",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              fontWeight: 600,
            }}
          >
            Saves 30-50% Tokens
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
