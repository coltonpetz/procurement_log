import React, { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

// ───────────────────────────────────────────────────────────────────────────
// Connection check page.
// Purpose: confirm the React app can reach Supabase with the configured
// .env credentials. It queries the `projects` table for a row count.
//
// Expected results until schema.sql has been run in Supabase:
//   • "Could not reach the table" with a message about `projects` not existing.
// After schema.sql has been run (even with zero rows):
//   • "Connected" with a project count of 0.
// ───────────────────────────────────────────────────────────────────────────

const C = {
  charcoal: "#1e2433",
  bg: "#f4f5f7",
  border: "#e2e4e8",
  accent: "#0696d7",
  critical: "#dc2626",
  criticalText: "#991b1b",
  criticalTint: "#fdecec",
  healthy: "#16a34a",
  healthyTint: "#ecf7ef",
  mut: "#6b7280",
  ink: "#1e2433",
};
const MONO = "'SF Mono','Roboto Mono',Menlo,Consolas,'Liberation Mono',monospace";

export default function App() {
  // status: "loading" | "connected" | "error"
  const [status, setStatus] = useState("loading");
  const [projectCount, setProjectCount] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function checkConnection() {
      // `head: true` asks Postgres for the count only, no row data needed.
      const { count, error } = await supabase
        .from("projects")
        .select("*", { count: "exact", head: true });

      if (!active) return;

      if (error) {
        setStatus("error");
        setErrorMessage(error.message || "Unknown error");
      } else {
        setStatus("connected");
        setProjectCount(count ?? 0);
      }
    }

    checkConnection();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div
      style={{
        minHeight: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: C.bg,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 520,
          background: "#fff",
          border: `1px solid ${C.border}`,
          borderTop: `3px solid ${C.accent}`,
        }}
      >
        {/* header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: `1px solid ${C.border}`,
            background: "#fafbfc",
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 1.5,
              textTransform: "uppercase",
              color: "#7e8aa0",
            }}
          >
            Procurement Tool
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, marginTop: 4 }}>
            Supabase Connection Check
          </div>
        </div>

        {/* body */}
        <div style={{ padding: "24px" }}>
          {status === "loading" && (
            <StatusBlock
              barColor={C.mut}
              tint="#f1f2f4"
              label="Checking…"
              fg={C.mut}
              detail="Reaching out to Supabase."
            />
          )}

          {status === "connected" && (
            <StatusBlock
              barColor={C.healthy}
              tint={C.healthyTint}
              label="Connected ✓"
              fg={C.healthy}
              detail={
                <>
                  Reached the <code style={codeStyle}>projects</code> table.
                  <div
                    style={{
                      fontFamily: MONO,
                      fontSize: 32,
                      fontWeight: 700,
                      color: C.ink,
                      marginTop: 10,
                    }}
                  >
                    {projectCount}
                  </div>
                  <div style={{ fontSize: 12, color: C.mut }}>
                    project{projectCount === 1 ? "" : "s"} in the database
                  </div>
                </>
              }
            />
          )}

          {status === "error" && (
            <StatusBlock
              barColor={C.critical}
              tint={C.criticalTint}
              label="Could not reach the table"
              fg={C.criticalText}
              detail={
                <>
                  <div
                    style={{
                      fontFamily: MONO,
                      fontSize: 12.5,
                      color: C.criticalText,
                      marginTop: 6,
                      wordBreak: "break-word",
                    }}
                  >
                    {errorMessage}
                  </div>
                  <div style={{ fontSize: 12.5, color: C.mut, marginTop: 12 }}>
                    This is expected until you run{" "}
                    <code style={codeStyle}>supabase/schema.sql</code> in the
                    Supabase SQL Editor. Once the <code style={codeStyle}>projects</code>{" "}
                    table exists, this page will show “Connected” with a count of 0.
                  </div>
                </>
              }
            />
          )}
        </div>

        {/* footer */}
        <div
          style={{
            padding: "12px 24px",
            borderTop: `1px solid ${C.border}`,
            background: "#fafbfc",
            fontSize: 11.5,
            color: C.mut,
            fontFamily: MONO,
          }}
        >
          {supabase ? "Client configured from .env" : "Client not configured"}
        </div>
      </div>
    </div>
  );
}

function StatusBlock({ barColor, tint, label, fg, detail }) {
  return (
    <div
      style={{
        background: tint,
        borderLeft: `4px solid ${barColor}`,
        padding: "16px 18px",
      }}
    >
      <div style={{ fontSize: 15, fontWeight: 700, color: fg }}>{label}</div>
      <div style={{ fontSize: 13.5, color: C.ink, marginTop: 6 }}>{detail}</div>
    </div>
  );
}

const codeStyle = {
  fontFamily: MONO,
  fontSize: 12.5,
  background: "#eef0f3",
  padding: "1px 5px",
};
