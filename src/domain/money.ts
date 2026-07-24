export function formatEur(amountMinor: number): string {
  const sign = amountMinor < 0 ? "-" : "";
  const abs = Math.abs(amountMinor);
  const whole = Math.floor(abs / 100);
  const cents = String(abs % 100).padStart(2, "0");
  const withDots = String(whole).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${sign}${withDots},${cents} €`;
}

export function parseEurInput(raw: string): number | null {
  const cleaned = raw.trim().replace(/\s/g, "").replace("€", "").replace(",", ".");
  if (!cleaned) return null;
  const n = Number(cleaned);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100);
}
