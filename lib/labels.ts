import type { Facts } from "./facts";

// Board wording lives in components/words.ts. This file only names the facts that can fire.
export type FactKey = Exclude<keyof Facts, "counts">;

export const FACT_KEYS: FactKey[] = [
  "testFileChanged",
  "assertionRemoved",
  "assertionWeakened",
  "testSkipped",
  "suppressionAdded",
  "configTouched",
  "emptyCatch",
  "testWithNoAssert",
];

export function firedFacts(facts: Facts): FactKey[] {
  return FACT_KEYS.filter((k) => facts[k] === true);
}
