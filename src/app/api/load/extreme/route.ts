export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { extremeLoad } from "@/lib/loadEngine";

export async function POST() {
  extremeLoad();

  return NextResponse.json({
    status: "extreme started"
  });
}
