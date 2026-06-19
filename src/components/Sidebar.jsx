import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { C, MONO, SANS } from "../theme";
import { Icon } from "../icons";

// ───────────────────────────────────────────────────────────────────────────
// Left sidebar — charcoal, sharp-cornered, ported from the reference mockup.
// The Procurement Log entry is project-scoped: it points at the most recently
// viewed project's log (remembered in localStorage by the log screen). With no
// project visited yet, it falls back to the dashboard where you pick one.
// ───────────────────────────────────────────────────────────────────────────

const linkStyle = (isActive) => ({
  display: "flex",
  alignItems: "center",
  gap: 11,
  width: "100%",
  padding: "11px 18px",
  background: isActive ? "#2b3447" : "transparent",
  borderLeft: isActive ? `3px solid ${C.accent}` : "3px solid transparent",
  color: isActive ? "#fff" : "#9aa3b5",
  fontSize: 13.5,
  fontWeight: 600,
  cursor: "pointer",
  textAlign: "left",
  fontFamily: SANS,
  textDecoration: "none",
});

export default function Sidebar() {
  const location = useLocation();

  // Reading inside render (with location as an implicit dep via useLocation)
  // keeps this fresh as you navigate between projects.
  const lastProjectId = localStorage.getItem("lastProjectId");
  const logTo = lastProjectId ? `/projects/${lastProjectId}/log` : "/";
  const onLogRoute = /^\/projects\/[^/]+\/log/.test(location.pathname);

  return (
    <aside
      style={{
        width: 236,
        background: C.charcoal,
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        minHeight: "100vh",
      }}
    >
      {/* brand block */}
      <div style={{ padding: "20px 18px 18px", borderBottom: "1px solid #2b3447" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: C.accent, marginBottom: 14 }}>
          <Icon.box />
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "#7e8aa0" }}>
            Procurement
          </span>
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.25 }}>Material Tracker</div>
        <div style={{ fontFamily: MONO, fontSize: 12, color: "#7e8aa0", marginTop: 3 }}>
          Okland Construction
        </div>
      </div>

      {/* nav */}
      <nav style={{ padding: "12px 0", flex: 1 }}>
        <NavLink to="/" end style={({ isActive }) => linkStyle(isActive)}>
          <Icon.grid />
          Dashboard
        </NavLink>

        <NavLink to="/projects/new" style={({ isActive }) => linkStyle(isActive)}>
          <Icon.plus />
          New Project
        </NavLink>

        {/* Project-scoped: active highlight is driven by the route, not NavLink,
            because the target id is dynamic. */}
        <NavLink to={logTo} style={() => linkStyle(onLogRoute)}>
          <Icon.list />
          Procurement Log
        </NavLink>
      </nav>

      {/* footer */}
      <div style={{ padding: "16px 18px", borderTop: "1px solid #2b3447", fontSize: 11, color: "#7e8aa0", lineHeight: 1.6 }}>
        <div style={{ fontFamily: MONO }}>Will it be on site in time?</div>
        <div style={{ marginTop: 2 }}>Float = need date − projected delivery</div>
      </div>
    </aside>
  );
}
