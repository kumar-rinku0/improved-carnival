"use server";

import React from "react";
import {
  getSchedules,
  ScheduleData as DBScheduleData,
} from "@/actions/getSchedules";
import { getTransportTypes } from "@/actions/getTransportTypes";
import { getLocations } from "@/actions/getLocations";
import SchedulePage, { ScheduleData as UIScheduleData } from "./SchedulePage";

type PageProps = {
  searchParams?: Promise<{ [key: string]: string | string[] }>;
};

export default async function SchedulesServer({ searchParams }: PageProps) {
  const sp = await Promise.resolve(searchParams);

  const page = typeof sp?.page === "string" ? parseInt(sp.page) : 1;
  const pageSize =
    typeof sp?.pageSize === "string" ? parseInt(sp.pageSize) : 10;

  const routeId =
    typeof sp?.routeId === "string" ? parseInt(sp.routeId) : undefined;
  const startDate =
    typeof sp?.startDate === "string" ? sp.startDate : undefined;
  const endDate = typeof sp?.endDate === "string" ? sp.endDate : undefined;
  const sort =
    typeof sp?.sort === "string"
      ? (sp.sort as "newest" | "oldest" | "start" | "end")
      : undefined;

  const transport =
    typeof sp?.transportType === "string" ? sp.transportType : undefined;
  const location = typeof sp?.location === "string" ? sp.location : undefined;
  const search = typeof sp?.search === "string" ? sp.search : undefined;

  const [result, transportTypes, locationOptions] = await Promise.all([
    getSchedules({
      routeId,
      startDate,
      endDate,
      transportType: transport,
      location,
      search,
      sort,
      page,
      pageSize,
    }),
    getTransportTypes(),
    getLocations(),
  ]);

  const schedules: UIScheduleData[] = result.data.map((s: DBScheduleData) => ({
    id: s.id.toString(),
    route: `${s.originName} -> ${s.destinationName}`,
    routeCode: s.routeCode ?? "",
    transportType: s.transportType as "Ferry" | "Speedboat" | "Flight",
    departureTime: s.departureTime,
    arrivalTime: s.arrivalTime,
    scheduleDays: s.scheduleDays,

    startDate: s.startDate,
    endDate: s.endDate,
  }));

  return (
    <SchedulePage
      initialData={schedules}
      totalCount={result.total}
      initialTransportType={transport ?? null}
      initialLocation={location ?? null}
      initialStartDate={startDate ?? null}
      initialEndDate={endDate ?? null}
      initialSearch={search ?? ""}
      initialPage={page}
      initialPageSize={pageSize}
      initialTransportTypes={transportTypes}
      initialLocations={locationOptions}
    />
  );
}
