export interface ExpenseRow {
  id: string;
  name: string;
  amount_minor: number;
  currency: string;
  kind: string;
  period_preset: string;
  starts_on: string;
  ends_on: string | null;
  recurrence: string;
  is_cancellable: number;
  status: string;
  cancellation_requested_on: string | null;
  cancellation_effective_on: string | null;
  icon: string;
  color: string;
  notify_days_before_due: number | null;
  notify_days_before_end: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface LabelRow {
  id: string;
  name: string;
  icon: string;
  color: string;
  created_at: string;
}
