/**
 * "Logical" calendar day for the app: rolls over at 4:00 AM local time.
 * Example: 2:00 AM Tuesday counts as Monday's log_date.
 */

const CUTOFF_HOUR = 4;

/** YYYY-MM-DD in local timezone, shifted so the day starts at 4 AM local. */
export function getLogicalDateString(date: Date = new Date()): string {
  const shifted = new Date(date);
  if (shifted.getHours() < CUTOFF_HOUR) {
    shifted.setDate(shifted.getDate() - 1);
  }
  const y = shifted.getFullYear();
  const m = String(shifted.getMonth() + 1).padStart(2, '0');
  const d = String(shifted.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Previous/next logical date string (local calendar arithmetic on the shifted day). */
export function addLogicalDays(dateStr: string, deltaDays: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d + deltaDays);
  const yy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const dd = String(dt.getDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

/** Last N logical dates ending at anchor (inclusive), oldest first. */
export function getLogicalDateRange(anchor: string, count: number): string[] {
  const out: string[] = [];
  for (let i = count - 1; i >= 0; i--) {
    out.push(addLogicalDays(anchor, -i));
  }
  return out;
}
