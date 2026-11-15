import { NextResponse } from "next/server";
import { eventDiff } from "@/lib/db";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const id = Number((await ctx.params).id);
  if (!Number.isInteger(id) || id < 0) {
    return NextResponse.json({ error: "id must be a non-negative integer" }, { status: 400 });
  }
  const diff = await eventDiff(id);
  if (diff === null) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ diff });
}
