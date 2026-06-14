export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { stopLoad } from "@/lib/loadEngine";

export async function POST() {
  stopLoad();

  return NextResponse.json({
    status: "stopped"
  });
}
