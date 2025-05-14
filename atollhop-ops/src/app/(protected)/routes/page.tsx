"use server";

import React from "react";
import { getRoutes } from "@/actions/getRoutes";
import { getTransportTypes } from "@/actions/getTransportTypes";
import { getLocations } from "@/actions/getLocations";
import RoutesPage from "./RoutesPage";
import { RouteData } from "./RoutesPage";

type RoutesProps = {
  searchParams?: Promise<{ [key: string]: string | string[] }>;
};

export default async function Routes({ searchParams }: RoutesProps) {
  const sp = await Promise.resolve(searchParams);

  const pageParam = typeof sp?.page === "string" ? parseInt(sp.page) : 1;
  const pageSizeParam =
    typeof sp?.pageSize === "string" ? parseInt(sp.pageSize) : 10;
  const transportParam =
    typeof sp?.transportType === "string" ? sp.transportType : undefined;
  const locationParam =
    typeof sp?.location === "string" ? sp.location : undefined;
  const searchParam = typeof sp?.search === "string" ? sp.search : undefined;
  const sortParam =
    typeof sp?.sort === "string"
      ? (sp.sort as "newest" | "oldest" | "longest" | "shortest")
      : undefined;

  const [routesResult, transportTypes, locationOptions] = await Promise.all([
    getRoutes({
      page: pageParam,
      pageSize: pageSizeParam,
      transportType: transportParam,
      location: locationParam,
      search: searchParam,
      sort: sortParam,
    }),
    getTransportTypes(),
    getLocations(),
  ]);

  const routesData: RouteData[] = (routesResult.data || []).map((r) => ({
    id: r.id.toString(),
    route: `${r.originName} -> ${r.destinationName}`,
    duration: r.duration,
    transportType: r.transportType as "Ferry" | "Speedboat" | "Flight",
  }));

  return (
    <RoutesPage
      initialData={routesData}
      initialTransportType={transportParam ?? null}
      initialLocation={locationParam ?? null}
      initialTransportTypes={transportTypes}
      initialLocations={locationOptions}
      initialSearch={searchParam ?? ""}
      initialPage={pageParam}
      initialPageSize={pageSizeParam}
      totalCount={routesResult.total || 0}
    />
  );
}
