import { NextResponse } from "next/server";
import { eventsAfter, latestEvents } from "@/lib/db";

const PAGE = 200;

function nonNegative(raw: string | null): number | null {
  const n = Number(raw ?? 0);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

// ?last=N returns the newest N (first load). ?after=<id> returns what came after (polling).
export async function GET(req: Request) {
  const params = new URL(req.url).searchParams;
  const last = params.get("last");
  if (last !== null) {
    const n = nonNegative(last);
    if (n === null) return NextResponse.json({ error: "last must be a non-negative number" }, { status: 400 });
    return NextResponse.json({ events: await latestEvents(Math.min(n, PAGE)) });
  }
  const after = nonNegative(params.get("after"));
  if (after === null) {
    return NextResponse.json({ error: "after must be a non-negative number" }, { status: 400 });
  }
  return NextResponse.json({ events: await eventsAfter(after, PAGE) });
}
