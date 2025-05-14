import { randomUUID } from "crypto";
import { db } from "@/db/public-db";
import { schedules, prices, routes as routesTable } from "@/db/schema";
import { sql, inArray } from "drizzle-orm";

export type Stop = {
  islandId: number | null;
  islandName: string;
  arrivalTime: string;
  waitMinutes: number;
  departureTime: string;
};

export type RawSchedule = {
  origin: string;
  destination: string;
  routeId: number | null;

  routeCode?: string | null;
  departureTime?: string;
  arrivalTime?: string;
  scheduleDays?: number[];
  startDate?: string | null;
  endDate?: string | null;
  maxCapacity?: number | null;

  prices: {
    localAdult: number;
    localChild: number;
    localInfant: number;
    expatAdult: number;
    expatChild: number;
    expatInfant: number;
    touristAdult: number;
    touristChild: number;
    touristInfant: number;
  };

  stops: Stop[];
};

const dayNames = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

function buildBaseRow(s: RawSchedule) {
  return {
    uuid: randomUUID(),

    route_id: s.routeId ?? sql`NULL`,
    departure_time: s.departureTime ?? "00:00:00",
    arrival_time: s.arrivalTime ?? "00:00:00",
    schedule_days: (s.scheduleDays ?? []).map((d) => {
      if (d < 0 || d > 6) {
        throw new Error(
          `Invalid schedule day ${d} for ${s.origin}→${s.destination}`
        );
      }
      return dayNames[d];
    }),
    route_code: s.routeCode ?? null,
    start_date: s.startDate ? new Date(s.startDate) : sql`NOW()`,
    end_date: s.endDate ? new Date(s.endDate) : sql`NOW() + INTERVAL '1 year'`,
    max_capacity: s.maxCapacity ?? null,
  };
}

const fieldMeta = {
  localAdult: { currency: 1, category: 1, type: 1 },
  localChild: { currency: 1, category: 1, type: 2 },
  localInfant: { currency: 1, category: 1, type: 3 },
  expatAdult: { currency: 1, category: 2, type: 1 },
  expatChild: { currency: 1, category: 2, type: 2 },
  expatInfant: { currency: 1, category: 2, type: 3 },
  touristAdult: { currency: 2, category: 3, type: 1 },
  touristChild: { currency: 2, category: 3, type: 2 },
  touristInfant: { currency: 2, category: 3, type: 3 },
} as const;

function buildPriceRows(
  operatorId: number,
  scheduleId: number,
  priceMap: RawSchedule["prices"]
) {
  return (Object.entries(priceMap) as [keyof typeof fieldMeta, number][])
    .filter(([, v]) => v != null)
    .map(([field, num]) => ({
      operator_id: operatorId,
      schedule_id: scheduleId,
      currency_id: fieldMeta[field].currency,
      fare_category_id: fieldMeta[field].category,
      fare_type_id: fieldMeta[field].type,
      value: num.toString(),
    }));
}

export async function insertSchedulesTx(payload: RawSchedule[]) {
  const database = await db();

  return database.transaction(async (tx) => {
    const atomic = payload.filter((s) => s.stops.length === 0);
    const composite = payload.filter((s) => s.stops.length > 0);

    const atomicRows = atomic.map((s) => ({
      ...buildBaseRow(s),
      stop_schedule_ids: [] as number[],
      part_of_schedule_ids: [] as number[],
      stop_details: sql`'[]'::jsonb`,
    }));

    const insertedAtomic = await tx
      .insert(schedules)
      .values(atomicRows)
      .returning({ id: schedules.id, route_id: schedules.route_id });

    const idByPath = new Map<string, number>();
    atomic.forEach((s, i) =>
      idByPath.set(`${s.origin}→${s.destination}`, insertedAtomic[i].id)
    );

    const compositeRows = composite.map((s) => {
      const stopIds: number[] = [];
      let prev = s.origin;
      for (const st of s.stops) {
        const id = idByPath.get(`${prev}→${st.islandName}`);
        if (!id) {
          throw new Error(
            `Missing atomic schedule for “${prev}→${st.islandName}”`
          );
        }
        stopIds.push(id);
        prev = st.islandName;
      }
      return {
        ...buildBaseRow(s),
        stop_schedule_ids: stopIds,
        part_of_schedule_ids: [] as number[],
        stop_details: sql`${JSON.stringify(s.stops)}::jsonb`,
      };
    });

    const insertedComposite = compositeRows.length
      ? await tx
          .insert(schedules)
          .values(compositeRows)
          .returning({ id: schedules.id, route_id: schedules.route_id })
      : [];

    const routeIds = [
      ...insertedAtomic.map((r) => r.route_id),
      ...insertedComposite.map((r) => r.route_id),
    ].filter((x): x is number => typeof x === "number");

    const opRows = routeIds.length
      ? await tx
          .select({
            route_id: routesTable.id,
            operator_id: routesTable.operator_id,
          })
          .from(routesTable)
          .where(inArray(routesTable.id, routeIds))
      : [];

    const opByRoute = new Map(opRows.map((r) => [r.route_id, r.operator_id]));

    const priceRows = [
      ...insertedAtomic.flatMap(({ id, route_id }, idx) =>
        buildPriceRows(opByRoute.get(route_id)!, id, atomic[idx].prices)
      ),
      ...insertedComposite.flatMap(({ id, route_id }, idx) =>
        buildPriceRows(opByRoute.get(route_id)!, id, composite[idx].prices)
      ),
    ];

    if (priceRows.length) {
      await tx.insert(prices).values(priceRows);
    }

    return {
      insertedAtomic: insertedAtomic.length,
      insertedComposite: insertedComposite.length,
      insertedPrices: priceRows.length,
    };
  });
}
