import { ImageResponse } from "next/og";
import { proofStats, site } from "@/lib/portfolio";

export const alt = `${site.name} - Software Engineer fullstack SaaS`;
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#f7f3ea",
          color: "#111111",
          padding: 64,
          fontFamily: "Arial",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 34, fontWeight: 800 }}>{site.name}</div>
          <div
            style={{
              background: "#171717",
              color: "#fff7e9",
              borderRadius: 14,
              padding: "16px 20px",
              fontSize: 28,
              fontWeight: 800,
            }}
          >
            {site.initials}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ color: "#0b4f49", fontSize: 24, fontWeight: 800, marginBottom: 22 }}>
            Software Engineer fullstack SaaS
          </div>
          <div style={{ maxWidth: 880, fontSize: 72, lineHeight: 0.98, fontWeight: 900 }}>
            Plateformes rapides, sécurisées et prêtes à scaler.
          </div>
        </div>
        <div style={{ display: "flex", gap: 18 }}>
          {proofStats.slice(0, 3).map((stat) => (
            <div
              key={stat.label}
              style={{
                display: "flex",
                flexDirection: "column",
                width: 260,
                border: "1px solid rgba(17, 17, 17, 0.14)",
                borderRadius: 16,
                padding: 20,
                background: "#fffaf1",
              }}
            >
              <strong style={{ fontSize: 44 }}>{stat.value}</strong>
              <span style={{ color: "#6f6a60", fontSize: 20 }}>{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
