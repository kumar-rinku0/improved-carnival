"use client";

import React, { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { ReusableDataTable } from "@/components/Tables/ReusableDataTable";
import {
  ArrowRight,
  Clock,
  Calendar,
  ShipWheel,
  Ship,
  Plane,
  LucideIcon,
  Timer,
} from "lucide-react";
import dayjs from "dayjs";
import { cn } from "@/lib/utils";

export type RouteData = {
  id: string;
  route: string;
  routeCode?: string;
  transportType: "Ferry" | "Speedboat" | "Flight";
  departureTime: string;
  arrivalTime: string;
  scheduleDays: string[];
};

interface IconCellProps {
  Icon: LucideIcon;
  children: React.ReactNode;
  iconBgClass?: string;
}

function IconCell({ Icon, children, iconBgClass = "bg-muted" }: IconCellProps) {
  return (
    <div className="flex items-center gap-3">
      <div className={cn("flex-shrink-0 rounded-full p-1.5", iconBgClass)}>
        <Icon className="size-4" />
      </div>
      <div className="flex flex-col gap-1 text-sm font-medium">{children}</div>
    </div>
  );
}

function RouteCell({
  value,
  routeCode = "",
}: {
  value: string;
  routeCode?: string;
}) {
  const [from, to] = value.split(" -> ");

  return (
    <IconCell Icon={Calendar}>
      <div>
        <div className="flex items-center gap-1">
          <span>{from}</span>
          <ArrowRight className="size-4 text-gray-500" />
          <span>{to}</span>
        </div>
        {routeCode && (
          <div className="mt-1 text-xs text-gray-600">{routeCode}</div>
        )}
      </div>
    </IconCell>
  );
}

function TimeCell({
  departure,
  arrival,
}: {
  departure: string;
  arrival: string;
}) {
  const baseDate = "2000-01-01 ";

  const departureTime = dayjs(baseDate + departure, [
    "YYYY-MM-DD HH:mm:ss",
    "YYYY-MM-DD HH:mm",
  ]);
  const arrivalTime = dayjs(baseDate + arrival, [
    "YYYY-MM-DD HH:mm:ss",
    "YYYY-MM-DD HH:mm",
  ]);

  const departureFormatted = departureTime.isValid()
    ? departureTime.format("HH:mm")
    : departure;
  const arrivalFormatted = arrivalTime.isValid()
    ? arrivalTime.format("HH:mm")
    : arrival;

  return (
    <IconCell Icon={Clock}>
      <div className="flex flex-col text-left">
        <span>
          {departureFormatted} - {arrivalFormatted}
        </span>
      </div>
    </IconCell>
  );
}

function TransportTypeCell({
  value,
}: {
  value: "Ferry" | "Speedboat" | "Flight";
}) {
  const icons: Record<"Ferry" | "Speedboat" | "Flight", LucideIcon> = {
    Ferry: ShipWheel,
    Speedboat: Ship,
    Flight: Plane,
  };
  const iconBgColors: Record<"Ferry" | "Speedboat" | "Flight", string> = {
    Ferry: "bg-blue-100",
    Speedboat: "bg-green-100",
    Flight: "bg-yellow-100",
  };
  return (
    <IconCell Icon={icons[value]} iconBgClass={iconBgColors[value]}>
      <span className="px-2 py-0.5 rounded-full text-sm font-medium">
        {value}
      </span>
    </IconCell>
  );
}

function ScheduleDaysCell({ value }: { value: string[] }) {
  const abbreviatedDays = value.map((day) => {
    const trimmed = day.slice(0, 3);
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
  });
  const scheduleText = abbreviatedDays.join(", ");
  return (
    <IconCell Icon={Timer} iconBgClass="bg-purple-100">
      <span className="px-2 py-0.5 rounded-full text-sm font-medium">
        {scheduleText}
      </span>
    </IconCell>
  );
}

const routeColumns: ColumnDef<RouteData>[] = [
  {
    header: "Route",
    cell: ({ row }) => (
      <RouteCell
        value={row.original.route || ""}
        routeCode={row.original.routeCode || ""}
      />
    ),
  },
  {
    header: "Time",
    cell: ({ row }) => (
      <TimeCell
        departure={row.original.departureTime}
        arrival={row.original.arrivalTime}
      />
    ),
  },
  {
    accessorKey: "transportType",
    header: "Transport Type",
    cell: ({ getValue }) => (
      <TransportTypeCell value={getValue<"Ferry" | "Speedboat" | "Flight">()} />
    ),
  },
  {
    accessorKey: "scheduleDays",
    header: "Schedule Days",
    cell: ({ getValue }) => <ScheduleDaysCell value={getValue<string[]>()} />,
  },
];

export interface RouteTableProps {
  routes: RouteData[];
  totalPages: number;
  initialPage: number;
}

export function RouteTable({
  routes,
  totalPages,
  initialPage,
}: RouteTableProps) {
  const columns = useMemo(() => routeColumns, []);
  return (
    <ReusableDataTable<RouteData>
      data={routes}
      columns={columns}
      totalPages={totalPages}
      initialPage={initialPage}
    />
  );
}

export default RouteTable;
