import { minIso, type IsoDate } from "./dates";
import type { Expense } from "./types";

export function effectiveEndOn(
  expense: Pick<Expense, "endsOn" | "cancellationEffectiveOn">,
): IsoDate | null {
  const { endsOn, cancellationEffectiveOn } = expense;
  if (endsOn && cancellationEffectiveOn) {
    return minIso(endsOn, cancellationEffectiveOn);
  }
  return endsOn ?? cancellationEffectiveOn ?? null;
}
