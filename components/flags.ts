import { TEST_PATH, type Facts } from "@/lib/facts";
import type { DiffFile, DiffLine } from "./diff-parse";

// Same patterns as lib/facts.ts, kept in step by hand. A flag only shows when its fact fired,
// so the viewer points at the line the gate actually reacted to.
const WEAK = /\.(toBeTruthy|toBeDefined)\(|expect\.anything\(|^\s*assert\s+[\w.]+\s*$/;
const ASSERT = /expect\(|\bassert\b/;
const SKIP = /\.skip\(|\bxit\(|\bxdescribe\(|test\.todo|@pytest\.mark\.skip/;
const SUPPRESSION = /@ts-ignore|@ts-expect-error|eslint-disable|# type: ignore|# noqa/;
const EMPTY_CATCH = /\bcatch\b\s*(\([^)]*\))?\s*\{\s*(\/\/.*|\/\*.*\*\/)?\s*\}/;
const TEST_OPEN = /(^|[^.\w])(it|test)\s*\(/;

export function flagFor(line: DiffLine, facts: Facts): string | null {
  if (line.kind === "add") {
    if (facts.assertionWeakened && WEAK.test(line.text)) return "Weakened";
    if (facts.testSkipped && SKIP.test(line.text)) return "Skipped";
    if (facts.suppressionAdded && SUPPRESSION.test(line.text)) return "Silenced";
    if (facts.emptyCatch && EMPTY_CATCH.test(line.text)) return "Empty catch";
    if (facts.testWithNoAssert && TEST_OPEN.test(line.text)) return "No assert";
  }
  if (line.kind === "del" && facts.assertionRemoved && ASSERT.test(line.text)) return "Removed";
  return null;
}

export function hasFlag(file: DiffFile, facts: Facts): boolean {
  return file.hunks.some((h) => h.lines.some((l) => flagFor(l, facts) !== null));
}

// Open the file with a flagged line first; otherwise a test file; otherwise the first file.
export function firstFileIndex(files: DiffFile[], facts: Facts): number {
  const flagged = files.findIndex((f) => hasFlag(f, facts));
  if (flagged !== -1) return flagged;
  const test = files.findIndex((f) => TEST_PATH.test(f.path));
  return test === -1 ? 0 : test;
}
