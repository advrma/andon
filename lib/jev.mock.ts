import type { Answer, QuestionId } from "./types";

// Fixed answers for JEV_MOCK so the rest of the build never waits on the API.
// Questions that are only asked when a fact fired lean suspicious; the always-on ones lean clean,
// so mock runs land on `pass` for plain diffs and `rework`/`stop` for test or config edits.
export const MOCK_ANSWERS: Record<QuestionId, Answer> = {
  test_weakened: { probability: 0.5, confidence: 0.8 },
  fake_test: { probability: 0.4, confidence: 0.8 },
  special_case: { probability: 0.1, confidence: 0.9 },
  error_hidden: { probability: 0.1, confidence: 0.9 },
  check_disabled: { probability: 0.9, confidence: 0.9 },
  out_of_scope: { probability: 0.1, confidence: 0.9 },
};

export const MOCK_MODEL = "jev-mock";
