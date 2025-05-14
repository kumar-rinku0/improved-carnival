/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ShipWheel, Ship, Plane, ChevronDown, ChevronUp } from "lucide-react";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import type { Step2DataState } from "./types";

interface SegmentPricesProps {
  segKey: string;
  prices: NonNullable<Step2DataState["segmentPrices"]>[string];
  onPriceChange: (
    segmentKey: string,
    field: keyof NonNullable<Step2DataState["segmentPrices"]>,
    value: number
  ) => void;
}

const sections = [
  {
    key: "local" as const,
    label: "Local",
    suffix: "Rf",
    fields: [
      ["Adult", "localAdult"],
      ["Child", "localChild"],
      ["Infant", "localInfant"],
    ] as const,
  },
  {
    key: "expat" as const,
    label: "Expat",
    suffix: "Rf",
    fields: [
      ["Adult", "expatAdult"],
      ["Child", "expatChild"],
      ["Infant", "expatInfant"],
    ] as const,
  },
  {
    key: "tourist" as const,
    label: "Tourist",
    suffix: "USD",
    fields: [
      ["Adult", "touristAdult"],
      ["Child", "touristChild"],
      ["Infant", "touristInfant"],
    ] as const,
  },
];

function SegmentPrices({
  segKey,
  prices = {},
  onPriceChange,
}: SegmentPricesProps) {
  const [openSection, setOpenSection] =
    React.useState<(typeof sections)[number]["key"]>("local");

  return (
    <div className="border rounded-lg divide-y">
      {sections.map(({ key, label, suffix, fields }) => (
        <Collapsible
          key={key}
          open={openSection === key}
          onOpenChange={(isOpen) => setOpenSection(isOpen ? key : openSection)}
        >
          <CollapsibleTrigger className="flex justify-between items-center px-4 py-2 cursor-pointer">
            <span className="font-medium">{label}</span>
            {openSection === key ? <ChevronUp /> : <ChevronDown />}
          </CollapsibleTrigger>

          {openSection === key && (
            <CollapsibleContent className="px-4 py-2 space-y-4">
              {fields.map(([fldLabel, fldKey]) => (
                <div key={fldKey} className="flex items-center gap-4">
                  <Label className="w-24">{fldLabel}</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={0}
                      className="w-32"
                      value={prices[fldKey]?.toString() ?? ""}
                      placeholder="0"
                      onChange={(e) =>
                        onPriceChange(
                          segKey,
                          fldKey,
                          parseFloat(e.target.value) || 0
                        )
                      }
                    />
                    <span className="text-gray-500">{suffix}</span>
                  </div>
                </div>
              ))}
            </CollapsibleContent>
          )}
        </Collapsible>
      ))}
    </div>
  );
}

export interface Step3MultiLegScheduleProps {
  data: Step2DataState;
  setData: React.Dispatch<React.SetStateAction<Step2DataState>>;
}

export default function Step3MultiLegSchedule({
  data,
  setData,
}: Step3MultiLegScheduleProps) {
  const { legs, segmentPrices = {} } = data;

  const segments = React.useMemo(() => {
    const out: Array<{
      origin: string;
      dest: string;
      depTime: string;
      depMer: "AM" | "PM";
      arrTime: string;
      arrMer: "AM" | "PM";
      transport: "Ferry" | "Speedboat" | "Flight";
      startIdx: number;
      endIdx: number;
    }> = [];
    const seen = new Set<string>();

    for (let i = 0; i < legs.length; i++) {
      const first = legs[i];
      const {
        origin,
        departureTime: depTime,
        departureMeridiem: depMer,
      } = first;
      let curDest = origin,
        curArr = first.arrivalTime,
        curArrMer = first.arrivalMeridiem;
      const transport =
        first.routeResults.find((r) => r.id === first.selectedRouteId)
          ?.transportType ?? "Ferry";

      for (let j = i; j < legs.length; j++) {
        const leg = legs[j];
        if (j > i && leg.origin !== curDest) break;
        curDest = leg.destination;
        curArr = leg.arrivalTime;
        curArrMer = leg.arrivalMeridiem;
        const key = `${origin}-${curDest}-${i}-${j}`;
        if (!seen.has(key)) {
          seen.add(key);
          out.push({
            origin,
            dest: curDest,
            depTime,
            depMer,
            arrTime: curArr,
            arrMer: curArrMer,
            transport,
            startIdx: i,
            endIdx: j,
          });
        }
      }
    }
    return out;
  }, [legs]);

  const validSegments = React.useMemo(
    () =>
      segments.filter(({ startIdx, endIdx }) =>
        legs.slice(startIdx, endIdx + 1).every((l) => l.selectedRouteId != null)
      ),
    [segments, legs]
  );

  const firstKey =
    validSegments.length > 0
      ? `${validSegments[0].origin}-${validSegments[0].dest}-${validSegments[0].startIdx}-${validSegments[0].endIdx}`
      : null;
  const [openKey, setOpenKey] = React.useState<string | null>(firstKey);

  const handleSegmentPriceChange = React.useCallback(
    (
      segmentKey: string,
      field: keyof NonNullable<Step2DataState["segmentPrices"]>,
      value: number
    ) => {
      setData((d) => ({
        ...d,
        segmentPrices: {
          ...d.segmentPrices,
          [segmentKey]: {
            ...d.segmentPrices?.[segmentKey],
            [field]: value,
          },
        },
      }));
    },
    [setData]
  );

  return (
    <div className="space-y-6 p-6">
      <h3 className="text-lg font-semibold">Set Route Prices per Segment</h3>

      {validSegments.length === 0 && (
        <p className="text-gray-500">(no complete routes selected)</p>
      )}

      <div className="space-y-4">
        {validSegments.map(
          ({
            origin,
            dest,
            depTime,
            depMer,
            arrTime,
            arrMer,
            transport,
            startIdx,
            endIdx,
          }) => {
            const segKey = `${origin}-${dest}-${startIdx}-${endIdx}`;
            const isOpen = openKey === segKey;
            const stopCount = endIdx - startIdx;

            return (
              <Collapsible
                key={segKey}
                open={isOpen}
                onOpenChange={(open) => setOpenKey(open ? segKey : null)}
              >
                <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-gray-50 rounded-lg cursor-pointer">
                  <div className="flex items-center gap-2">
                    <span>
                      {origin} → {dest} • {depTime} {depMer} → {arrTime}{" "}
                      {arrMer}
                      {stopCount > 0 && (
                        <em className="ml-2 text-sm text-gray-500">
                          ({stopCount} {stopCount === 1 ? "stop" : "stops"})
                        </em>
                      )}
                    </span>
                    {transport === "Ferry" ? (
                      <ShipWheel className="h-5 w-5" />
                    ) : transport === "Speedboat" ? (
                      <Ship className="h-5 w-5" />
                    ) : (
                      <Plane className="h-5 w-5" />
                    )}
                  </div>
                  {isOpen ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </CollapsibleTrigger>

                <CollapsibleContent className="p-4">
                  <SegmentPrices
                    segKey={segKey}
                    prices={segmentPrices[segKey]}
                    onPriceChange={handleSegmentPriceChange}
                  />
                </CollapsibleContent>
              </Collapsible>
            );
          }
        )}
      </div>
    </div>
  );
}
