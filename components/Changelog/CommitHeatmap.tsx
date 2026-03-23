"use client";

import { motion } from "framer-motion";
import { formatTooltipDay } from "@/lib/commit-heatmap";
import type { HeatmapCell, HeatmapWeekRow } from "@/lib/types";

const DAY_ROW_LABEL = ["Mon", "", "Wed", "", "Fri", "", ""] as const;
const GAP = 3;
const CELL_H = 14;
const LABEL_W = 28;

function cellColor(count: number, isPadding: boolean): string {
  if (isPadding || count === 0) return "bg-[#1e2433] border border-white/5";
  if (count <= 2) return "bg-indigo-950";
  if (count <= 5) return "bg-indigo-700";
  if (count <= 10) return "bg-indigo-500";
  return "bg-indigo-300";
}

function Cell({
  cell,
  dayIndex,
  weekIndex,
}: {
  cell: HeatmapCell;
  dayIndex: number;
  weekIndex: number;
}) {
  const isPadding = cell.dateKey === null;
  const tooltip =
    !isPadding && cell.dateKey
      ? formatTooltipDay(cell.dateKey, cell.count)
      : undefined;

  return (
    <motion.div
      title={tooltip}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.1,
        delay: weekIndex * 0.008 + dayIndex * 0.004,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={`w-full rounded-[3px] ${cellColor(cell.count, isPadding)}`}
      style={{ height: CELL_H }}
    />
  );
}

export function CommitHeatmap({
  commitHeatmap,
}: {
  commitHeatmap: HeatmapWeekRow[];
}) {
  if (!commitHeatmap.length) return null;

  const totalCommits = commitHeatmap.reduce(
    (n, w) => n + w.days.reduce((s, d) => s + (d.dateKey ? d.count : 0), 0),
    0,
  );

  return (
    <section className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4">
      {/* Header */}
      <div className="mb-3 flex w-full items-center justify-between">
        <p className="text-xs text-slate-400">
          <span className="font-semibold tabular-nums text-white">
            {totalCommits}
          </span>{" "}
          commits in this range
        </p>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          Commit Activity
        </p>
      </div>

      {/* Month labels — offset by label column width */}
      <div
        className="flex w-full"
        style={{ paddingLeft: LABEL_W + GAP, gap: GAP, marginBottom: GAP }}
      >
        {commitHeatmap.map((week, wi) => (
          <div
            key={`m-${wi}`}
            className="min-w-0 flex-1 overflow-hidden truncate text-center text-[8px] leading-none text-slate-600"
          >
            {week.monthLabel ?? ""}
          </div>
        ))}
      </div>

      {/* Rows: one per weekday */}
      <div className="flex w-full flex-col" style={{ gap: GAP }}>
        {DAY_ROW_LABEL.map((label, dayIndex) => (
          <div
            key={`row-${dayIndex}`}
            className="flex w-full items-center"
            style={{ gap: GAP }}
          >
            {/* Fixed-width day label */}
            <div
              className="shrink-0 pr-1 text-right text-[10px] leading-none text-slate-600"
              style={{ width: LABEL_W, height: CELL_H, lineHeight: `${CELL_H}px` }}
            >
              {label}
            </div>

            {/* Cells — each is flex-1 so they share ALL remaining width equally */}
            {commitHeatmap.map((week, weekIndex) => (
              <div key={`col-${weekIndex}`} className="min-w-0 flex-1">
                <Cell
                  cell={week.days[dayIndex]!}
                  dayIndex={dayIndex}
                  weekIndex={weekIndex}
                />
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center justify-end gap-1.5 border-t border-white/5 pt-2 text-[9px] text-slate-600">
        <span>Less</span>
        <div className="flex items-center gap-[2px]">
          {[
            "bg-[#1e2433] border border-white/5",
            "bg-indigo-950",
            "bg-indigo-700",
            "bg-indigo-500",
            "bg-indigo-300",
          ].map((cls, i) => (
            <span
              key={i}
              className={`block h-[10px] w-[10px] rounded-[2px] ${cls}`}
              aria-hidden
            />
          ))}
        </div>
        <span>More</span>
      </div>
    </section>
  );
}