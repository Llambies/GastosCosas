import { addDays, type IsoDate } from "./dates";
import type { PeriodPreset, Recurrence } from "./types";

export interface PeriodResolved {
  startsOn: IsoDate;
  endsOn: IsoDate | null;
  recurrence: Recurrence;
}

export function resolvePeriodPreset(
  preset: PeriodPreset,
  startsOn: IsoDate,
  endsOn: IsoDate | null,
  recurrence: Recurrence,
): PeriodResolved {
  switch (preset) {
    case "today":
      return {
        startsOn,
        endsOn: addDays(startsOn, 1),
        recurrence: "none",
      };
    case "monthly":
      return { startsOn, endsOn: null, recurrence: "monthly" };
    case "annual":
      return { startsOn, endsOn: null, recurrence: "yearly" };
    case "custom":
      return { startsOn, endsOn, recurrence };
  }
}
