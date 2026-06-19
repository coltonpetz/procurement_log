import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import NewProject from "./pages/NewProject";

// ───────────────────────────────────────────────────────────────────────────
// App routes. The Layout renders the persistent sidebar; child routes render
// into its <Outlet>.
//   /             → Dashboard (placeholder + project list)
//   /projects/new → Project creation form
// ───────────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="projects/new" element={<NewProject />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
