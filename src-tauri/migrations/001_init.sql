CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL CHECK (length(trim(name)) > 0),
  amount_minor INTEGER NOT NULL CHECK (amount_minor >= 0),
  currency TEXT NOT NULL DEFAULT 'EUR' CHECK (currency = 'EUR'),
  kind TEXT NOT NULL CHECK (kind IN ('subscription', 'fixed')),
  period_preset TEXT NOT NULL CHECK (period_preset IN ('today', 'monthly', 'annual', 'custom')),
  starts_on TEXT NOT NULL CHECK (starts_on GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'),
  ends_on TEXT CHECK (ends_on IS NULL OR ends_on GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'),
  recurrence TEXT NOT NULL CHECK (recurrence IN ('none', 'monthly', 'yearly')),
  is_cancellable INTEGER NOT NULL DEFAULT 1 CHECK (is_cancellable IN (0, 1)),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'ending', 'ended')),
  cancellation_requested_on TEXT CHECK (
    cancellation_requested_on IS NULL
    OR cancellation_requested_on GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'
  ),
  cancellation_effective_on TEXT CHECK (
    cancellation_effective_on IS NULL
    OR cancellation_effective_on GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'
  ),
  icon TEXT NOT NULL DEFAULT 'circle',
  color TEXT NOT NULL DEFAULT '#38BDF8',
  notify_days_before_due INTEGER CHECK (
    notify_days_before_due IS NULL OR notify_days_before_due >= 0
  ),
  notify_days_before_end INTEGER CHECK (
    notify_days_before_end IS NULL OR notify_days_before_end >= 0
  ),
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_expenses_status ON expenses(status);
CREATE INDEX IF NOT EXISTS idx_expenses_kind ON expenses(kind);
CREATE INDEX IF NOT EXISTS idx_expenses_starts_on ON expenses(starts_on);

CREATE TABLE IF NOT EXISTS labels (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL UNIQUE CHECK (length(trim(name)) > 0),
  icon TEXT NOT NULL DEFAULT 'tag',
  color TEXT NOT NULL DEFAULT '#94A3B8',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS expense_labels (
  expense_id TEXT NOT NULL,
  label_id TEXT NOT NULL,
  PRIMARY KEY (expense_id, label_id),
  FOREIGN KEY (expense_id) REFERENCES expenses(id) ON DELETE CASCADE,
  FOREIGN KEY (label_id) REFERENCES labels(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_expense_labels_label ON expense_labels(label_id);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT NOT NULL
);

INSERT OR IGNORE INTO settings(key, value) VALUES
  ('notify_hour', '9'),
  ('notify_minute', '0'),
  ('default_notify_days_before_due', '1'),
  ('default_notify_days_before_end', '3'),
  ('currency', 'EUR');

INSERT OR IGNORE INTO labels(id, name, icon, color, created_at) VALUES
  ('lbl-streaming', 'Streaming', 'tv', '#F59E0B', '2020-01-01T00:00:00.000Z'),
  ('lbl-vivienda', 'Vivienda', 'home', '#38BDF8', '2020-01-01T00:00:00.000Z'),
  ('lbl-transporte', 'Transporte', 'car', '#34D399', '2020-01-01T00:00:00.000Z'),
  ('lbl-salud', 'Salud', 'heart-pulse', '#F472B6', '2020-01-01T00:00:00.000Z'),
  ('lbl-otros', 'Otros', 'sparkles', '#94A3B8', '2020-01-01T00:00:00.000Z');
