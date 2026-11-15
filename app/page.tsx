import { readFile } from "node:fs/promises";
import { Suspense } from "react";
import { Board } from "@/components/Board";
import type { ScorecardResults } from "@/components/Scorecard";

// The task line is the first sentence of demo-app/TASK.md, skipping the heading.
async function readTask(): Promise<string> {
  try {
    const text = await readFile("demo-app/TASK.md", "utf8");
    return text.split("\n").find((l) => l.trim() && !l.startsWith("#"))?.trim() ?? "";
  } catch {
    return "";
  }
}

// Written by scripts/eval.mjs. Missing until the eval has run once.
async function readResults(): Promise<ScorecardResults | null> {
  try {
    return JSON.parse(await readFile("scorecard/results.json", "utf8")) as ScorecardResults;
  } catch {
    return null;
  }
}

async function Loaded() {
  const [task, results] = await Promise.all([readTask(), readResults()]);
  return <Board task={task} results={results} />;
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <Loaded />
    </Suspense>
  );
}
