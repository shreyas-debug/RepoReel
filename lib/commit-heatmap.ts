import type {
  GitHubCommit,
  HeatmapCell,
  HeatmapWeekRow,
} from "@/lib/types";

const DAY_MS = 24 * 60 * 60 * 1000;

function utcDayStart(ms: number): Date {
  const d = new Date(ms);
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
  );
}

function utcDayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Monday = 0 … Sunday = 6 */
function mondayIndex(d: Date): number {
  return (d.getUTCDay() + 6) % 7;
}

function addUtcDays(d: Date, n: number): Date {
  return new Date(d.getTime() + n * DAY_MS);
}

function formatWeekLabel(monday: Date): string {
  return monday.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function formatMonthShort(monday: Date): string {
  return monday.toLocaleDateString("en-US", {
    month: "short",
    timeZone: "UTC",
  });
}

function formatTooltipDay(dateKey: string, count: number): string {
  const d = new Date(`${dateKey}T12:00:00.000Z`);
  const label = d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
  return `${label} — ${count} commit${count === 1 ? "" : "s"}`;
}

export { formatTooltipDay };

/**
 * GitHub-style contribution grid: rows are weeks (Mon→Sun), one cell per day
 * in the inclusive commit date span, with leading/trailing padding.
 */
export function buildCommitHeatmap(commits: GitHubCommit[]): HeatmapWeekRow[] {
  if (commits.length === 0) return [];

  const counts = new Map<string, number>();
  for (const c of commits) {
    const key = utcDayKey(new Date(c.committedDate));
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const times = commits.map((c) => new Date(c.committedDate).getTime());
  const minT = Math.min(...times);
  const maxT = Math.max(...times);
  const start = utcDayStart(minT);
  const end = utcDayStart(maxT);

  const dayCells: HeatmapCell[] = [];
  for (let t = start.getTime(); t <= end.getTime(); t += DAY_MS) {
    const key = utcDayKey(new Date(t));
    dayCells.push({ dateKey: key, count: counts.get(key) ?? 0 });
  }

  const padStart = mondayIndex(start);
  const padded: HeatmapCell[] = [];
  for (let i = 0; i < padStart; i++) {
    padded.push({ dateKey: null, count: 0 });
  }
  padded.push(...dayCells);
  const padEnd = (7 - (padded.length % 7)) % 7;
  for (let i = 0; i < padEnd; i++) {
    padded.push({ dateKey: null, count: 0 });
  }

  const rows: HeatmapWeekRow[] = [];
  let mondayOfRow = addUtcDays(start, -mondayIndex(start));
  let prevMonthKey: string | null = null;

  for (let i = 0; i < padded.length; i += 7) {
    const days = padded.slice(i, i + 7);
    const monthKey = `${mondayOfRow.getUTCFullYear()}-${mondayOfRow.getUTCMonth()}`;
    const monthLabel =
      monthKey !== prevMonthKey ? formatMonthShort(mondayOfRow) : null;
    prevMonthKey = monthKey;

    rows.push({
      weekLabel: formatWeekLabel(mondayOfRow),
      monthLabel,
      days,
    });
    mondayOfRow = addUtcDays(mondayOfRow, 7);
  }

  return rows;
}
