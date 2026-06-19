import React from "react";
import { C } from "../theme";

// Page header bar — ported from the reference mockup.
export default function Header({ title, sub, right }) {
  return (
    <div
      style={{
        padding: "22px 28px 18px",
        borderBottom: `1px solid ${C.border}`,
        background: "#fff",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
      }}
    >
      <div>
        <h1 style={{ margin: 0, fontSize: 21, fontWeight: 700, letterSpacing: -0.2 }}>{title}</h1>
        {sub && <div style={{ fontSize: 13, color: C.mut, marginTop: 3 }}>{sub}</div>}
      </div>
      {right}
    </div>
  );
}
