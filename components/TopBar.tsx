"use client";

import { motion } from "framer-motion";
import type { Stats } from "@/lib/db";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WORDS, dollars, seconds } from "./words";

export type View = "live" | "scorecard";
export type Pill = "running" | "stopped" | "resumed";

type Props = {
  task: string;
  view: View;
  onView: (v: View) => void;
  pill: Pill;
  stats: Stats | null;
};

function StatusPill({ pill }: { pill: Pill }) {
  const stopped = pill === "stopped";
  return (
    <div
      role="status"
      aria-live="polite"
      className={`inline-flex h-10 items-center gap-2.5 rounded-lg border px-3.5 text-[15px] font-medium ${
        stopped ? "border-stop-soft bg-stop-soft text-stop" : "border-rule bg-card text-ink"
      }`}
    >
      <span
        aria-hidden="true"
        className={`size-2 ${stopped ? "rounded-[1px] bg-stop" : "pulse-dot rounded-full bg-pass"}`}
      />
      {WORDS[pill]}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-[15px] text-graphite">{label}</span>
      <span className="text-[20px] font-semibold text-ink">{value}</span>
    </div>
  );
}

export function TopBar({ task, view, onView, pill, stats }: Props) {
  const stopped = pill === "stopped";
  return (
    <header className="flex flex-col gap-4">
      {/* The one bold moment starts here: a stop bar grows across the top of the page. */}
      <motion.div
        aria-hidden="true"
        className="fixed inset-x-0 top-0 z-50 h-1 origin-left bg-stop"
        initial={false}
        animate={{ scaleX: stopped ? 1 : 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      />
      <div className="flex items-center justify-between gap-6">
        <div className="flex min-w-0 items-center gap-3">
          <span aria-hidden="true" className="size-5 shrink-0 rounded-[4px] bg-ink" />
          <h1 className="text-[20px] font-semibold text-ink">Andon</h1>
          {task && (
            <p className="ml-3 truncate text-[17px] text-graphite">
              <span>Task: </span>
              {task}
            </p>
          )}
        </div>
        <Tabs value={view} onValueChange={(v) => onView(v as View)}>
          <TabsList aria-label="View">
            <TabsTrigger value="live">Live</TabsTrigger>
            <TabsTrigger value="scorecard">Scorecard</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <div className="flex items-center gap-8">
        <StatusPill pill={pill} />
        {stats && (
          <>
            <Stat label="Checks" value={String(stats.checks)} />
            <Stat label="Caught" value={String(stats.rework + stats.stop)} />
            <Stat label="Median time" value={seconds(stats.medianLatencyMs)} />
            <Stat label="Cost" value={dollars(stats.totalCostUsd, 2)} />
          </>
        )}
      </div>
    </header>
  );
}
