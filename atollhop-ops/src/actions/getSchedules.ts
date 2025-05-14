/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { db } from "@/db/public-db";
import { eq, and, or, asc, desc, like, gte, lte, count } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { schedules, routes, islands, transport_types } from "@/db/schema";

export type ScheduleData = {
  id: number;
  routeId: number;
  originName: string;
  destinationName: string;
  transportType: string;
  departureTime: string;
  arrivalTime: string;
  scheduleDays: string[];
  routeCode?: string;
  startDate: Date;
  endDate: Date;
  maxCapacity?: number;
  stopDetails: any;
};

export async function getSchedules({
  routeId,
  startDate,
  endDate,
  transportType,
  location,
  search,
  sort,
  page = 1,
  pageSize = 10,
}: {
  routeId?: number;
  startDate?: string;
  endDate?: string;
  transportType?: string;
  location?: string;
  search?: string;
  sort?: "newest" | "oldest" | "start" | "end";
  page?: number;
  pageSize?: number;
} = {}): Promise<{ data: ScheduleData[]; total: number }> {
  try {
    const database = await db();

    const originIsland = alias(islands, "originIsland");
    const destinationIsland = alias(islands, "destinationIsland");

    const conditions: any[] = [];

    if (routeId !== undefined) {
      conditions.push(eq(schedules.route_id, routeId));
    }

    if (startDate && endDate) {
      conditions.push(
        and(
          gte(schedules.start_date, new Date(startDate)),
          lte(schedules.end_date, new Date(endDate))
        )
      );
    } else if (startDate) {
      conditions.push(gte(schedules.start_date, new Date(startDate)));
    } else if (endDate) {
      conditions.push(lte(schedules.end_date, new Date(endDate)));
    }

    if (transportType) {
      const tp = await database
        .select({ id: transport_types.id })
        .from(transport_types)
        .where(eq(transport_types.type, transportType));

      if (tp.length) {
        conditions.push(eq(routes.transport_type_id, tp[0].id));
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
      const likePattern = `%${search}%`;
      conditions.push(
        or(
          like(originIsland.name, likePattern),
          like(destinationIsland.name, likePattern)
        )
      );
    }

    const whereClause = conditions.length ? and(...conditions) : undefined;

    let query = database
      .select({
        id: schedules.id,
        routeId: schedules.route_id,
        originName: originIsland.name,
        destinationName: destinationIsland.name,
        transportType: transport_types.type,
        departureTime: schedules.departure_time,
        arrivalTime: schedules.arrival_time,
        scheduleDays: schedules.schedule_days,
        routeCode: schedules.route_code,
        startDate: schedules.start_date,
        endDate: schedules.end_date,
        maxCapacity: schedules.max_capacity,
        stopDetails: schedules.stop_details,
      })
      .from(schedules)
      .innerJoin(routes, eq(schedules.route_id, routes.id))
      .innerJoin(originIsland, eq(routes.origin_id, originIsland.id))
      .innerJoin(
        destinationIsland,
        eq(routes.destination_id, destinationIsland.id)
      )
      .innerJoin(
        transport_types,
        eq(routes.transport_type_id, transport_types.id)
      );

    if (whereClause) query = (query as any).where(whereClause);

    switch (sort) {
      case "newest":
        query = (query as any).orderBy(desc(schedules.created_at));
        break;
      case "oldest":
        query = (query as any).orderBy(asc(schedules.created_at));
        break;
      case "start":
        query = (query as any).orderBy(asc(schedules.start_date));
        break;
      case "end":
        query = (query as any).orderBy(asc(schedules.end_date));
        break;
    }

    const [{ count: totalStr }] = await database
      .select({ count: count() })
      .from(schedules)
      .innerJoin(routes, eq(schedules.route_id, routes.id))
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

    const total = Number(totalStr);

    query = (query as any).limit(pageSize).offset((page - 1) * pageSize);

    const data = (await query) as ScheduleData[];
    return { data, total };
  } catch (err) {
    console.error("[getSchedules] failed:", err);
    return { data: [], total: 0 };
  }
}
