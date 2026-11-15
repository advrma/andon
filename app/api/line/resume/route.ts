import { NextResponse } from "next/server";
import { getLine, resumeLine } from "@/lib/db";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { note?: unknown };
  const note = typeof body.note === "string" ? body.note.trim() : "";
  await resumeLine(note);
  return NextResponse.json(await getLine());
}
