"use client";

import type { QuestionId } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { QUESTION_LABEL, WORDS } from "./words";

export type ScorecardRow = { name: string; caught: number; falseAlarms: number; medianMs: number; costUsd: number };
export type ScorecardMiss = {
  id: string;
  kind: "missed" | "false alarm";
  question: QuestionId | null;
  score: number | null;
  note?: string | null;
};
export type ScorecardResults = {
  split: string;
  cases: number;
  cheats: number;
  honest: number;
  rows: ScorecardRow[];
  misses: ScorecardMiss[];
};

type Props = { results: ScorecardResults | null; onOpenCase: (id: string) => void };

function ms(n: number): string {
  if (n < 1) return "under 1 ms";
  return n >= 1000 ? `${(n / 1000).toFixed(1)} s` : `${Math.round(n)} ms`;
}

function cost(n: number): string {
  return n === 0 ? "$0" : `$${n.toFixed(4)}`;
}

function Headline({ n, label }: { n: number; label: string }) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="text-[48px] leading-none font-semibold text-ink">{n}</span>
      <span className="text-[17px] text-graphite">{label}</span>
    </div>
  );
}

const CELL = "px-5 py-3 text-right text-[17px]";

export function Scorecard({ results, onOpenCase }: Props) {
  if (!results) {
    return (
      <section className="rounded-xl border border-rule bg-card px-6 py-6">
        <p className="text-[17px] text-graphite">{WORDS.noResults}</p>
      </section>
    );
  }
  const andon = results.rows[0];
  const alarms = andon?.falseAlarms ?? 0;
  const splitNote =
    results.split === "test"
      ? `Held-out test split, ${results.cases} changes. Thresholds tuned on a separate dev split.`
      : `${results.split} split, ${results.cases} changes.`;

  return (
    <ScrollArea className="min-h-0 flex-1">
      <div className="flex flex-col gap-6">
        {andon && (
          <section className="flex items-center justify-between rounded-xl border border-rule bg-card px-6 py-6">
            <Headline n={andon.caught} label={`of ${results.cheats} cheats caught`} />
            <Headline n={alarms} label={`${alarms === 1 ? "false alarm" : "false alarms"} in ${results.honest} honest`} />
          </section>
        )}

        <section className="rounded-xl border border-rule bg-card">
          <table className="w-full">
            <thead>
              <tr className="text-[15px] text-graphite">
                <th className="px-5 py-3 text-left font-normal"></th>
                <th className={`${CELL} font-normal`}>Caught</th>
                <th className={`${CELL} font-normal`}>False alarms</th>
                <th className={`${CELL} font-normal`}>Median time</th>
                <th className={`${CELL} font-normal`}>Cost/check</th>
              </tr>
            </thead>
            <tbody>
              {results.rows.map((r, i) => (
                <tr key={r.name} className={`border-t border-rule ${i === 0 ? "font-semibold text-ink" : "text-graphite"}`}>
                  <td className="px-5 py-3 text-left text-[17px]">{r.name}</td>
                  <td className={CELL}>
                    {r.caught}/{results.cheats}
                  </td>
                  <td className={CELL}>
                    {r.falseAlarms}/{results.honest}
                  </td>
                  <td className={CELL}>{ms(r.medianMs)}</td>
                  <td className={CELL}>{cost(r.costUsd)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="rounded-xl border border-rule bg-card px-6 py-5">
          <h2 className="mb-3 text-[17px] font-semibold text-ink">Misses and false alarms</h2>
          {results.misses.length === 0 ? (
            <p className="text-[15px] text-graphite">None</p>
          ) : (
            <ul className="flex flex-col">
              {results.misses.map((m) => (
                <li key={m.id}>
                  <button
                    type="button"
                    onClick={() => onOpenCase(m.id)}
                    className="flex w-full items-baseline gap-5 rounded-lg px-2 py-2 text-left text-[17px] hover:bg-surface"
                  >
                    <span className="font-mono text-[15px] text-ink">{m.id}</span>
                    <span className={m.kind === "missed" ? "text-stop" : "text-rework-text"}>{m.kind}</span>
                    {m.question && <span className="text-graphite">“{QUESTION_LABEL[m.question]}”</span>}
                    {m.score !== null && <span className="font-semibold text-ink">{m.score.toFixed(2)}</span>}
                    {m.note && <span className="text-graphite">{m.note}</span>}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <p className="px-1 text-[15px] text-graphite">{splitNote}</p>
      </div>
    </ScrollArea>
  );
}
