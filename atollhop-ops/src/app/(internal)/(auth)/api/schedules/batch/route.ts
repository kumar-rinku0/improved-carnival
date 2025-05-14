import { NextRequest, NextResponse } from "next/server";
import { insertSchedulesTx, RawSchedule } from "@/lib/schedules/insertMany";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as RawSchedule[];

    if (!Array.isArray(body) || body.length === 0) {
      return NextResponse.json(
        { error: "Body must be a non-empty array of schedules" },
        { status: 422 }
      );
    }

    const result = await insertSchedulesTx(body);
    return NextResponse.json({ status: "ok", ...result });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
