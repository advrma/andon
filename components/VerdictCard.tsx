"use client";

import { motion } from "framer-motion";
import { T } from "@/lib/config";
import type { EventRow } from "@/lib/db";
import { firedFacts } from "@/lib/labels";
import { QUESTION_IDS, type QuestionId } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ResumeForm } from "./ResumeForm";
import { Shape } from "./Shape";
import { FACT_LABEL, QUESTION_LABEL, VERDICT_WORD, WORDS, dollars, seconds } from "./words";

type Props = {
  event: EventRow | null;
  stopped: boolean;
  onResume: (note: string) => Promise<void>;
};

// Rework text uses the darker rework tone so it clears 4.5:1 on white and soft backgrounds.
const WORD_COLOR = { pass: "text-pass", rework: "text-rework-text", stop: "text-stop" };

function ScoreRow({ id, p }: { id: QuestionId; p: number }) {
  return (
    <li>
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-[17px] text-ink">{QUESTION_LABEL[id]}</span>
        <span className="text-[17px] font-semibold text-ink">{p.toFixed(2)}</span>
      </div>
      <div className="relative mt-2 flex h-2 overflow-hidden rounded-full" aria-hidden="true">
        <div className="bg-pass-soft" style={{ width: `${T.rework * 100}%` }} />
        <div className="bg-rework-soft" style={{ width: `${(T.stop - T.rework) * 100}%` }} />
        <div className="flex-1 bg-stop-soft" />
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-ink"
          initial={false}
          animate={{ width: `${Math.min(1, Math.max(0, p)) * 100}%` }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        />
      </div>
    </li>
  );
}

export function VerdictCard({ event, stopped, onResume }: Props) {
  const asked = event
    ? QUESTION_IDS.filter((id) => event.answers[id]).sort(
        (a, b) => event.answers[b]!.probability - event.answers[a]!.probability,
      )
    : [];
  const notAsked = QUESTION_IDS.length - asked.length;
  const facts = event ? firedFacts(event.facts) : [];

  return (
    <section
      aria-label="Verdict"
      className={`flex min-h-0 flex-col rounded-xl border bg-card transition-colors ${stopped ? "border-stop" : "border-rule"}`}
      style={{ boxShadow: "0 1px 2px rgba(22,24,29,.06)" }}
    >
      {event && (
        <ScrollArea className="min-h-0 flex-1">
          <div className="flex flex-col gap-7 px-6 py-6">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <Shape verdict={event.verdict} size={24} />
                <span className={`text-[32px] leading-none font-semibold ${WORD_COLOR[event.verdict]}`}>
                  {VERDICT_WORD[event.verdict]}
                </span>
              </div>
              <p className="text-[20px] leading-snug text-ink">
                {event.verdict === "pass" ? WORDS.pass : event.reason}
              </p>
              {stopped && <ResumeForm onResume={onResume} />}
            </div>

            <div>
              <h3 className="mb-3 text-[15px] text-graphite">{WORDS.fired}</h3>
              <ul className="flex flex-col gap-4">
                {asked.map((id) => (
                  <ScoreRow key={id} id={id} p={event.answers[id]!.probability} />
                ))}
              </ul>
              {notAsked > 0 && (
                <p className="mt-3 text-[15px] text-graphite">
                  {notAsked} {notAsked === 1 ? "question" : "questions"} not asked
                </p>
              )}
            </div>

            <div>
              <h3 className="mb-3 text-[15px] text-graphite">{WORDS.facts}</h3>
              {facts.length === 0 ? (
                <p className="text-[15px] text-graphite">{WORDS.noFacts}</p>
              ) : (
                <ul className="flex flex-wrap gap-2">
                  {facts.map((k) => (
                    <li key={k} className="rounded-full border border-rule px-3 py-1 text-[15px] text-ink">
                      {FACT_LABEL[k]}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-1 text-[15px] text-graphite">
              <span>Check time {seconds(event.latency_ms)}</span>
              <span>Cost {dollars(event.cost_usd, 4)}</span>
              {event.escalated && <span>{WORDS.escalated}</span>}
            </div>
          </div>
        </ScrollArea>
      )}
    </section>
  );
}
