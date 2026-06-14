export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { startLoad } from "@/lib/loadEngine";

export async function POST() {
  startLoad();

  return NextResponse.json({
    status: "running"
  });
}
