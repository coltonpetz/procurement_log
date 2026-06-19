// ───────────────────────────────────────────────────────────────────────────
// Date helpers — ported from reference/ProcurementTool.jsx.
// Parse 'YYYY-MM-DD' as a LOCAL date (no timezone drift) and format for display.
// ───────────────────────────────────────────────────────────────────────────

export function parse(d) {
  if (!d) return null;
  const [y, m, day] = d.split("-").map(Number);
  return new Date(y, m - 1, day);
}

export function fmt(d) {
  if (!d) return "—";
  const date = typeof d === "string" ? parse(d) : d;
  if (!date) return "—";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
