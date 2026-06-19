-- ============================================================================
-- Procurement Tool — Supabase / Postgres schema
-- ----------------------------------------------------------------------------
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New query →
-- paste → Run) to create all 4 tables for the procurement tool.
--
-- NOTE: All computed fields (Action Required, Projected Delivery Date, Float,
-- Next Action Due Date) are calculated in the FRONTEND, not stored here.
-- There are intentionally no generated/computed columns for those.
-- ============================================================================

-- TABLE 1: projects
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  number TEXT,
  client TEXT,
  project_type TEXT,
  start_date DATE,
  end_date DATE,
  use_working_days BOOLEAN DEFAULT TRUE,
  p6_update_cadence INTEGER DEFAULT 7,
  current_p6_update DATE,
  prior_p6_update DATE,
  default_wo_to_submittal_days INTEGER DEFAULT 14,
  default_gc_review_days INTEGER DEFAULT 10,
  default_ae_review_days INTEGER DEFAULT 14,
  default_float_buffer_days INTEGER DEFAULT 5,
  default_lead_time_days INTEGER DEFAULT 21,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE 2: buyout_log
CREATE TABLE buyout_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  scope_of_work TEXT,
  tp_manager TEXT,
  tp_contact TEXT,
  status TEXT DEFAULT 'loi_only'
    CHECK (status IN ('loi_only', 'work_order_issued', 'work_order_executed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE 3: procurement_items
CREATE TABLE procurement_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  buyout_id UUID REFERENCES buyout_log(id),
  description TEXT,
  p6_activity_id TEXT,
  wbs_code TEXT,
  location_tag TEXT,
  p6_activity_status TEXT,
  p6_start_date DATE,
  p6_finish_date DATE,
  date_wo_sent DATE,
  date_submittal_received DATE,
  date_submittal_to_ae DATE,
  date_returned_from_ae DATE,
  date_material_ordered DATE,
  date_communicated_delivery DATE,
  date_trade_shop_delivery DATE,
  date_on_site DATE,
  override_wo_to_submittal_days INTEGER,
  override_gc_review_days INTEGER,
  override_ae_review_days INTEGER,
  override_float_buffer_days INTEGER,
  override_lead_time_days INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE 4: audit_log
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES procurement_items(id) ON DELETE CASCADE,
  field_changed TEXT,
  old_value TEXT,
  new_value TEXT,
  changed_by TEXT,
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  note TEXT
);
