import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { cv } from "@/content/cv";

// Link preview (Facebook, LinkedIn, Slack, X…): the site's dark hero —
// rounded frame, rays, grid — with the name and the portrait card.

export const alt = `${cv.profile.name} — ${cv.profile.title}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Dark theme tokens from globals.css.
const color = {
  background: "#0a0a0a",
  card: "#111113",
  foreground: "#ededed",
  muted: "#a1a1aa",
  subtle: "#71717a",
  border: "#27272a",
  signal: "#4ade80",
};

const STACK = ["React", "Next.js", "NestJS", "PostgreSQL", "Redis"];

const asset = (...path: string[]) => readFile(join(process.cwd(), ...path));

export default async function OpengraphImage() {
  const { profile } = cv;
  const [medium, mono, avatar] = await Promise.all([
    asset("assets/fonts/Geist-Medium.ttf"),
    asset("assets/fonts/GeistMono-Regular.ttf"),
    profile.avatar ? asset("public", profile.avatar) : undefined,
  ]);

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        padding: 24,
        background: color.background,
        color: color.foreground,
        fontFamily: "Geist",
      }}
    >
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          padding: "0 64px",
          borderRadius: 40,
          border: `1px solid ${color.border}`,
          backgroundColor: color.background,
          backgroundImage: [
            "radial-gradient(ellipse 70% 60% at 50% 0%, rgba(255,255,255,0.13), rgba(255,255,255,0) 70%)",
            "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px)",
            "linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
          ].join(", "),
          backgroundSize: "100% 100%, 48px 48px, 48px 48px",
        }}
      >
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              fontFamily: "Geist Mono",
              fontSize: 20,
              letterSpacing: 4,
              color: color.subtle,
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 999,
                background: color.signal,
                marginRight: 14,
              }}
            />
            PORTFOLIO
          </div>
          <div style={{ marginTop: 28, fontSize: 80, letterSpacing: -3, lineHeight: 1 }}>
            {profile.name}
          </div>
          <div style={{ marginTop: 18, fontSize: 36, color: color.muted }}>{profile.title}</div>
          <div
            style={{
              marginTop: 44,
              fontFamily: "Geist Mono",
              fontSize: 20,
              color: color.subtle,
            }}
          >
            {STACK.join("  ·  ")}
          </div>
          <div
            style={{ marginTop: 12, fontFamily: "Geist Mono", fontSize: 20, color: color.muted }}
          >
            {profile.email}
          </div>
        </div>

        {avatar && (
          <div
            style={{
              position: "relative",
              display: "flex",
              padding: 10,
              marginLeft: 48,
              borderRadius: 36,
              border: `1px solid ${color.border}`,
              background: color.card,
              transform: "rotate(2deg)",
              boxShadow: "0 30px 60px rgba(0,0,0,0.5)",
            }}
          >
            <img
              src={`data:image/png;base64,${avatar.toString("base64")}`}
              width={340}
              height={340}
              alt=""
              style={{ borderRadius: 28, objectFit: "cover" }}
            />
            <div
              style={{
                position: "absolute",
                right: 24,
                bottom: 22,
                padding: "6px 12px",
                borderRadius: 999,
                background: "rgba(10,10,10,0.7)",
                fontFamily: "Geist Mono",
                fontSize: 14,
                letterSpacing: 3,
                color: "rgba(255,255,255,0.8)",
              }}
            >
              {profile.location.toUpperCase()}
            </div>
          </div>
        )}
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: "Geist", data: medium, weight: 500, style: "normal" },
        { name: "Geist Mono", data: mono, weight: 400, style: "normal" },
      ],
    },
  );
}
