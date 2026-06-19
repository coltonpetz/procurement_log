import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { C, MONO, SANS } from "../theme";
import { Icon } from "../icons";

// ───────────────────────────────────────────────────────────────────────────
// Add Item modal — inserts a row into procurement_items for the given project.
// NOTE: buyout_id is intentionally left unset. The company relation lives in
// buyout_log, which doesn't exist yet (session 8). No free-text company field.
// ───────────────────────────────────────────────────────────────────────────

const INITIAL = {
  description: "",
  p6_activity_id: "",
  wbs_code: "",
  location_tag: "",
  p6_start_date: "",
  p6_finish_date: "",
};

export default function AddItemModal({ projectId, onClose, onAdded }) {
  const [form, setForm] = useState(INITIAL);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Close on Escape, matching the reference's slide-out behavior.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.description.trim()) {
      setError("Description is required.");
      return;
    }

    setSaving(true);

    const row = {
      project_id: projectId,
      // buyout_id left unset — buyout_log doesn't exist yet.
      description: form.description.trim(),
      p6_activity_id: form.p6_activity_id.trim() || null,
      wbs_code: form.wbs_code.trim() || null,
      location_tag: form.location_tag.trim() || null,
      p6_start_date: form.p6_start_date || null,
      p6_finish_date: form.p6_finish_date || null,
    };

    const { data, error: insertError } = await supabase
      .from("procurement_items")
      .insert(row)
      .select()
      .single();

    setSaving(false);

    if (insertError) {
      setError(insertError.message || "Could not save the item.");
      return;
    }

    onAdded(data);
  }

  return (
    <>
      {/* scrim */}
      <div
        onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "rgba(30,36,51,0.35)", zIndex: 20 }}
      />
      {/* centered modal */}
      <div
        role="dialog"
        aria-modal="true"
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "min(560px, calc(100vw - 48px))",
          maxHeight: "calc(100vh - 64px)",
          overflowY: "auto",
          background: "#fff",
          border: `1px solid ${C.border}`,
          boxShadow: "0 12px 40px rgba(0,0,0,0.2)",
          zIndex: 21,
          fontFamily: SANS,
        }}
      >
        {/* header */}
        <div style={{ padding: "18px 22px", borderBottom: `1px solid ${C.border}`, background: "#fafbfc", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Add Procurement Item</div>
            <div style={{ fontSize: 12.5, color: C.mut, marginTop: 2 }}>Manually enter a material line item</div>
          </div>
          <button onClick={onClose} type="button" style={{ background: "none", border: `1px solid ${C.border}`, padding: 6, cursor: "pointer", color: C.mut, display: "flex", lineHeight: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "20px 22px 24px" }}>
          {error && (
            <div style={{ background: C.criticalTint, borderLeft: `4px solid ${C.critical}`, color: C.criticalText, padding: "10px 14px", marginBottom: 16, fontSize: 13, fontWeight: 600 }}>
              {error}
            </div>
          )}

          <Field label="Description" required>
            <input style={inputStyle} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Structural Steel Package — Main Building" autoFocus />
          </Field>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 14 }}>
            <Field label="P6 Activity ID">
              <input style={{ ...inputStyle, fontFamily: MONO }} value={form.p6_activity_id} onChange={(e) => set("p6_activity_id", e.target.value)} placeholder="A1020" />
            </Field>
            <Field label="WBS Code">
              <input style={{ ...inputStyle, fontFamily: MONO }} value={form.wbs_code} onChange={(e) => set("wbs_code", e.target.value)} placeholder="2224.3.2" />
            </Field>
            <Field label="Location Tag">
              <input style={inputStyle} value={form.location_tag} onChange={(e) => set("location_tag", e.target.value)} placeholder="Level 2 — East" />
            </Field>
            <div />
            <Field label="P6 Start Date">
              <input type="date" style={{ ...inputStyle, fontFamily: MONO }} value={form.p6_start_date} onChange={(e) => set("p6_start_date", e.target.value)} />
            </Field>
            <Field label="P6 Finish Date">
              <input type="date" style={{ ...inputStyle, fontFamily: MONO }} value={form.p6_finish_date} onChange={(e) => set("p6_finish_date", e.target.value)} />
            </Field>
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 22 }}>
            <button type="submit" disabled={saving} style={{ ...btnPrimary, opacity: saving ? 0.6 : 1, cursor: saving ? "default" : "pointer" }}>
              {saving ? "Saving…" : "Add Item"}
            </button>
            <button type="button" onClick={onClose} style={btnSecondary}>Cancel</button>
          </div>
        </form>
      </div>
    </>
  );
}

function Field({ label, required, children }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, color: C.mut }}>
        {label}{required && <span style={{ color: C.critical }}> *</span>}
      </span>
      {children}
    </label>
  );
}

const inputStyle = {
  fontFamily: SANS,
  fontSize: 13.5,
  padding: "8px 10px",
  border: `1px solid ${C.border}`,
  color: C.ink,
  background: "#fff",
  width: "100%",
  outline: "none",
};

const btnPrimary = {
  padding: "10px 20px",
  fontSize: 13.5,
  fontWeight: 700,
  background: C.charcoal,
  color: "#fff",
  border: `1px solid ${C.charcoal}`,
  fontFamily: SANS,
};

const btnSecondary = {
  padding: "10px 20px",
  fontSize: 13.5,
  fontWeight: 600,
  background: "#fff",
  color: C.ink,
  border: `1px solid ${C.border}`,
  cursor: "pointer",
  fontFamily: SANS,
};
