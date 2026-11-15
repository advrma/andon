import { NextResponse } from "next/server";
import { getLine } from "@/lib/db";

export async function GET() {
  return NextResponse.json(await getLine());
}
