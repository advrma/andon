// Scores at or above `stop` stop the line; between `rework` and `stop` ask for rework.
// A low-confidence score inside the `unsure` band goes to a large model instead (rule 4).
export const T = { rework: 0.35, stop: 0.75, minConfidence: 0.6, unsure: { low: 0.25, high: 0.75 } };

// Escalation model, reached through OpenRouter with the same key as Jev. The only large-model call.
// Opus 5.5 always reasons on this endpoint and reasoning counts against maxTokens, so the budget
// must leave room for the one-line answer; at 200 the answer was cut off every time.
export const ESCALATE = {
  url: "https://openrouter.ai/api/v1/chat/completions",
  model: "anthropic/claude-opus-5-5",
  timeoutMs: 30_000,
  maxTokens: 1000,
  reasoningEffort: "minimal",
};

// Board: how often it polls and how many lamp tiles stay on the line.
export const BOARD = { pollMs: 1000, keepTiles: 30 };

// Decision model. Price is from docs.typesafe.ai/models: $0.042 per million input tokens, output free.
// maxDiffChars keeps the state well under the 32k-token per-question limit and keeps calls fast.
export const JEV = {
  timeoutMs: 3000,
  model: "jev-latest",
  openRouterModel: "typesafe/jev-1.13",
  openRouterUrl: "https://openrouter.ai/api/alpha/decisions",
  usdPerInputToken: 0.042 / 1_000_000,
  charsPerToken: 4,
  maxDiffChars: 60_000,
};
