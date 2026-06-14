export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { startHttpFlood, stopHttpFlood, getHttpFloodStatus } from "@/lib/httpFlood";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { action, concurrency = 50, duration = 60000 } = body;

  if (action === "start") {
    startHttpFlood(concurrency, duration); // no await - corre en background
    return NextResponse.json({ status: "started", concurrency, duration });
  }

  if (action === "stop") {
    stopHttpFlood();
    return NextResponse.json({ status: "stopped" });
  }

  return NextResponse.json(getHttpFloodStatus());
}

export async function GET() {
  return NextResponse.json(getHttpFloodStatus());
}
