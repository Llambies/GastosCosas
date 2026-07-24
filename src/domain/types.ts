import type { IsoDate } from "./dates";

export type ExpenseKind = "subscription" | "fixed";
export type PeriodPreset = "today" | "monthly" | "annual" | "custom";
export type Recurrence = "none" | "monthly" | "yearly";
export type ExpenseStatus = "active" | "ending" | "ended";

export interface Label {
  id: string;
  name: string;
  icon: string;
  color: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  name: string;
  amountMinor: number;
  currency: string;
  kind: ExpenseKind;
  periodPreset: PeriodPreset;
  startsOn: IsoDate;
  endsOn: IsoDate | null;
  recurrence: Recurrence;
  isCancellable: boolean;
  status: ExpenseStatus;
  cancellationRequestedOn: IsoDate | null;
  cancellationEffectiveOn: IsoDate | null;
  icon: string;
  color: string;
  notifyDaysBeforeDue: number | null;
  notifyDaysBeforeEnd: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  labels: Label[];
}

export interface ExpenseInput {
  name: string;
  amountMinor: number;
  currency?: string;
  kind: ExpenseKind;
  periodPreset: PeriodPreset;
  startsOn: IsoDate;
  endsOn?: IsoDate | null;
  recurrence: Recurrence;
  isCancellable?: boolean;
  icon: string;
  color: string;
  notifyDaysBeforeDue?: number | null;
  notifyDaysBeforeEnd?: number | null;
  notes?: string | null;
  labelIds: string[];
}

export interface AppSettings {
  notifyHour: number;
  notifyMinute: number;
  defaultNotifyDaysBeforeDue: number;
  defaultNotifyDaysBeforeEnd: number;
  currency: string;
}

export type CycleMode = "renewing" | "ending";

export interface CycleProgress {
  mode: CycleMode;
  /** 0–1 progreso del ciclo actual */
  progress: number;
  cycleStart: IsoDate;
  cycleEnd: IsoDate;
  markerOn: IsoDate;
  label: string;
}
