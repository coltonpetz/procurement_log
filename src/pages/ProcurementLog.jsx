import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { C, MONO, SANS } from "../theme";
import { fmt } from "../dates";
import Header from "../components/Header";
import AddItemModal from "../components/AddItemModal";
import { Icon } from "../icons";

// ───────────────────────────────────────────────────────────────────────────
// Procurement Log — the list of procurement_items for one project.
// View + add only. No formula engine (float / Action Required / projected
// delivery) and no P6 import yet — those are later sessions.
// ───────────────────────────────────────────────────────────────────────────

export default function ProcurementLog() {
  const { projectId } = useParams();

  const [project, setProject] = useState(null);
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [errorMessage, setErrorMessage] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  // Remember the most recently viewed project so the sidebar's Procurement Log
  // link can jump straight back here.
  useEffect(() => {
    if (projectId) localStorage.setItem("lastProjectId", projectId);
  }, [projectId]);

  const loadItems = useCallback(async () => {
    // Sort by P6 Start Date ascending, nulls last.
    const { data, error } = await supabase
      .from("procurement_items")
      .select("id, description, p6_activity_id, wbs_code, location_tag, p6_start_date, p6_finish_date")
      .eq("project_id", projectId)
      .order("p6_start_date", { ascending: true, nullsFirst: false });

    if (error) {
      setStatus("error");
      setErrorMessage(error.message || "Unknown error");
    } else {
      setItems(data || []);
      setStatus("ready");
    }
  }, [projectId]);

  // Load the project header info + items together.
  useEffect(() => {
    let active = true;

    async function loadProject() {
      const { data } = await supabase
        .from("projects")
        .select("id, name, number, client")
        .eq("id", projectId)
        .maybeSingle();
      if (active) setProject(data || null);
    }

    loadProject();
    loadItems();
    return () => {
      active = false;
    };
  }, [projectId, loadItems]);

  function handleAdded() {
    setShowAdd(false);
    loadItems();
  }

  const sub = project
    ? `${project.name}${project.number ? ` · #${project.number}` : ""}`
    : "Materials tracked for this project";

  return (
    <div style={{ minHeight: "100vh", overflowY: "auto" }}>
      <Header
        title="Procurement Log"
        sub={sub}
        right={
          <button onClick={() => setShowAdd(true)} style={{ ...btnPrimary, display: "inline-flex", alignItems: "center", gap: 6 }}>
            <Icon.plus width={14} height={14} /> Add Item
          </button>
        }
      />

      <div style={{ padding: "22px 28px 48px" }}>
        <div style={{ marginBottom: 14 }}>
          <Link to="/" style={{ fontSize: 12.5, color: C.accent, fontWeight: 600, textDecoration: "none" }}>← All projects</Link>
        </div>

        <div style={{ background: "#fff", border: `1px solid ${C.border}` }}>
          {/* panel head */}
          <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>Items</div>
              <div style={{ fontSize: 12, color: C.mut, marginTop: 2 }}>
                {status === "ready" ? `${items.length} item${items.length === 1 ? "" : "s"} · sorted by P6 start date` : status === "loading" ? "Loading…" : "Could not load"}
              </div>
            </div>
          </div>

          {status === "error" && (
            <div style={{ padding: "20px 18px", color: C.criticalText, fontFamily: MONO, fontSize: 12.5 }}>{errorMessage}</div>
          )}

          {status === "ready" && items.length === 0 && (
            <div style={{ padding: "48px 18px", textAlign: "center" }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.ink }}>No items yet</div>
              <div style={{ fontSize: 13, color: C.mut, marginTop: 6 }}>This project has no procurement items yet.</div>
              <button onClick={() => setShowAdd(true)} style={{ ...btnPrimary, marginTop: 16, display: "inline-flex", alignItems: "center", gap: 6 }}>
                <Icon.plus width={14} height={14} /> Add your first item
              </button>
            </div>
          )}

          {status === "ready" && items.length > 0 && (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#fafbfc", borderBottom: `1px solid ${C.border}` }}>
                  <Th left>Description</Th>
                  <Th>P6 Activity ID</Th>
                  <Th>WBS Code</Th>
                  <Th>Location Tag</Th>
                  <Th>P6 Start Date</Th>
                  <Th>P6 Finish Date</Th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr
                    key={it.id}
                    style={{ borderBottom: `1px solid ${C.border}` }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f7f8fa")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
                  >
                    <td style={{ ...td, fontWeight: 600, maxWidth: 320 }}>{it.description || "—"}</td>
                    <td style={{ ...td, fontFamily: MONO, fontSize: 12.5, color: C.mut, whiteSpace: "nowrap" }}>{it.p6_activity_id || "—"}</td>
                    <td style={{ ...td, fontFamily: MONO, fontSize: 12.5, color: C.mut, whiteSpace: "nowrap" }}>{it.wbs_code || "—"}</td>
                    <td style={{ ...td, whiteSpace: "nowrap" }}>{it.location_tag || "—"}</td>
                    <td style={{ ...td, fontFamily: MONO, fontSize: 12.5, whiteSpace: "nowrap" }}>{fmt(it.p6_start_date)}</td>
                    <td style={{ ...td, fontFamily: MONO, fontSize: 12.5, color: C.mut, whiteSpace: "nowrap" }}>{fmt(it.p6_finish_date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showAdd && (
        <AddItemModal projectId={projectId} onClose={() => setShowAdd(false)} onAdded={handleAdded} />
      )}
    </div>
  );
}

function Th({ children, left }) {
  return (
    <th style={{ textAlign: "left", padding: "10px 16px", fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.6, color: C.mut, whiteSpace: "nowrap" }}>
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
  cursor: "pointer",
  fontFamily: SANS,
};
