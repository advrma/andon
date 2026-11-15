import * as Sentry from "@sentry/nextjs";
import { ESCALATE } from "./config";
import { QUESTIONS, buildState, type JudgeState } from "./jev";
import type { QuestionId } from "./types";

export type Escalation = { yes: boolean; sentence: string; latencyMs: number; costUsd: number };

// Thrown on timeout or any API failure. The gate keeps `rework` / "Check could not run".
export class EscalateError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "EscalateError";
  }
}

const SYSTEM =
  "You review a code change against its task spec. Answer the question with YES or NO, " +
  "then one plain sentence a human can read. Format: `YES: <sentence>` or `NO: <sentence>`.";

const MOCK: Escalation = { yes: false, sentence: "Mock escalation: no problem found.", latencyMs: 0, costUsd: 0 };

type ChatResponse = {
  choices?: { message?: { content?: string | null }; finish_reason?: string | null }[];
  usage?: { cost?: number | null; completion_tokens?: number | null };
  error?: { message?: string };
};

// Accepts `YES: ...`, `**NO**: ...` and the like; the model sometimes wraps the word in markdown.
function parse(content: string): { yes: boolean; sentence: string } {
  const match = /^[\s*_`#]*(YES|NO)\b[*_`]*[:.\-\s]*([\s\S]*)$/i.exec(content);
  if (!match) throw new EscalateError(`Unparseable answer: ${content.slice(0, 80)}`);
  const sentence = (match[2] ?? "").trim().split("\n")[0]?.trim() || content.trim();
  return { yes: match[1]!.toUpperCase() === "YES", sentence };
}

function isMock(): boolean {
  const v = process.env.JEV_MOCK?.trim().toLowerCase();
  return v === "1" || v === "true";
}

// SPEC "Escalation": same question, spec and diff to a large model; yes -> stop, no -> pass.
export async function escalate(state: JudgeState, questionId: QuestionId): Promise<Escalation> {
  if (isMock()) return MOCK;
  const start = performance.now();
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  try {
    if (!apiKey) throw new EscalateError("No OPENROUTER_API_KEY set for escalation");
    const res = await fetch(ESCALATE.url, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: ESCALATE.model,
        max_tokens: ESCALATE.maxTokens,
        reasoning: { effort: ESCALATE.reasoningEffort },
        usage: { include: true },
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: `${buildState(state)}\n\n## Question\n${QUESTIONS[questionId]}` },
        ],
      }),
      signal: AbortSignal.timeout(ESCALATE.timeoutMs),
    });
    const data = (await res.json().catch(() => ({}))) as ChatResponse;
    if (!res.ok) throw new EscalateError(`OpenRouter returned ${res.status}: ${data.error?.message ?? "no detail"}`);
    const choice = data.choices?.[0];
    const content = choice?.message?.content;
    if (!content) {
      // Reasoning ate the whole budget: say so, instead of a bare "empty answer".
      const why = choice?.finish_reason === "length" ? `answer cut off at ${data.usage?.completion_tokens ?? "?"} tokens` : "empty answer";
      throw new EscalateError(`Escalation model gave no answer (${why})`);
    }
    return { ...parse(content), latencyMs: Math.round(performance.now() - start), costUsd: data.usage?.cost ?? 0 };
  } catch (err) {
    Sentry.captureException(err, { extra: { questionId, model: ESCALATE.model } });
    if (err instanceof EscalateError) throw err;
    throw new EscalateError("Escalation could not run", { cause: err });
  }
}
