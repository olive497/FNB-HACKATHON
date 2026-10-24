export function formatZAR(amount: number): string {
  const sign = amount < 0 ? "-" : "";
  const abs = Math.abs(amount);
  return `${sign}R${abs.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatZARShort(amount: number): string {
  const sign = amount < 0 ? "-" : "";
  const abs = Math.abs(amount);
  return `${sign}R${abs.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

export function parseAmount(value: string): number {
  const n = Number(value.replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : NaN;
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" });
}

export function uid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
