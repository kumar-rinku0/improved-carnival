"use client";

import React, { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { ReusableDataTable } from "@/components/Tables/ReusableDataTable";
import {
  MapPin,
  ArrowRight,
  Clock,
  ShipWheel,
  Ship,
  Plane,
  LucideIcon,
} from "lucide-react";
import dayjs from "dayjs";
import durationPlugin from "dayjs/plugin/duration";
import { cn } from "@/lib/utils";

dayjs.extend(durationPlugin);

export type RouteData = {
  id: string;
  route: string;
  duration: number;
  transportType: "Ferry" | "Speedboat" | "Flight";
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
      <div className="flex items-center gap-1.5 text-sm font-medium">
        {children}
      </div>
    </div>
  );
}

function RouteCell({ value }: { value: string }) {
  const [from, to] = value.split(" -> ");
  return (
    <IconCell Icon={MapPin}>
      <span>{from}</span>
      <ArrowRight className="size-4 text-gray-500" />
      <span>{to}</span>
    </IconCell>
  );
}

function DurationCell({ value }: { value: number }) {
  const formattedDuration = dayjs
    .duration(value, "minutes")
    .format("H[h] m[m]");
  return (
    <IconCell Icon={Clock}>
      <span>{formattedDuration}</span>
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

const routeColumns: ColumnDef<RouteData>[] = [
  {
    accessorKey: "route",
    header: "Route",
    cell: ({ getValue }) => <RouteCell value={getValue<string>()} />,
  },
  {
    accessorKey: "duration",
    header: "Duration",
    cell: ({ getValue }) => <DurationCell value={getValue<number>()} />,
  },
  {
    accessorKey: "transportType",
    header: "Transport Type",
    cell: ({ getValue }) => (
      <TransportTypeCell value={getValue<"Ferry" | "Speedboat" | "Flight">()} />
    ),
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
