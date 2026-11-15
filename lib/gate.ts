import { getLine, insertEvent, stopLine } from "./db";
import { EscalateError, escalate } from "./escalate";
import { extractFacts } from "./facts";
import { JevError, judge, questionsFor, type JudgeState } from "./jev";
import { decide } from "./rules";
import type { Answers, Decision, QuestionId } from "./types";

export type GateInput = { runId: string; spec: string; diff: string; files: string[] };

export type GateResult = Decision & { eventId: number | null };

const LINE_STOPPED_REASON = "The line is stopped. A human must resume it.";
const CHECK_FAILED_REASON = "Check could not run";

type Escalated = { decision: Decision; latencyMs: number; costUsd: number };

// Rule 4 fired: the large model's yes/no replaces the verdict. On failure keep the safe `rework`.
async function runEscalation(state: JudgeState, decision: Decision): Promise<Escalated> {
  const questionId = decision.firedBy as QuestionId;
  try {
    const e = await escalate(state, questionId);
    const verdict = e.yes ? "stop" : "pass";
    return { decision: { verdict, reason: e.sentence, firedBy: questionId }, latencyMs: e.latencyMs, costUsd: e.costUsd };
  } catch (err) {
    if (!(err instanceof EscalateError)) throw err;
    // Already reported to Sentry inside escalate().
    return { decision: { verdict: "rework", reason: CHECK_FAILED_REASON, firedBy: questionId }, latencyMs: 0, costUsd: 0 };
  }
}

export async function runGate(input: GateInput): Promise<GateResult> {
  const line = await getLine();
  if (line.stopped) {
    return { verdict: "stop", reason: line.reason ?? LINE_STOPPED_REASON, firedBy: "line", eventId: line.event_id };
  }

  const facts = extractFacts(input.diff);
  const state = { spec: input.spec, facts, diff: input.diff };

  let answers: Answers = {};
  let latencyMs = 0;
  let costUsd = 0;
  let decision: Decision;
  let escalated = false;
  try {
    const judgment = await judge(state, questionsFor(facts));
    ({ answers, latencyMs, costUsd } = judgment);
    decision = decide(facts, answers);
    if (decision.escalate) {
      escalated = true;
      const e = await runEscalation(state, decision);
      decision = e.decision;
      latencyMs += e.latencyMs;
      costUsd += e.costUsd;
    }
  } catch (err) {
    if (!(err instanceof JevError)) throw err;
    // Already reported to Sentry inside judge(); here it only becomes a verdict.
    decision = { verdict: "rework", reason: CHECK_FAILED_REASON, firedBy: "jev_error" };
  }

  const eventId = await insertEvent({
    runId: input.runId,
    files: input.files,
    diff: input.diff,
    facts,
    answers,
    verdict: decision.verdict,
    reason: decision.reason,
    firedBy: decision.firedBy,
    escalated,
    latencyMs,
    costUsd,
  });
  if (decision.verdict === "stop") await stopLine(decision.reason, eventId);

  return { ...decision, eventId };
}
