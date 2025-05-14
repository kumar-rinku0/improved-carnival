"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dayjs from "dayjs";
import durationPlugin from "dayjs/plugin/duration";
import { ArrowDownUp, CirclePlus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AddScheduleDialog } from "@/components/Dialogs/schedules/Schedule";
import RouteTable, { RouteData } from "@/components/Tables/ScheduleTable";
import { DatePickerWithRange } from "@/components/DateRangePicker";

dayjs.extend(durationPlugin);

export interface ScheduleData {
  id: string;
  route: string;
  routeCode?: string;
  transportType: "Ferry" | "Speedboat" | "Flight";
  departureTime: string;
  arrivalTime: string;
  scheduleDays: string[];
}

type RoutesPageProps = {
  initialData: RouteData[];
  initialTransportType: string | null;
  initialLocation: string | null;
  initialTransportTypes: string[];
  initialLocations: string[];
  initialSearch?: string;
  initialPage: number;
  initialPageSize: number;
  totalCount: number;

  initialStartDate?: string | null;
  initialEndDate?: string | null;
};

export default function RoutesPage({
  initialData,
  initialTransportType,
  initialLocation,
  initialTransportTypes,
  initialLocations,
  initialSearch = "",
  initialPage,
  initialPageSize,
  totalCount,
  initialStartDate = null,
  initialEndDate = null,
}: RoutesPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = React.useState(initialSearch);
  const [selectedTransportType, setSelectedTransportType] = React.useState<
    string | null
  >(initialTransportType);
  const [selectedLocation, setSelectedLocation] = React.useState<string | null>(
    initialLocation
  );
  const [sortOption, setSortOption] = React.useState<
    "newest" | "oldest" | null
  >(null);
  const [locationSearchTerm, setLocationSearchTerm] = React.useState("");

  const [dateRange, setDateRange] = React.useState<{ from?: Date; to?: Date }>({
    from: initialStartDate ? new Date(initialStartDate) : undefined,
    to: initialEndDate ? new Date(initialEndDate) : undefined,
  });

  const totalPages = Math.ceil(totalCount / initialPageSize);

  const prevTransportTypeRef = React.useRef<string | null>(
    initialTransportType
  );
  const prevLocationRef = React.useRef<string | null>(initialLocation);
  const prevFromRef = React.useRef<Date | undefined>(dateRange.from);
  const prevToRef = React.useRef<Date | undefined>(dateRange.to);

  React.useEffect(() => {
    const current = new URLSearchParams(searchParams.toString());
    let filterChanged = false;

    if (selectedTransportType !== prevTransportTypeRef.current) {
      current.set("page", "1");
      prevTransportTypeRef.current = selectedTransportType;
      filterChanged = true;
    }
    if (selectedLocation !== prevLocationRef.current) {
      current.set("page", "1");
      prevLocationRef.current = selectedLocation;
      filterChanged = true;
    }
    if (
      dateRange.from !== prevFromRef.current ||
      dateRange.to !== prevToRef.current
    ) {
      current.set("page", "1");
      prevFromRef.current = dateRange.from;
      prevToRef.current = dateRange.to;
      filterChanged = true;
    }
    if (searchTerm) {
      current.set("search", searchTerm);
      filterChanged = true;
    } else {
      current.delete("search");
    }
    if (selectedTransportType) {
      current.set("transportType", selectedTransportType);
      filterChanged = true;
    } else {
      current.delete("transportType");
    }
    if (selectedLocation) {
      current.set("location", selectedLocation);
      filterChanged = true;
    } else {
      current.delete("location");
    }
    if (sortOption) {
      current.set("sort", sortOption);
      filterChanged = true;
    } else {
      current.delete("sort");
    }
    if (dateRange.from) {
      current.set("startDate", dateRange.from.toISOString());
      filterChanged = true;
    } else {
      current.delete("startDate");
    }
    if (dateRange.to) {
      current.set("endDate", dateRange.to.toISOString());
      filterChanged = true;
    } else {
      current.delete("endDate");
    }

    if (filterChanged) {
      const timer = setTimeout(() => {
        window.history.pushState(null, "", `?${current.toString()}`);
        router.replace(`?${current.toString()}`);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [
    searchTerm,
    selectedTransportType,
    selectedLocation,
    sortOption,
    dateRange,
    router,
    searchParams,
  ]);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Schedules</h1>
        <div className="flex items-center gap-2">
          <AddScheduleDialog locationOptions={initialLocations} />
        </div>
      </div>

      <div className="flex items-center py-4 gap-4">
        <Input
          placeholder="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <DatePickerWithRange
          onChange={(range) =>
            setDateRange({
              from: range.start ?? undefined,
              to: range.end ?? undefined,
            })
          }
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              size={selectedTransportType ? "default" : "sm"}
            >
              {selectedTransportType ? (
                <>
                  <span>{selectedTransportType}</span>
                  <span
                    style={{ pointerEvents: "all" }}
                    onPointerDownCapture={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      e.nativeEvent.stopImmediatePropagation();
                    }}
                    onClickCapture={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      e.nativeEvent.stopImmediatePropagation();
                      setSelectedTransportType(null);
                    }}
                  >
                    <X className="size-4 cursor-pointer" />
                  </span>
                </>
              ) : (
                <>
                  <CirclePlus className="size-4" />
                  <span>Transport type</span>
                </>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {initialTransportTypes.map((type) => (
              <DropdownMenuItem
                key={type}
                onClick={() => setSelectedTransportType(type)}
              >
                {type}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              size={selectedLocation ? "default" : "sm"}
            >
              {selectedLocation ? (
                <>
                  <span>{selectedLocation}</span>
                  <span
                    style={{ pointerEvents: "all" }}
                    onPointerDownCapture={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      e.nativeEvent.stopImmediatePropagation();
                    }}
                    onClickCapture={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      e.nativeEvent.stopImmediatePropagation();
                      setSelectedLocation(null);
                    }}
                  >
                    <X className="size-4 cursor-pointer" />
                  </span>
                </>
              ) : (
                <>
                  <CirclePlus className="size-4" />
                  <span>Location</span>
                </>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="max-h-[200px] overflow-y-auto">
            <div className="p-2">
              <Input
                placeholder="Search locations..."
                value={locationSearchTerm}
                onChange={(e) => setLocationSearchTerm(e.target.value)}
                className="mb-2"
              />
            </div>
            {initialLocations
              .filter((loc) =>
                loc.toLowerCase().includes(locationSearchTerm.toLowerCase())
              )
              .map((loc) => (
                <DropdownMenuItem
                  key={loc}
                  onClick={() => {
                    setSelectedLocation(loc);
                    setLocationSearchTerm("");
                  }}
                >
                  {loc}
                </DropdownMenuItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <ArrowDownUp className="size-4" />
                <span>
                  {sortOption
                    ? sortOption === "newest"
                      ? "Newest"
                      : sortOption === "oldest"
                      ? "Oldest"
                      : sortOption === "longest"
                      ? "Longest"
                      : sortOption === "shortest"
                      ? "Shortest"
                      : ""
                    : "Sort"}
                </span>
                {sortOption && (
                  <span
                    style={{ pointerEvents: "all" }}
                    onPointerDownCapture={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      e.nativeEvent.stopImmediatePropagation();
                    }}
                    onClickCapture={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      e.nativeEvent.stopImmediatePropagation();
                      setSortOption(null);
                    }}
                  >
                    <X className="size-4 cursor-pointer" />
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSortOption("newest")}>
                Newest first
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOption("oldest")}>
                Oldest first
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <RouteTable
        routes={initialData}
        totalPages={totalPages}
        initialPage={initialPage}
      />
    </div>
  );
}
