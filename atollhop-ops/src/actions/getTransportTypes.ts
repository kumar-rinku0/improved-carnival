"use server";

import { db } from "@/db/public-db";
import { transport_types } from "@/db/schema";

export async function getTransportTypes() {
  try {
    const database = await db();

    const typesData = await database.select().from(transport_types);

    return typesData.map((item) => item.type);
  } catch (error) {
    console.error("[getTransportTypes] Error:", error);

    return [];
  }
}
