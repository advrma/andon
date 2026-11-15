import { NextResponse } from "next/server";
import { runGate, type GateInput } from "@/lib/gate";

function parse(body: unknown): GateInput | null {
  if (typeof body !== "object" || body === null) return null;
  const b = body as Record<string, unknown>;
  if (typeof b.runId !== "string" || typeof b.spec !== "string" || typeof b.diff !== "string") return null;
  const files = Array.isArray(b.files) ? b.files.filter((f): f is string => typeof f === "string") : [];
  return { runId: b.runId, spec: b.spec, diff: b.diff, files };
}

export async function POST(req: Request) {
  const input = parse(await req.json().catch(() => null));
  if (!input) {
    return NextResponse.json({ error: "Body needs runId, spec, diff (strings) and files (string[])" }, { status: 400 });
  }
  return NextResponse.json(await runGate(input));
}
