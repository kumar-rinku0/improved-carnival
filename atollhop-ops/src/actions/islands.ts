"use server";

import { db } from "@/db/public-db";
import { islands } from "@/db/schema";
import { sql, eq, ilike } from "drizzle-orm";

export async function findIslandsByName(query: string) {
  const q = query.trim();
  if (!q) return [];

  try {
    const database = await db();

    const exact = await database
      .select({ id: islands.id, name: islands.name })
      .from(islands)

      .where(eq(sql`lower(${islands.name})`, q.toLowerCase()))
      .limit(1);

    if (exact.length) return exact;

    const fuzzy = await database
      .select({ id: islands.id, name: islands.name })
      .from(islands)

      .where(ilike(islands.name, `%${q}%`))
      .groupBy(islands.id, islands.name);

    return fuzzy;
  } catch (err) {
    console.error("[findIslandsByName] error:", err);
    return [];
  }
}
