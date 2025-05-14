/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { ToggleGroup } from "@/components/ToggleGroup";
import { DatePickerWithRange } from "@/components/DateRangePicker";
import { ArrowRight, Search, ShipWheel, Ship, Plane } from "lucide-react";
import { Combobox, Option } from "@/components/combo-box";
import type {
  DateRange,
  Step2ScheduleDetailsProps,
  RouteResult,
} from "./types";

const DAYS = ["M", "T", "W", "T", "F", "S", "S"];

export default function Step2ScheduleDetails({
  data,
  setData,
  locationOptions = [],
}: Step2ScheduleDetailsProps) {
  const [typedOrigin, setTypedOrigin] = React.useState("");
  const [typedDestination, setTypedDestination] = React.useState("");
  const [routeResults, setRouteResults] = React.useState<RouteResult[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const originOptions: Option[] = React.useMemo(
    () =>
      locationOptions
        .filter((loc) => loc !== typedDestination)
        .map((loc) => ({ value: loc, label: loc })),
    [locationOptions, typedDestination]
  );

  const destinationOptions: Option[] = React.useMemo(
    () =>
      locationOptions
        .filter((loc) => loc !== typedOrigin)
        .map((loc) => ({ value: loc, label: loc })),
    [locationOptions, typedOrigin]
  );

  const handleAllTheTimeChange = React.useCallback(
    (checked: boolean) =>
      setData((prev) => ({
        ...prev,
        allTheTime: checked,
        availability: checked ? { start: null, end: null } : prev.availability,
      })),
    [setData]
  );

  const handleDayToggle = React.useCallback(
    (dayIndex: number) =>
      setData((prev) => {
        const selected = new Set(prev.selectedDays);
        if (selected.has(dayIndex)) {
          selected.delete(dayIndex);
        } else {
          selected.add(dayIndex);
        }
        return { ...prev, selectedDays: Array.from(selected) };
      }),
    [setData]
  );

  const setMeridiem = React.useCallback(
    (type: "departure" | "arrival", val: "AM" | "PM") =>
      setData((prev) => ({ ...prev, [`${type}Meridiem`]: val } as any)),
    [setData]
  );

  const handleSearch = React.useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/routes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin: typedOrigin,
          destination: typedDestination,
        }),
      });
      if (!res.ok)
        throw new Error(`Failed to fetch route data. Status: ${res.status}`);
      const json = await res.json();
      const transformed: RouteResult[] = (json.data || []).map((item: any) => ({
        id: item.id,
        origin: item.originName,
        destination: item.destinationName,
        duration: item.duration,
        transportType: item.transportType || "Ferry",
      }));
      setRouteResults(transformed);
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching routes.");
      setRouteResults([]);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [typedOrigin, typedDestination]);

  const handleSelectRoute = React.useCallback(
    (route: RouteResult) =>
      setData((prev) => ({
        ...prev,
        selectedRouteId: route.id,
        origin: route.origin,
        destination: route.destination,
      })),
    [setData]
  );

  const renderTransportIcon = (type: RouteResult["transportType"]) => {
    switch (type) {
      case "Ferry":
        return <ShipWheel className="h-6 w-6" />;
      case "Speedboat":
        return <Ship className="h-6 w-6" />;
      case "Flight":
        return <Plane className="h-6 w-6" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 p-6">
      <div className="flex flex-col sm:flex-row gap-4 sm:items-end">
        <div className="flex flex-col sm:w-1/3 gap-2">
          <Label>Schedule Code</Label>
          <Input
            type="text"
            placeholder="e.g. XY123"
            value={data.scheduleCode}
            onChange={(e) =>
              setData((prev) => ({ ...prev, scheduleCode: e.target.value }))
            }
          />
        </div>
        <div className="flex flex-col sm:w-2/3 gap-2">
          <Label>Weekly Schedule</Label>
          <div className="flex flex-wrap gap-2 mt-1">
            {DAYS.map((dayLabel, idx) => {
              const isSelected = data.selectedDays.includes(idx);
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleDayToggle(idx)}
                  className={`px-3 py-1 border rounded-md text-sm font-medium ${
                    isSelected
                      ? "bg-black text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {dayLabel}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-end gap-4">
        <div className="flex flex-col w-full sm:w-48 gap-2">
          <Label>Search Origin</Label>
          <Combobox
            options={originOptions}
            value={typedOrigin}
            onValueChange={setTypedOrigin}
            placeholder="Type or select..."
            className="w-full"
          />
        </div>
        <div className="flex items-center">
          <ArrowRight className="h-5 w-5 text-gray-400" />
        </div>
        <div className="flex flex-col w-full sm:w-48 gap-2">
          <Label>Search Destination</Label>
          <Combobox
            options={destinationOptions}
            value={typedDestination}
            onValueChange={setTypedDestination}
            placeholder="Type or select..."
            className="w-full"
          />
        </div>
        <div className="flex-1 flex justify-end">
          <Button
            variant="secondary"
            onClick={handleSearch}
            className="flex items-center gap-2"
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div>
        {isLoading && <p className="text-center">Loading routes...</p>}
        {error && <p className="text-red-500 text-center">{error}</p>}
        {!isLoading && !error && routeResults.length > 0 && (
          <div>
            <p className="font-semibold mb-2">Route Options:</p>
            <div role="radiogroup" className="space-y-4">
              {routeResults.map((route) => (
                <label
                  key={route.id}
                  className="flex items-center justify-between p-4 border rounded-md bg-gray-50 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    <input
                      type="radio"
                      name="selectedRoute"
                      value={route.id}
                      checked={data.selectedRouteId === route.id}
                      onChange={() => handleSelectRoute(route)}
                      className="mr-3 h-4 w-4 text-black accent-black"
                    />
                    <div>
                      <p className="font-semibold">
                        {route.origin} &rarr; {route.destination}
                      </p>
                      {route.duration != null && (
                        <p className="text-sm text-gray-600">
                          {route.duration} minutes
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {renderTransportIcon(route.transportType)}
                    <span className="font-medium">{route.transportType}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-6">
        <div className="flex flex-col w-full sm:w-1/2">
          <Label>Departure Time</Label>
          <div className="flex items-center gap-2 mt-1">
            <Input
              type="text"
              placeholder="00:00"
              value={data.departureTime}
              onChange={(e) =>
                setData((prev) => ({ ...prev, departureTime: e.target.value }))
              }
              className="w-24"
            />
            <ToggleGroup
              value={data.departureMeridiem}
              onChange={(val) => setMeridiem("departure", val)}
            />
          </div>
        </div>
        <div className="flex flex-col w-full sm:w-1/2">
          <Label>Arrival Time</Label>
          <div className="flex items-center gap-2 mt-1">
            <Input
              type="text"
              placeholder="00:00"
              value={data.arrivalTime}
              onChange={(e) =>
                setData((prev) => ({ ...prev, arrivalTime: e.target.value }))
              }
              className="w-24"
            />
            <ToggleGroup
              value={data.arrivalMeridiem}
              onChange={(val) => setMeridiem("arrival", val)}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-6">
        <div className="w-full sm:w-1/2">
          <Label>Availability</Label>
          <div className="flex flex-col gap-3 mt-1">
            <DatePickerWithRange
              onChange={(r: DateRange) => {
                if (!data.allTheTime)
                  setData((prev) => ({ ...prev, availability: r }));
              }}
              className={
                data.allTheTime ? "opacity-50 pointer-events-none" : ""
              }
            />
            <div className="flex items-center gap-2">
              <Switch
                checked={data.allTheTime}
                onCheckedChange={handleAllTheTimeChange}
              />
              <Label>All the time</Label>
            </div>
          </div>
        </div>
        <div className="flex flex-col w-full sm:w-1/2">
          <Label>Maximum Passengers</Label>
          <div className="flex items-center gap-2 mt-1">
            <button
              type="button"
              onClick={() =>
                setData((prev) => ({
                  ...prev,
                  maxPassengers: Math.max(
                    0,
                    +prev.maxPassengers - 1
                  ).toString(),
                }))
              }
              className="px-3 py-1 border rounded-md hover:bg-gray-100"
            >
              –
            </button>
            <Input
              type="text"
              readOnly
              value={data.maxPassengers}
              className="w-16 text-center"
            />
            <button
              type="button"
              onClick={() =>
                setData((prev) => ({
                  ...prev,
                  maxPassengers: (+prev.maxPassengers + 1).toString(),
                }))
              }
              className="px-3 py-1 border rounded-md hover:bg-gray-100"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
