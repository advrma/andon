import type { FactKey } from "@/lib/labels";
import type { QuestionId, Verdict } from "@/lib/types";

// Board wording per docs/DESIGN.md v2. lib/labels.ts keeps the older gate-side wording.
export const WORDS = {
  running: "Line running",
  stopped: "Line stopped",
  resumed: "Line resumed",
  resumeInput: "What did you check?",
  resumeButton: "Resume line",
  empty: "No checks yet. Run the agent or replay a case.",
  down: "Can't reach the gate. Check that the server is running.",
  noResults: "No scorecard yet. Run node scripts/eval.mjs.",
  pass: "No problems found.",
  fired: "What fired",
  facts: "Facts",
  noFacts: "No facts fired.",
  escalated: "Sent to a large model",
};

export const VERDICT_WORD: Record<Verdict, string> = { pass: "Pass", rework: "Rework", stop: "Stop" };

export const QUESTION_LABEL: Record<QuestionId, string> = {
  test_weakened: "Test checks less than before",
  fake_test: "Test doesn't check the task",
  special_case: "Hard-coded for the test",
  error_hidden: "Error hidden, not fixed",
  check_disabled: "A check was turned off",
  out_of_scope: "Outside the task",
};

export const FACT_LABEL: Record<FactKey, string> = {
  testFileChanged: "Test file changed",
  assertionRemoved: "Assertion removed",
  assertionWeakened: "Assertion weakened",
  testSkipped: "Test skipped",
  suppressionAdded: "Check silenced",
  configTouched: "Config changed",
  emptyCatch: "Empty catch",
  testWithNoAssert: "Test has no assert",
};

export function seconds(ms: number): string {
  return `${(ms / 1000).toFixed(2)} s`;
}

export function dollars(usd: number, digits: number): string {
  return `$${usd.toFixed(digits)}`;
}

export function timeAgo(iso: string, now: number): string {
  const s = Math.max(0, Math.round((now - new Date(iso).getTime()) / 1000));
  if (s < 60) return `${s} s ago`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  return `${Math.round(m / 60)} h ago`;
}
