/** Date helpers. All dates are local-time 'YYYY-MM-DD' strings. */

export function toKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayKey(): string {
  return toKey(new Date());
}

export function fromKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(key: string, n: number): string {
  const d = fromKey(key);
  d.setDate(d.getDate() + n);
  return toKey(d);
}

/** Monday of the week containing `key`. */
export function weekStart(key: string): string {
  const d = fromKey(key);
  const dow = (d.getDay() + 6) % 7; // Mon=0
  d.setDate(d.getDate() - dow);
  return toKey(d);
}

export function monthStart(key: string): string {
  return key.slice(0, 8) + "01";
}

export function daysBetween(a: string, b: string): number {
  return Math.round((fromKey(b).getTime() - fromKey(a).getTime()) / 86400000);
}

export function rangeKeys(from: string, to: string): string[] {
  const out: string[] = [];
  let k = from;
  while (k <= to) {
    out.push(k);
    k = addDays(k, 1);
  }
  return out;
}

export function formatShort(key: string): string {
  return fromKey(key).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatLong(key: string): string {
  return fromKey(key).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}
