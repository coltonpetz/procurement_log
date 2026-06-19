import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { C, MONO, SANS } from "../theme";
import Header from "../components/Header";

// ───────────────────────────────────────────────────────────────────────────
// Project creation screen.
// Fields map to the `projects` table in CLAUDE.md. The five default duration
// fields are pre-filled with the schema defaults so they rarely need editing.
// On submit, insert one row into Supabase, then redirect to the dashboard.
// ───────────────────────────────────────────────────────────────────────────

// Schema defaults (CLAUDE.md): wo→submittal 14, GC review 10, A/E review 14,
// float buffer 5, lead time 21.
const INITIAL = {
  name: "",
  number: "",
  client: "",
  project_type: "",
  start_date: "",
  end_date: "",
  use_working_days: true,
  default_wo_to_submittal_days: 14,
  default_gc_review_days: 10,
  default_ae_review_days: 14,
  default_float_buffer_days: 5,
  default_lead_time_days: 21,
};

export default function NewProject() {
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("Project name is required.");
      return;
    }

    setSaving(true);

    // Build the row: blank date/text fields become null; durations become ints.
    const row = {
      name: form.name.trim(),
      number: form.number.trim() || null,
      client: form.client.trim() || null,
      project_type: form.project_type.trim() || null,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      use_working_days: form.use_working_days,
      default_wo_to_submittal_days: Number(form.default_wo_to_submittal_days),
      default_gc_review_days: Number(form.default_gc_review_days),
      default_ae_review_days: Number(form.default_ae_review_days),
      default_float_buffer_days: Number(form.default_float_buffer_days),
      default_lead_time_days: Number(form.default_lead_time_days),
    };

    const { data, error: insertError } = await supabase
      .from("projects")
      .insert(row)
      .select()
      .single();

    setSaving(false);

    if (insertError) {
      setError(insertError.message || "Could not save the project.");
      return;
    }

    // Redirect to the dashboard, passing the new project so it can confirm.
    navigate("/", { state: { justCreated: data } });
  }

  return (
    <div style={{ minHeight: "100vh", overflowY: "auto" }}>
      <Header title="New Project" sub="Set up a project and its contract duration defaults" />

      <form onSubmit={handleSubmit} style={{ padding: "22px 28px 48px", maxWidth: 820 }}>
        {error && (
          <div
            style={{
              background: C.criticalTint,
              borderLeft: `4px solid ${C.critical}`,
              color: C.criticalText,
              padding: "12px 16px",
              marginBottom: 18,
              fontSize: 13.5,
              fontWeight: 600,
            }}
          >
            {error}
          </div>
        )}

        {/* ── Project details ───────────────────────────────────────────── */}
        <Section title="Project Details">
          <Grid>
            <Field label="Project Name" required>
              <input style={inputStyle} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Heber Valley Temple" autoFocus />
            </Field>
            <Field label="Project Number">
              <input style={inputStyle} value={form.number} onChange={(e) => set("number", e.target.value)} placeholder="2224" />
            </Field>
            <Field label="Client">
              <input style={inputStyle} value={form.client} onChange={(e) => set("client", e.target.value)} placeholder="The Church of Jesus Christ of Latter-day Saints" />
            </Field>
            <Field label="Project Type">
              <input style={inputStyle} value={form.project_type} onChange={(e) => set("project_type", e.target.value)} placeholder="Religious / Institutional" />
            </Field>
            <Field label="Start Date">
              <input type="date" style={inputStyle} value={form.start_date} onChange={(e) => set("start_date", e.target.value)} />
            </Field>
            <Field label="End Date">
              <input type="date" style={inputStyle} value={form.end_date} onChange={(e) => set("end_date", e.target.value)} />
            </Field>
          </Grid>

          {/* use_working_days toggle */}
          <label style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 16, cursor: "pointer", width: "fit-content" }}>
            <input type="checkbox" checked={form.use_working_days} onChange={(e) => set("use_working_days", e.target.checked)} style={{ width: 16, height: 16, accentColor: C.accent }} />
            <span style={{ fontSize: 13.5, fontWeight: 600 }}>Use working days</span>
            <span style={{ fontSize: 12, color: C.mut }}>(schedule math skips weekends)</span>
          </label>
        </Section>

        {/* ── Duration defaults ─────────────────────────────────────────── */}
        <Section
          title="Contract Duration Defaults"
          sub="Pre-filled with standard values. These feed the float / schedule math and can be overridden per item later."
        >
          <Grid>
            <Field label="WO → Submittal (days)"><NumInput value={form.default_wo_to_submittal_days} onChange={(v) => set("default_wo_to_submittal_days", v)} /></Field>
            <Field label="GC Review (days)"><NumInput value={form.default_gc_review_days} onChange={(v) => set("default_gc_review_days", v)} /></Field>
            <Field label="A/E Review (days)"><NumInput value={form.default_ae_review_days} onChange={(v) => set("default_ae_review_days", v)} /></Field>
            <Field label="Float Buffer (days)"><NumInput value={form.default_float_buffer_days} onChange={(v) => set("default_float_buffer_days", v)} /></Field>
            <Field label="Lead Time (days)"><NumInput value={form.default_lead_time_days} onChange={(v) => set("default_lead_time_days", v)} /></Field>
          </Grid>
        </Section>

        {/* actions */}
        <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
          <button type="submit" disabled={saving} style={{ ...btnPrimary, opacity: saving ? 0.6 : 1, cursor: saving ? "default" : "pointer" }}>
            {saving ? "Saving…" : "Create Project"}
          </button>
          <button type="button" onClick={() => navigate("/")} style={btnSecondary}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Small presentational helpers ────────────────────────────────────────────
function Section({ title, sub, children }) {
  return (
    <div style={{ background: "#fff", border: `1px solid ${C.border}`, padding: "20px 22px", marginBottom: 18 }}>
      <div style={{ fontSize: 14, fontWeight: 700 }}>{title}</div>
      {sub && <div style={{ fontSize: 12.5, color: C.mut, marginTop: 3, marginBottom: 4, maxWidth: 640 }}>{sub}</div>}
      <div style={{ marginTop: 14 }}>{children}</div>
    </div>
  );
}

function Grid({ children }) {
  return <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>{children}</div>;
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

function NumInput({ value, onChange }) {
  return (
    <input
      type="number"
      min={0}
      style={{ ...inputStyle, fontFamily: MONO, width: 110 }}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
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
