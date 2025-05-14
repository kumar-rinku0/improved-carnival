"use server";

import { db } from "@/db/public-db";
import { islands } from "@/db/schema";

export async function getLocations() {
  try {
    const database = await db();

    const locationsData = await database
      .select({ name: islands.name })
      .from(islands)
      .groupBy(islands.name);

    return locationsData.map((item) => item.name);
  } catch (error) {
    console.error("[getLocations] Error:", error);
    return [];
  }
}
