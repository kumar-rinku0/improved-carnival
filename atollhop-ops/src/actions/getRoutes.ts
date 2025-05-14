/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { db } from "@/db/public-db";
import { eq, and, or, asc, desc, like, count } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { routes, islands, transport_types } from "@/db/schema";

export type RouteData = {
  id: number;
  originName: string;
  destinationName: string;
  transportType: string;
  duration: number;
};

export async function getRoutes({
  transportType,
  location,
  sort,
  search,
  page = 1,
  pageSize = 10,
  origin,
  destination,
}: {
  transportType?: string;
  location?: string;
  sort?: "newest" | "oldest" | "longest" | "shortest";
  search?: string;
  page?: number;
  pageSize?: number;
  origin?: string;
  destination?: string;
} = {}): Promise<{ data: RouteData[]; total: number }> {
  try {
    const database = await db();

    const originIsland = alias(islands, "originIsland");
    const destinationIsland = alias(islands, "destinationIsland");

    const conditions = [];

    if (transportType) {
      const transportTypeRecord = await database
        .select({ id: transport_types.id })
        .from(transport_types)
        .where(eq(transport_types.type, transportType));

      if (transportTypeRecord.length > 0) {
        const transportTypeId = transportTypeRecord[0].id;
        conditions.push(eq(routes.transport_type_id, transportTypeId));
      } else {
        console.warn(
          `[getRoutes] Provided transportType "${transportType}" is not valid. Ignoring filter.`
        );
      }
    }

    if (location) {
      conditions.push(
        or(
          eq(originIsland.name, location),
          eq(destinationIsland.name, location)
        )
      );
    }

    if (search) {
      conditions.push(
        or(
          like(originIsland.name, `%${search}%`),
          like(destinationIsland.name, `%${search}%`)
        )
      );
    }

    if (origin) {
      conditions.push(eq(originIsland.name, origin));
    }

    if (destination) {
      conditions.push(eq(destinationIsland.name, destination));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    let query = database
      .select({
        id: routes.id,
        originName: originIsland.name,
        destinationName: destinationIsland.name,
        transportType: transport_types.type,
        duration: routes.duration_minutes,
      })
      .from(routes)
      .innerJoin(originIsland, eq(routes.origin_id, originIsland.id))
      .innerJoin(
        destinationIsland,
        eq(routes.destination_id, destinationIsland.id)
      )
      .innerJoin(
        transport_types,
        eq(routes.transport_type_id, transport_types.id)
      )
      .where(whereClause);

    switch (sort) {
      case "newest":
        query = (query as any).orderBy(desc(routes.created_at));
        break;
      case "oldest":
        query = (query as any).orderBy(asc(routes.created_at));
        break;
      case "longest":
        query = (query as any).orderBy(desc(routes.duration_minutes));
        break;
      case "shortest":
        query = (query as any).orderBy(asc(routes.duration_minutes));
        break;
      default:
        break;
    }

    const countResultArr = await database
      .select({ count: count() })
      .from(routes)
      .innerJoin(originIsland, eq(routes.origin_id, originIsland.id))
      .innerJoin(
        destinationIsland,
        eq(routes.destination_id, destinationIsland.id)
      )
      .innerJoin(
        transport_types,
        eq(routes.transport_type_id, transport_types.id)
      )
      .where(whereClause);

    const total = Number(countResultArr[0].count);

    const offset = (page - 1) * pageSize;
    query = (query as any).limit(pageSize).offset(offset);

    const routesData = await query;
    return { data: routesData, total };
  } catch (error) {
    console.error("[getRoutes] Error during query execution:", error);
    return { data: [], total: 0 };
  }
}
