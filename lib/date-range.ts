// Shared so a filter chip and a weekly bucket render a day range the same way.

function parseDay(day: string) {
  // Local midnight, not UTC: a bare `new Date("2026-09-01")` shifts a day east.
  return new Date(`${day}T00:00:00`);
}

export function formatDay(day: string) {
  return parseDay(day).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// Repeated parts drop from the left date: "1 – 30 Sep 2026", not both spelled out.
export function formatDayRange(from: string, to: string) {
  if (!from && !to) return "";
  if (!from) return `until ${formatDay(to)}`;
  if (!to) return `from ${formatDay(from)}`;

  const start = parseDay(from);
  const end = parseDay(to);
  const sameYear = start.getFullYear() === end.getFullYear();
  const sameMonth = sameYear && start.getMonth() === end.getMonth();
  const startText = start.toLocaleDateString(
    "en-GB",
    sameMonth ? { day: "numeric" } : { day: "numeric", month: "short" }
  );
  return `${startText} – ${formatDay(to)}`;
}
