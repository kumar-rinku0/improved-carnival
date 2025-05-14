import { NextResponse } from "next/server";
import { getRoutes } from "@/actions/getRoutes";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      origin,
      destination,
      transportType,
      location,
      search,
      sort,
      page,
      pageSize,
    } = body;

    const routesResult = await getRoutes({
      origin,
      destination,
      transportType,
      location,
      search,
      sort,
      page,
      pageSize,
    });

    return NextResponse.json(routesResult);
  } catch (error) {
    console.error("Error in /api/routes:", error);
    return NextResponse.error();
  }
}
