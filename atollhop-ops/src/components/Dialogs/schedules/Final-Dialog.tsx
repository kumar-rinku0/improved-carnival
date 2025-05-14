"use client";

import * as React from "react";
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  Tag,
  Plane,
  Ship,
  ShipWheel,
} from "lucide-react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type {
  FinalizeScheduleDialogProps,
  ScheduleLeg,
  RouteResult,
} from "./types";

const dayNames = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const Badge = ({ t }: { t: RouteResult["transportType"] }) => (
  <span className="inline-flex items-center gap-1 rounded border px-2 py-0.5 text-xs">
    {t === "Ferry" ? (
      <ShipWheel className="h-4 w-4" />
    ) : t === "Speedboat" ? (
      <Ship className="h-4 w-4" />
    ) : (
      <Plane className="h-4 w-4" />
    )}
    {t}
  </span>
);

export default function FinalizeScheduleDialog({
  scheduleType,
  data,
  setData,
  onFinalize,
  onBack,
}: FinalizeScheduleDialogProps) {
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState("");

  const formattedAvailability =
    data.availability.start && data.availability.end
      ? `${format(data.availability.start, "MM/dd/yyyy")} – ${format(
          data.availability.end,
          "MM/dd/yyyy"
        )}`
      : "Not set";

  const formattedDays =
    data.selectedDays.length > 0
      ? data.selectedDays.map((i) => dayNames[i]).join(", ")
      : "None";

  const segments = React.useMemo(() => {
    if (scheduleType !== "multi-hop") return [];
    const legs: ScheduleLeg[] = data.legs ?? [];
    const seen = new Set<string>();
    const out: Array<{
      key: string;
      origin: string;
      dest: string;
      transport: RouteResult["transportType"];
    }> = [];

    for (let i = 0; i < legs.length; i++) {
      const first = legs[i];
      let curDest = first.origin;
      const transport =
        first.routeResults.find((r) => r.id === first.selectedRouteId)
          ?.transportType ?? "Ferry";

      for (let j = i; j < legs.length; j++) {
        const leg = legs[j];
        if (j > i && leg.origin !== curDest) break;
        curDest = leg.destination;
        const key = `${first.origin}→${curDest}`;
        if (first.origin !== curDest && !seen.has(key)) {
          seen.add(key);
          out.push({ key, origin: first.origin, dest: curDest, transport });
        }
      }
    }
    return out;
  }, [scheduleType, data.legs]);

  const save = async () => {
    setBusy(true);
    setErr("");
    try {
      await onFinalize();
    } catch {
      setErr("Failed to create schedule.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <h2 className="text-lg font-semibold">Confirm &amp; Save</h2>

      {scheduleType === "single" && (
        <div className="space-y-3 rounded-md border bg-gray-50 p-4">
          {[
            {
              icon: <Tag className="h-4 w-4 text-gray-500" />,
              label: "Schedule type",
              value: "Single",
            },
            {
              icon: <MapPin className="h-4 w-4 text-gray-500" />,
              label: "Route",
              value: `${data.origin} → ${data.destination}`,
            },
            {
              icon: <Clock className="h-4 w-4 text-gray-500" />,
              label: "Time",
              value: `${data.departureTime} ${data.departureMeridiem} → ${data.arrivalTime} ${data.arrivalMeridiem}`,
            },
            {
              icon: <Users className="h-4 w-4 text-gray-500" />,
              label: "Max passengers",
              value: data.maxPassengers,
            },
            {
              icon: <Calendar className="h-4 w-4 text-gray-500" />,
              label: "Availability",
              value: formattedAvailability,
            },
            {
              icon: <span />,
              label: "Weekly schedule",
              value: formattedDays,
            },
          ].map(({ icon, label, value }) => (
            <div key={label} className="flex items-center justify-between">
              {icon}
              <span className="text-sm text-gray-500">{label}</span>
              <span className="text-sm font-medium">{value}</span>
            </div>
          ))}
        </div>
      )}

      {scheduleType === "multi-hop" && (
        <>
          <h3 className="font-medium">Segments &amp; Prices (Rf)</h3>
          {segments.length === 0 ? (
            <p className="text-gray-500">(no complete segments selected)</p>
          ) : (
            segments.map(({ key, origin, dest, transport }) => (
              <div
                key={key}
                className="flex items-center justify-between rounded-md border p-3"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {origin} → {dest}
                  </span>
                  <Badge t={transport} />
                </div>
                <div className="flex items-center gap-2">
                  <Label className="whitespace-nowrap">Rf</Label>
                  <Input
                    type="number"
                    min={0}
                    className="w-24"
                    value={data.pathPrices?.[key]?.toString() ?? ""}
                    placeholder="0"
                    onChange={(e) =>
                      setData((prev) => ({
                        ...prev,
                        pathPrices: {
                          ...prev.pathPrices,
                          [key]: parseFloat(e.currentTarget.value) || 0,
                        },
                      }))
                    }
                  />
                </div>
              </div>
            ))
          )}
        </>
      )}

      {err && <p className="text-red-600 text-sm">{err}</p>}

      <div className="flex justify-end gap-2">
        <button
          onClick={onBack}
          className="rounded-md border px-4 py-2 text-sm"
          disabled={busy}
        >
          Back
        </button>
        <button
          onClick={save}
          className="rounded-md bg-black px-4 py-2 text-sm text-white"
          disabled={busy}
        >
          {busy ? "Saving…" : "Save schedule"}
        </button>
      </div>
    </div>
  );
}
