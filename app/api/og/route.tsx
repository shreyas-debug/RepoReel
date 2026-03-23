import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const owner = searchParams.get("owner") ?? "";
  const repo = searchParams.get("repo") ?? "";
  const from = searchParams.get("from") ?? "";
  const to = searchParams.get("to") ?? "";
  const highlight =
    searchParams.get("highlight")?.slice(0, 280) ?? "Release highlight";
  const commits = searchParams.get("commits") ?? "0";
  const contributors = searchParams.get("contributors") ?? "0";
  const files = searchParams.get("files") ?? "0";

  const fullName = `${owner}/${repo}`.replace(/^\/+|\/+$/g, "") || "repo";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#0A0F1E",
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
          padding: 48,
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 28,
              fontWeight: 700,
              color: "#F1F5F9",
            }}
          >
            <span style={{ color: "#6366F1" }}>Repo</span>
            <span>Reel</span>
          </div>
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 24,
            paddingTop: 16,
            paddingBottom: 16,
          }}
        >
          <div
            style={{
              fontSize: 56,
              fontWeight: 800,
              color: "#F1F5F9",
              textAlign: "center",
              lineHeight: 1.1,
              maxWidth: 1000,
            }}
          >
            {fullName}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontSize: 26,
              fontWeight: 600,
              color: "#F1F5F9",
              background: "rgba(99, 102, 241, 0.2)",
              border: "1px solid rgba(99, 102, 241, 0.45)",
              borderRadius: 999,
              padding: "12px 28px",
            }}
          >
            <span>{from}</span>
            <span style={{ color: "#6366F1" }}>→</span>
            <span>{to}</span>
          </div>
          <div
            style={{
              fontSize: 36,
              fontWeight: 700,
              color: "#ffffff",
              textAlign: "center",
              lineHeight: 1.25,
              maxWidth: 1000,
              marginTop: 8,
            }}
          >
            {highlight}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            paddingTop: 20,
            borderTop: "1px solid rgba(255,255,255,0.1)",
            fontSize: 22,
            color: "#94A3B8",
            fontWeight: 500,
          }}
        >
          {commits} commits · {contributors} contributors · {files} files changed
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
