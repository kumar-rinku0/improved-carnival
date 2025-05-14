/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import {
  ArrowRight,
  Plus,
  Trash2,
  ShipWheel,
  Ship,
  Plane,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/combo-box";
import { ToggleGroup } from "@/components/ToggleGroup";
import { DatePickerWithRange } from "@/components/DateRangePicker";
import { Switch } from "@/components/ui/switch";
import type {
  RouteResult,
  ScheduleLeg,
  Step2ScheduleDetailsProps,
} from "./types";

const DAYS = ["M", "T", "W", "T", "F", "S", "S"];

const EMPTY_LEG: ScheduleLeg = {
  origin: "",
  destination: "",
  departureTime: "",
  departureMeridiem: "AM",
  arrivalTime: "",
  arrivalMeridiem: "AM",
  selectedRouteId: null,
  price: 0,
  routeResults: [],
};

const renderBadge = (t: RouteResult["transportType"]) => {
  const icon =
    t === "Ferry" ? (
      <ShipWheel className="h-5 w-5" />
    ) : t === "Speedboat" ? (
      <Ship className="h-5 w-5" />
    ) : (
      <Plane className="h-5 w-5" />
    );
  return (
    <span className="inline-flex items-center gap-1 rounded border px-2 py-0.5 text-xs font-medium">
      {icon}
      {t}
    </span>
  );
};

export default function Step2ScheduleDetails({
  data,
  setData,
  locationOptions,
}: Step2ScheduleDetailsProps) {
  React.useEffect(() => {
    const patch: Partial<typeof data> = {};
    if (!data.legs || data.legs.length === 0) patch.legs = [{ ...EMPTY_LEG }];
    if (!data.pathPrices) patch.pathPrices = {};
    if (Object.keys(patch).length) setData((d) => ({ ...d, ...patch }));
  }, []);

  const legs = data.legs && data.legs.length ? data.legs : [{ ...EMPTY_LEG }];

  const firstTransportType = React.useMemo<
    ScheduleLeg["routeResults"][0]["transportType"] | undefined
  >(() => {
    const first = legs[0];
    if (!first?.selectedRouteId) return undefined;
    return first.routeResults.find((r) => r.id === first.selectedRouteId)
      ?.transportType;
  }, [legs]);

  React.useEffect(() => {
    if (!firstTransportType) return;
    setData((d) => ({
      ...d,
      legs: (d.legs ?? []).map((l, idx) => {
        if (idx === 0) return l;
        if (
          l.selectedRouteId &&
          l.routeResults.find((r) => r.id === l.selectedRouteId)
            ?.transportType !== firstTransportType
        ) {
          return { ...l, selectedRouteId: null };
        }
        return l;
      }),
    }));
  }, [firstTransportType, setData]);

  const updateLeg = (idx: number, patch: Partial<ScheduleLeg>) =>
    setData((d) => ({
      ...d,
      legs: (d.legs ?? []).map((l, i) => (i === idx ? { ...l, ...patch } : l)),
    }));

  const addLeg = () =>
    setData((d) => {
      const currentLegs = d.legs && d.legs.length ? d.legs : [{ ...EMPTY_LEG }];
      const prev = currentLegs[currentLegs.length - 1];
      const next: ScheduleLeg = {
        ...EMPTY_LEG,
        origin: prev.destination,
        departureTime: prev.arrivalTime,
        departureMeridiem: prev.arrivalMeridiem,
      };
      return { ...d, legs: [...currentLegs, next] };
    });

  const removeLeg = (idx: number) =>
    setData((d) => ({
      ...d,
      legs: (d.legs ?? []).filter((_, i) => i !== idx),
    }));

  const toggleDay = (day: number) =>
    setData((d) => ({
      ...d,
      selectedDays: d.selectedDays.includes(day)
        ? d.selectedDays.filter((x) => x !== day)
        : [...d.selectedDays, day],
    }));

  const handleTime = (
    idx: number,
    field: "departure" | "arrival",
    value: string
  ) => {
    if (idx === 0 && field === "departure") {
      updateLeg(idx, { departureTime: value, arrivalTime: value });
    } else {
      updateLeg(idx, { [`${field}Time`]: value } as any);
    }
  };

  const handleMeridiem = (
    idx: number,
    field: "departure" | "arrival",
    value: "AM" | "PM"
  ) => {
    if (idx === 0 && field === "departure") {
      updateLeg(idx, { departureMeridiem: value, arrivalMeridiem: value });
    } else {
      updateLeg(idx, { [`${field}Meridiem`]: value } as any);
    }
  };

  const lastQueries = React.useRef<string[]>([]);
  React.useEffect(() => {
    if (lastQueries.current.length < legs.length) {
      lastQueries.current = Array(legs.length).fill("");
    }

    legs.forEach((leg, idx) => {
      const key = `${leg.origin}→${leg.destination}`;
      if (leg.origin && leg.destination && lastQueries.current[idx] !== key) {
        lastQueries.current[idx] = key;
        updateLeg(idx, { routeResults: [], price: 0 });

        fetch("/api/routes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            origin: leg.origin,
            destination: leg.destination,
          }),
        })
          .then((res) => (res.ok ? res.json() : Promise.reject()))
          .then((json) => {
            const rr: RouteResult[] = (json.data || []).map((r: any) => ({
              id: r.id,
              originName: r.originName,
              destinationName: r.destinationName,
              duration: r.duration,
              price: r.price ?? 0,
              transportType: r.transportType || "Ferry",
            }));
            updateLeg(idx, { routeResults: rr });
          })
          .catch(() => {});
      }
    });
  }, [legs]);

  const buildOptions = (
    current: string,
    opposite: string,
    excluded: Set<string>
  ) =>
    locationOptions
      .filter(
        (loc) => loc !== opposite && (loc === current || !excluded.has(loc))
      )
      .map((loc) => ({ value: loc, label: loc }));

  return (
    <div className="space-y-8 p-6">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <Label>Schedule Code</Label>
          <Input
            placeholder="e.g. XY123"
            value={data.scheduleCode}
            onChange={(e) =>
              setData((d) => ({ ...d, scheduleCode: e.target.value }))
            }
          />
        </div>

        <div>
          <Label>Weekly Schedule</Label>
          <div className="mt-1 flex flex-wrap gap-2">
            {DAYS.map((d, i) => (
              <button
                key={`${d}-${i}`}
                onClick={() => toggleDay(i)}
                className={`rounded-md px-3 py-1 text-sm ${
                  data.selectedDays.includes(i)
                    ? "bg-black text-white"
                    : "hover:bg-gray-100"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <Label>Effective Period / All the time</Label>
          <DatePickerWithRange
            onChange={(r) =>
              !data.allTheTime && setData((d) => ({ ...d, availability: r }))
            }
            className={data.allTheTime ? "pointer-events-none opacity-50" : ""}
          />
          <div className="mt-2 flex items-center gap-2">
            <Switch
              checked={data.allTheTime}
              onCheckedChange={(c) => setData((d) => ({ ...d, allTheTime: c }))}
            />
            <Label>All the time</Label>
          </div>
        </div>

        <div>
          <Label>Max Passengers</Label>
          <Input
            type="number"
            min={1}
            className="w-24"
            value={data.maxPassengers}
            onChange={(e) =>
              setData((d) => ({ ...d, maxPassengers: e.target.value }))
            }
          />
        </div>
      </div>

      <div className="space-y-6">
        {legs.map((leg, i) => {
          const used = new Set(
            legs
              .filter((_, idx) => idx !== i)
              .flatMap((l) => [l.origin, l.destination])
          );
          const originOpts = buildOptions(leg.origin, leg.destination, used);
          const destOpts = buildOptions(leg.destination, leg.origin, used);

          const filteredResults =
            i === 0 || !firstTransportType
              ? leg.routeResults
              : leg.routeResults.filter(
                  (r) => r.transportType === firstTransportType
                );

          return (
            <div key={i} className="relative space-y-4 rounded-lg border p-4">
              {i > 0 && (
                <button
                  onClick={() => removeLeg(i)}
                  className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
                >
                  <Trash2 />
                </button>
              )}

              <h4 className="font-semibold">Route {i + 1}</h4>

              <div className="flex items-end gap-4">
                <div className="flex-1">
                  <Label>Origin</Label>
                  <Combobox
                    options={originOpts}
                    value={leg.origin}
                    onValueChange={(v) => updateLeg(i, { origin: v })}
                    disabled={i > 0}
                    className="w-full"
                  />
                </div>
                <ArrowRight className="mb-1 text-gray-400" />
                <div className="flex-1">
                  <Label>Destination</Label>
                  <Combobox
                    options={destOpts}
                    value={leg.destination}
                    onValueChange={(v) => updateLeg(i, { destination: v })}
                    className="w-full"
                  />
                </div>
                <Button variant="secondary" className="mt-6" disabled>
                  <Search />
                </Button>
              </div>

              {filteredResults.length > 0 && (
                <div className="mt-3 space-y-2">
                  {filteredResults.map((r) => (
                    <label
                      key={r.id}
                      className="flex cursor-pointer justify-between rounded-md border p-3"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`route-${i}`}
                          checked={leg.selectedRouteId === r.id}
                          onChange={() =>
                            updateLeg(i, { selectedRouteId: r.id })
                          }
                          className="accent-black"
                        />
                        <span>
                          {r.originName} → {r.destinationName}
                        </span>
                      </div>
                      {renderBadge(r.transportType)}
                    </label>
                  ))}
                </div>
              )}

              <div className="flex items-end gap-6">
                {(["departure", "arrival"] as const).map((f) => (
                  <div key={f}>
                    <Label className="capitalize">{f} Time</Label>
                    <div className="mt-1 flex items-center gap-2">
                      <Input
                        className="w-24"
                        placeholder="00:00"
                        value={(leg as any)[`${f}Time`]}
                        onChange={(e) => handleTime(i, f, e.target.value)}
                      />
                      <ToggleGroup
                        value={(leg as any)[`${f}Meridiem`]}
                        onChange={(v) => handleMeridiem(i, f, v)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        <Button
          variant="outline"
          onClick={addLeg}
          className="mt-2 flex items-center gap-2"
        >
          <Plus /> New LEG
        </Button>
      </div>
    </div>
  );
}
