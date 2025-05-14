"use client";

import * as React from "react";
import { ReusableDialog } from "@/components/Dialogs/DialogLayout/ReusableDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/components/ToastProvider";

import Step1ScheduleType from "./Step1-Dialog";
import Step2SingleDialog from "./Step2-Dialog";
import Step2ScheduleDetails from "./Step2-MultiLegSchedule";
import Step3ReviewSchedule from "./Step3-Dialog";
import Step3MultiLegSchedule from "./Step3-MultiLegSchedule";
import FinalizeScheduleDialog from "./Final-Dialog";

import type { Step2DataState, AddScheduleDialogProps } from "./types";

const hhmm12To24 = (t: string, mer: "AM" | "PM") => {
  const [h, m] = t.split(":").map(Number);
  const hr = (h % 12) + (mer === "PM" ? 12 : 0);
  return `${hr.toString().padStart(2, "0")}:${m
    .toString()
    .padStart(2, "0")}:00`;
};

const diffMin = (f: string, t: string) =>
  (new Date(`1970-01-01T${t}Z`).getTime() -
    new Date(`1970-01-01T${f}Z`).getTime()) /
  60000;

const fetchIslandId = async (name: string) => {
  const r = await fetch(`/api/islands?name=${encodeURIComponent(name)}`);
  if (!r.ok) return null;
  const j = await r.json();
  return j.data?.[0]?.id ?? null;
};

const fetchDirectRouteId = async (o: string, d: string) => {
  const r = await fetch("/api/routes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ origin: o, destination: d }),
  });
  if (!r.ok) return null;
  const j = await r.json();
  return j.data?.[0]?.id ?? null;
};

type PriceFields =
  | "localAdult"
  | "localChild"
  | "localInfant"
  | "expatAdult"
  | "expatChild"
  | "expatInfant"
  | "touristAdult"
  | "touristChild"
  | "touristInfant";

type JsonOut = {
  origin: string;
  destination: string;
  routeId: number | null;
  routeCode: string | null;
  scheduleDays: number[];
  departureTime: string;
  arrivalTime: string;
  maxCapacity: number | null;
  startDate: string | null;
  endDate: string | null;
  prices: Record<PriceFields, number>;
  stops: {
    islandId: number | null;
    islandName: string;
    arrivalTime: string;
    waitMinutes: number;
    departureTime: string;
  }[];
  stop_schedule_ids: Array<number | null>;
};

const metaCommon = (d: Step2DataState) => ({
  routeCode: d.scheduleCode || null,
  scheduleDays: d.selectedDays,
  departureTime: hhmm12To24(d.departureTime, d.departureMeridiem),
  arrivalTime: hhmm12To24(d.arrivalTime, d.arrivalMeridiem),
  maxCapacity: parseInt(d.maxPassengers, 10) || null,
  startDate:
    d.allTheTime || !d.availability.start
      ? null
      : new Date(d.availability.start).toISOString(),
  endDate:
    d.allTheTime || !d.availability.end
      ? null
      : new Date(d.availability.end).toISOString(),
});

const buildRoutesJson = async (
  typ: "single" | "multi-hop" | null,
  d: Step2DataState
): Promise<JsonOut[]> => {
  if (!typ) return [];

  const globalPrices: Record<PriceFields, number> = {
    localAdult: +d.localAdult || 0,
    localChild: +d.localChild || 0,
    localInfant: +d.localInfant || 0,
    expatAdult: +d.expatAdult || 0,
    expatChild: +d.expatChild || 0,
    expatInfant: +d.expatInfant || 0,
    touristAdult: +d.touristAdult || 0,
    touristChild: +d.touristChild || 0,
    touristInfant: +d.touristInfant || 0,
  };

  if (typ === "single") {
    return [
      {
        origin: d.origin,
        destination: d.destination,
        routeId: d.selectedRouteId,
        stops: [],
        stop_schedule_ids: [],
        prices: globalPrices,
        ...metaCommon(d),
      },
    ];
  }

  const out: JsonOut[] = [];
  const legs = d.legs ?? [];
  const seen = new Set<string>();

  const pushRow = (
    o: string,
    dest: string,
    id: number | null,
    stops: JsonOut["stops"],
    stopIds: JsonOut["stop_schedule_ids"],
    dep: string,
    arr: string,
    segKey: string
  ) => {
    if (seen.has(segKey)) return;
    seen.add(segKey);
    out.push({
      origin: o,
      destination: dest,
      routeId: id,
      stops,
      stop_schedule_ids: stopIds,
      prices: { ...globalPrices, ...d.segmentPrices?.[segKey] },
      ...metaCommon(d),
      departureTime: dep,
      arrivalTime: arr,
    });
  };

  legs.forEach((l, idx) => {
    const key = `${l.origin}-${l.destination}-${idx}-${idx}`;
    pushRow(
      l.origin,
      l.destination,
      l.selectedRouteId,
      [],
      [],
      hhmm12To24(l.departureTime, l.departureMeridiem),
      hhmm12To24(l.arrivalTime, l.arrivalMeridiem),
      key
    );
  });

  for (let i = 0; i < legs.length - 1; i++) {
    for (let j = i + 1; j < legs.length; j++) {
      const origin = legs[i].origin;
      const destination = legs[j].destination;
      const segKey = `${origin}-${destination}-${i}-${j}`;
      if (seen.has(segKey)) continue;

      const stops: JsonOut["stops"] = [];
      for (let p = i; p < j; p++) {
        const cur = legs[p],
          nxt = legs[p + 1];
        stops.push({
          islandId: await fetchIslandId(cur.destination),
          islandName: cur.destination,
          arrivalTime: hhmm12To24(cur.arrivalTime, cur.arrivalMeridiem),
          departureTime: hhmm12To24(nxt.departureTime, nxt.departureMeridiem),
          waitMinutes: diffMin(
            hhmm12To24(cur.arrivalTime, cur.arrivalMeridiem),
            hhmm12To24(nxt.departureTime, nxt.departureMeridiem)
          ),
        });
      }

      const stopIds = legs.slice(i, j).map((l) => l.selectedRouteId);
      const routeId = await fetchDirectRouteId(origin, destination);

      pushRow(
        origin,
        destination,
        routeId,
        stops,
        stopIds,
        hhmm12To24(legs[i].departureTime, legs[i].departureMeridiem),
        hhmm12To24(legs[j].arrivalTime, legs[j].arrivalMeridiem),
        segKey
      );
    }
  }
  return out;
};

export default function AddScheduleDialog({
  locationOptions,
}: AddScheduleDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [step, setStep] = React.useState(1);
  const [scheduleType, setType] = React.useState<"single" | "multi-hop" | null>(
    null
  );

  const [step2Data, setStep2Data] = React.useState<Step2DataState>({
    scheduleCode: "",
    searchRoutes: "",
    origin: "",
    destination: "",
    departureTime: "00:00",
    departureMeridiem: "AM",
    arrivalTime: "00:00",
    arrivalMeridiem: "AM",
    maxPassengers: "0",
    allTheTime: false,
    selectedDays: [],
    availability: { start: null, end: null },
    selectedRouteId: null,
    legs: [],
    localAdult: "0",
    localChild: "0",
    localInfant: "0",
    expatAdult: "0",
    expatChild: "0",
    expatInfant: "0",
    touristAdult: "0",
    touristChild: "0",
    touristInfant: "0",
    segmentPrices: {},
  });

  const { toast } = useToast();

  const clearStep2 = () =>
    setStep2Data((d) => ({
      ...d,
      scheduleCode: "",
      searchRoutes: "",
      origin: "",
      destination: "",
      selectedRouteId: null,
      legs: [],
      selectedDays: [],
      maxPassengers: "0",
      segmentPrices: {},
    }));

  const paxCnt = parseInt(step2Data.maxPassengers, 10) || 0;
  const isStep2Valid = React.useCallback(() => {
    if (scheduleType === "multi-hop") {
      return (
        step2Data.scheduleCode.trim() &&
        paxCnt > 0 &&
        (step2Data.legs?.length ?? 0) > 0 &&
        step2Data.legs!.every(
          (l) => l.selectedRouteId && l.departureTime && l.arrivalTime
        )
      );
    }
    return (
      step2Data.scheduleCode.trim() &&
      step2Data.selectedRouteId &&
      paxCnt > 0 &&
      step2Data.departureTime &&
      step2Data.arrivalTime
    );
  }, [scheduleType, step2Data, paxCnt]);

  const handleNext = async () => {
    if (step === 2) {
      console.log(
        "▶ Selected routes JSON after Step 2:",
        JSON.stringify(await buildRoutesJson(scheduleType, step2Data), null, 2)
      );
    }
    setStep((s) => s + 1);
  };

  const finalizeSchedule = async () => {
    const payload = await buildRoutesJson(scheduleType, step2Data);

    console.log(
      "▶ Final payload sent to /api/schedules/batch:",
      JSON.stringify(payload, null, 2)
    );

    const res = await fetch("/api/schedules/batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      toast({ title: "Error", description: "Could not create schedules" });
      return;
    }

    const { insertedAtomic, insertedComposite } = await res.json();

    if (scheduleType === "single" && payload.length) {
      const { origin, destination } = payload[0];
      toast({
        title: "Schedule added successfully!",
        description: `"${origin} → ${destination}" has been added to your Schedules.`,
      });
    } else {
      toast({
        title: "Schedules added successfully!",
        description: `Added ${insertedAtomic} legs and ${insertedComposite} paths`,
      });
    }

    setOpen(false);
    setStep(1);
    setType(null);
    clearStep2();
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Step1ScheduleType
            scheduleType={scheduleType}
            onTypeSelect={(t) => {
              setType(t);
              setStep(2);
            }}
          />
        );
      case 2:
        return scheduleType === "multi-hop" ? (
          <Step2ScheduleDetails
            data={step2Data}
            setData={setStep2Data}
            locationOptions={locationOptions}
          />
        ) : (
          <Step2SingleDialog
            data={step2Data}
            setData={setStep2Data}
            locationOptions={locationOptions}
          />
        );
      case 3:
        return scheduleType === "multi-hop" ? (
          <Step3MultiLegSchedule data={step2Data} setData={setStep2Data} />
        ) : (
          <Step3ReviewSchedule
            scheduleType="single"
            data={step2Data}
            setData={setStep2Data}
          />
        );
      case 4:
        return (
          <FinalizeScheduleDialog
            scheduleType={scheduleType}
            data={step2Data}
            onFinalize={finalizeSchedule}
            onBack={() => setStep(3)}
            setData={setStep2Data}
          />
        );
      default:
        return null;
    }
  };

  return (
    <ReusableDialog
      className="max-w-4xl"
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) {
          setStep(1);
          setType(null);
          clearStep2();
        }
      }}
      title={step < 4 ? "Add Schedule" : ""}
      description={
        step < 4 ? "Fill in the details below to create a schedule" : ""
      }
      trigger={
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Schedule
        </Button>
      }
      footer={
        step > 1 &&
        step < 4 && (
          <div className="flex w-full items-center justify-between">
            <Button variant="outline" onClick={() => setStep((s) => s - 1)}>
              Back
            </Button>
            <Button
              onClick={step === 3 ? finalizeSchedule : handleNext}
              disabled={step === 2 && !isStep2Valid()}
            >
              {step === 3 ? "Add Schedule" : "Next"}
            </Button>
          </div>
        )
      }
      size={scheduleType === "multi-hop" ? "large" : "default"}
    >
      {step < 4 && (
        <div className="mb-4 flex gap-2">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className={`h-2 flex-1 rounded-full ${
                step >= n ? "bg-primary" : "bg-gray-300"
              }`}
            />
          ))}
        </div>
      )}
      {renderStep()}
    </ReusableDialog>
  );
}


export { AddScheduleDialog };
