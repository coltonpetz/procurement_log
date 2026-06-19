import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { C, SANS } from "../theme";

// App shell: persistent sidebar + routed content area.
export default function Layout() {
  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: SANS, color: C.ink, background: C.bg, fontSize: 14 }}>
      <Sidebar />
      <main style={{ flex: 1, minWidth: 0 }}>
        <Outlet />
      </main>
    </div>
  );
}
