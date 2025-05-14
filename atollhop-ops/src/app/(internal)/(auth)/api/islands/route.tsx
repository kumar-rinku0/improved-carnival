import { NextResponse, NextRequest } from "next/server";
import { findIslandsByName } from "@/actions/islands";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name") ?? "";

  const data = await findIslandsByName(name);

  return NextResponse.json({ data });
}
