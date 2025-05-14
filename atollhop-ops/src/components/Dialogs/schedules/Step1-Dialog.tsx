"use client";

import * as React from "react";
import Image from "next/image";
import type { Step1ScheduleTypeProps } from "./types";

export default function Step1ScheduleType({
  scheduleType,
  onTypeSelect,
}: Step1ScheduleTypeProps) {
  return (
    <div className="grid gap-4">
      <h2 className="text-lg font-semibold">Select schedule type</h2>
      <div className="flex gap-4">
        <div
          onClick={() => onTypeSelect("single")}
          className={`flex-1 p-4 border rounded-md cursor-pointer hover:bg-gray-50 ${
            scheduleType === "single" ? "border-primary" : "border-gray-200"
          }`}
        >
          <Image
            src="/Single-Hop.svg"
            alt="Single"
            className="mx-auto"
            width={200}
            height={200}
          />
        </div>
        <div
          onClick={() => onTypeSelect("multi-hop")}
          className={`flex-1 p-4 border rounded-md cursor-pointer hover:bg-gray-50 ${
            scheduleType === "multi-hop" ? "border-primary" : "border-gray-200"
          }`}
        >
          <Image
            src="/Multi-Hop.svg"
            alt="Multi-Hop"
            className="mx-auto"
            width={200}
            height={200}
          />
        </div>
      </div>
    </div>
  );
}
