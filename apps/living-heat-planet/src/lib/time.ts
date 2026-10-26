/** Formats a unix time (seconds) in a place's own IANA time zone, so daylight saving is handled by Intl. */
export function formatLocal(unix: number | null | undefined, timeZone: string | null | undefined, opts: Intl.DateTimeFormatOptions = { weekday: "short", hour: "2-digit", minute: "2-digit" }): string {
  if (unix == null) return "—";
  try { return new Intl.DateTimeFormat("en-GB", { ...opts, timeZone: timeZone || "UTC" }).format(new Date(unix * 1000)); }
  catch { return new Intl.DateTimeFormat("en-GB", { ...opts, timeZone: "UTC" }).format(new Date(unix * 1000)) + " UTC"; }
}
export function timeAgo(iso: string | null | undefined, now = Date.now()): string {
  if (!iso) return "unknown";
  const m = Math.round((now - Date.parse(iso)) / 60000);
  if (m < 1) return "just now"; if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60); return h < 48 ? `${h} h ago` : `${Math.round(h / 24)} days ago`;
}
/** Local hour 0–23 of a unix time in a zone. */
export function localHour(unix: number, timeZone: string | null | undefined): number {
  const s = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", hourCycle: "h23", timeZone: timeZone || "UTC" }).format(new Date(unix * 1000));
  return Number(s) % 24;
}
