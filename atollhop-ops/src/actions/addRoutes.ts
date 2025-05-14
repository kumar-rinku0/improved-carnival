"use server";

import { db } from "@/db/public-db";
import { eq } from "drizzle-orm";
import { routes, islands, transport_types } from "@/db/schema";

export type NewRouteInput = {
  transportType: string;
  origin: string;
  destination: string;
  duration: number;
};

export async function addRoute(newRoute: NewRouteInput): Promise<void> {
  try {
    const database = await db();

    const originIslandArray = await database
      .select()
      .from(islands)
      .where(eq(islands.name, newRoute.origin));
    const originIsland = originIslandArray[0];
    if (!originIsland) {
      throw new Error(`Origin island '${newRoute.origin}' not found`);
    }

    const destinationIslandArray = await database
      .select()
      .from(islands)
      .where(eq(islands.name, newRoute.destination));
    const destinationIsland = destinationIslandArray[0];
    if (!destinationIsland) {
      throw new Error(`Destination island '${newRoute.destination}' not found`);
    }

    const transportTypeArray = await database
      .select()
      .from(transport_types)
      .where(eq(transport_types.type, newRoute.transportType));
    const transportTypeEntry = transportTypeArray[0];
    if (!transportTypeEntry) {
      throw new Error(`Transport type '${newRoute.transportType}' not found`);
    }

    const insertedRoutes = await database
      .insert(routes)
      .values({
        operator_id: 10,
        origin_id: originIsland.id,
        destination_id: destinationIsland.id,
        transport_type_id: transportTypeEntry.id,
        duration_minutes: newRoute.duration,
      })
      .returning();

    console.log("Inserted route:", insertedRoutes);
  } catch (error) {
    console.error("[addRoute] Error:", error);
    throw error;
  }
}
