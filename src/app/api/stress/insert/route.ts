export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { startInsertFlood, stopInsertFlood, getInsertFloodStatus } from "@/lib/insertFlood";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { action, batchSize = 500, duration = 60000 } = body;

  if (action === "start") {
    startInsertFlood(batchSize, duration);
    return NextResponse.json({ status: "started", batchSize, duration });
  }

  if (action === "stop") {
    stopInsertFlood();
    return NextResponse.json({ status: "stopped" });
  }

  return NextResponse.json(getInsertFloodStatus());
}

export async function GET() {
  return NextResponse.json(getInsertFloodStatus());
}
