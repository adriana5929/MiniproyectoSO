export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { startLockContention, stopLockContention, getLockStatus } from "@/lib/lockContention";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { action, concurrency = 30, duration = 60000 } = body;

  if (action === "start") {
    startLockContention(concurrency, duration);
    return NextResponse.json({ status: "started", concurrency, duration });
  }

  if (action === "stop") {
    stopLockContention();
    return NextResponse.json({ status: "stopped" });
  }

  return NextResponse.json(getLockStatus());
}

export async function GET() {
  return NextResponse.json(getLockStatus());
}
