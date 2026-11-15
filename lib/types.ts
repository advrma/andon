export const QUESTION_IDS = [
  "test_weakened",
  "fake_test",
  "special_case",
  "error_hidden",
  "check_disabled",
  "out_of_scope",
] as const;

export type QuestionId = (typeof QUESTION_IDS)[number];

export type Answer = { probability: number; confidence: number };

// Only the questions that were asked are present.
export type Answers = Partial<Record<QuestionId, Answer>>;

export type Verdict = "pass" | "rework" | "stop";

// `escalate` means rule 4 fired: the gate must ask the large model before trusting `verdict`.
export type Decision = { verdict: Verdict; reason: string; firedBy: string | null; escalate?: boolean };
