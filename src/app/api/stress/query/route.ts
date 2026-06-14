export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { startQueryFlood, stopQueryFlood, getQueryFloodStatus } from "@/lib/queryFlood";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { action, concurrency = 20, duration = 60000 } = body;

  if (action === "start") {
    startQueryFlood(concurrency, duration);
    return NextResponse.json({ status: "started", concurrency, duration });
  }

  if (action === "stop") {
    stopQueryFlood();
    return NextResponse.json({ status: "stopped" });
  }

  return NextResponse.json(getQueryFloodStatus());
}

export async function GET() {
  return NextResponse.json(getQueryFloodStatus());
}
