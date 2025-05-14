"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { Step2DataState, Step3ReviewScheduleProps } from "./types";

export default function Step3ReviewSchedule({
  scheduleType,
  data,
  setData,
}: Step3ReviewScheduleProps) {
  const handlePriceChange = React.useCallback(
    (
      field: keyof Pick<
        Step2DataState,
        | "localAdult"
        | "localChild"
        | "localInfant"
        | "expatAdult"
        | "expatChild"
        | "expatInfant"
        | "touristAdult"
        | "touristChild"
        | "touristInfant"
      >,
      value: string
    ) => {
      setData((prev) => ({ ...prev, [field]: value }));
    },
    [setData]
  );

  // only one section open at a time
  const [openSection, setOpenSection] = React.useState<
    "local" | "expat" | "tourist"
  >("local");

  const sections: {
    key: "local" | "expat" | "tourist";
    label: string;
    fields: readonly [string, keyof Step2DataState][];
    suffix: string;
  }[] = [
    {
      key: "local",
      label: "Local",
      suffix: "Rf",
      fields: [
        ["Adult", "localAdult"],
        ["Child", "localChild"],
        ["Infant", "localInfant"],
      ],
    },
    {
      key: "expat",
      label: "Expat",
      suffix: "Rf",
      fields: [
        ["Adult", "expatAdult"],
        ["Child", "expatChild"],
        ["Infant", "expatInfant"],
      ],
    },
    {
      key: "tourist",
      label: "Tourist",
      suffix: "USD",
      fields: [
        ["Adult", "touristAdult"],
        ["Child", "touristChild"],
        ["Infant", "touristInfant"],
      ],
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <p className="text-lg font-semibold">
        Review your {scheduleType === "single" ? "Single" : "Multi‑hop"} Schedule
      </p>

      <div className="border rounded-lg divide-y">
        {sections.map(({ key, label, fields, suffix }) => (
          <Collapsible
            key={key}
            open={openSection === key}
            onOpenChange={(isOpen) =>
              setOpenSection(isOpen ? key : openSection)
            }
          >
            <CollapsibleTrigger
              className="flex justify-between items-center px-4 py-2 cursor-pointer"
            >
              <span className="font-medium">{label}</span>
              {openSection === key ? <ChevronUp /> : <ChevronDown />}
            </CollapsibleTrigger>

            {openSection === key && (
              <CollapsibleContent className="px-4 py-2 space-y-4">
                {fields.map(([fieldLabel, fieldKey]) => (
                  <div key={fieldKey} className="flex items-center gap-4">
                    <Label className="w-24">{fieldLabel}</Label>
                    <Input
                      type="text"
                      value={data[fieldKey] !== undefined ? data[fieldKey]!.toString() : "0"}
                      onChange={(e) =>
                        handlePriceChange(
                          fieldKey as "localAdult" | "localChild" | "localInfant" | "expatAdult" | "expatChild" | "expatInfant" | "touristAdult" | "touristChild" | "touristInfant",
                          e.target.value
                        )
                      }
                      className="w-32"
                      placeholder="0"
                    />
                    <span className="ml-auto text-gray-500">{suffix}</span>
                  </div>
                ))}
              </CollapsibleContent>
            )}
          </Collapsible>
        ))}
      </div>
    </div>
  );
}
