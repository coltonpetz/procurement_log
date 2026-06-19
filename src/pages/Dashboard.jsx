import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { C, MONO, SANS } from "../theme";
import Header from "../components/Header";
import { Icon } from "../icons";

// ───────────────────────────────────────────────────────────────────────────
// Placeholder dashboard. Two jobs for now:
//   1. Confirm a just-created project saved (banner from navigation state).
//   2. List existing projects pulled live from Supabase, so we can see data
//      actually landing in the table. Not the real dashboard yet.
// ───────────────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const justCreated = location.state?.justCreated || null;

  const [projects, setProjects] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      const { data, error } = await supabase
        .from("projects")
        .select("id, name, number, client, project_type, start_date, end_date, created_at")
        .order("created_at", { ascending: false });

      if (!active) return;
      if (error) {
        setStatus("error");
        setErrorMessage(error.message || "Unknown error");
      } else {
        setProjects(data || []);
        setStatus("ready");
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div style={{ minHeight: "100vh", overflowY: "auto" }}>
      <Header
        title="Dashboard"
        sub="Placeholder — project list to confirm data is saving"
        right={
          <Link to="/projects/new" style={{ ...btnPrimary, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}>
            <Icon.plus width={14} height={14} /> New Project
          </Link>
        }
      />

      <div style={{ padding: "22px 28px 48px" }}>
        {/* just-created confirmation */}
        {justCreated && (
          <div
            style={{
              background: C.healthyTint,
              borderLeft: `4px solid ${C.healthy}`,
              padding: "14px 16px",
              marginBottom: 20,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span style={{ color: C.healthy, display: "flex" }}><Icon.check /></span>
            <span style={{ fontSize: 14 }}>
              Saved <strong>{justCreated.name}</strong>
              {justCreated.number ? ` (#${justCreated.number})` : ""} to Supabase.
            </span>
          </div>
        )}

        {/* projects panel */}
        <div style={{ background: "#fff", border: `1px solid ${C.border}` }}>
          <div style={{ padding: "16px 18px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>Projects</div>
              <div style={{ fontSize: 12, color: C.mut, marginTop: 2 }}>
                {status === "ready" ? `${projects.length} in Supabase` : status === "loading" ? "Loading…" : "Could not load"}
              </div>
            </div>
          </div>

          {status === "error" && (
            <div style={{ padding: "20px 18px", color: C.criticalText, fontFamily: MONO, fontSize: 12.5 }}>
              {errorMessage}
            </div>
          )}

          {status === "ready" && projects.length === 0 && (
            <div style={{ padding: "40px 18px", textAlign: "center", color: C.mut, fontSize: 13.5 }}>
              No projects yet. <Link to="/projects/new" style={{ color: C.accent, fontWeight: 600 }}>Create your first one →</Link>
            </div>
          )}

          {status === "ready" && projects.length > 0 && (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#fafbfc", borderBottom: `1px solid ${C.border}` }}>
                  <Th left>Name</Th>
                  <Th>Number</Th>
                  <Th>Client</Th>
                  <Th>Type</Th>
                  <Th>Start</Th>
                  <Th>End</Th>
                  <Th>{""}</Th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => navigate(`/projects/${p.id}/log`)}
                    style={{ borderBottom: `1px solid ${C.border}`, cursor: "pointer" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f7f8fa")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
                  >
                    <td style={{ ...td, fontWeight: 600 }}>{p.name}</td>
                    <td style={{ ...td, fontFamily: MONO, color: C.mut }}>{p.number || "—"}</td>
                    <td style={td}>{p.client || "—"}</td>
                    <td style={td}>{p.project_type || "—"}</td>
                    <td style={{ ...td, fontFamily: MONO, color: C.mut, whiteSpace: "nowrap" }}>{p.start_date || "—"}</td>
                    <td style={{ ...td, fontFamily: MONO, color: C.mut, whiteSpace: "nowrap" }}>{p.end_date || "—"}</td>
                    <td style={{ ...td, color: C.accent, fontWeight: 600, whiteSpace: "nowrap" }}>Open log →</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function Th({ children, left }) {
  return (
    <th style={{ textAlign: left ? "left" : "left", padding: "10px 16px", fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.6, color: C.mut }}>
      {children}
    </th>
  );
}

const td = { padding: "12px 16px", verticalAlign: "top" };

const btnPrimary = {
  padding: "8px 14px",
  fontSize: 13,
  fontWeight: 700,
  background: C.charcoal,
  color: "#fff",
  border: `1px solid ${C.charcoal}`,
  fontFamily: SANS,
};
