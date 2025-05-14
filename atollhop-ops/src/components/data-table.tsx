"use client";

import React, {
  useEffect,
  useTransition,
  useState,
  useMemo,
  useCallback,
} from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  ColumnDef,
  flexRender,
} from "@tanstack/react-table";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import dayjs from "dayjs";
import durationPlugin from "dayjs/plugin/duration";
import {
  MapPin,
  ArrowRight,
  Clock,
  ShipWheel,
  Ship,
  Plane,
  Truck,
  LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

dayjs.extend(durationPlugin);

export type RouteData = {
  id: string;
  route: string;
  duration: number;
  transportType: "Ferry" | "Speedboat" | "Flight";
};

interface DataTableProps {
  initialData: RouteData[];
  totalPages: number;
  initialPage: number;
}

function CellDisplay({
  Icon,
  children,
  iconBgClass = "bg-muted",
}: {
  Icon: LucideIcon;
  children: React.ReactNode;
  iconBgClass?: string;
}) {
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

function RouteDisplay({ route }: { route: string }) {
  const [from, to] = route.split(" -> ");
  return (
    <CellDisplay Icon={MapPin}>
      <span>{from}</span>
      <ArrowRight className="size-4 text-gray-500" />
      <span>{to}</span>
    </CellDisplay>
  );
}

function DurationDisplay({ duration }: { duration: number }) {
  const formattedDuration = dayjs
    .duration(duration, "minutes")
    .format("H[h] m[m]");
  return (
    <CellDisplay Icon={Clock}>
      <span>{formattedDuration}</span>
    </CellDisplay>
  );
}

export function DataTable({
  initialData,
  totalPages,
  initialPage,
}: DataTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [isLocalNavigating, setIsLocalNavigating] = useState(false);

  const currentPage = Number(searchParams.get("page")) || initialPage;

  const columns = useMemo<ColumnDef<RouteData>[]>(
    () => [
      {
        accessorKey: "route",
        header: () => (
          <div className="flex items-center gap-2">
            <MapPin className="size-4" />
            <span>Route</span>
          </div>
        ),
        cell: ({ getValue }) => <RouteDisplay route={getValue<string>()} />,
      },
      {
        accessorKey: "duration",
        header: () => (
          <div className="flex items-center gap-2">
            <Clock className="size-4" />
            <span>Duration</span>
          </div>
        ),
        cell: ({ getValue }) => (
          <DurationDisplay duration={getValue<number>()} />
        ),
      },
      {
        accessorKey: "transportType",
        header: () => (
          <div className="flex items-center gap-2">
            <Truck className="size-4" />
            <span>Transport Type</span>
          </div>
        ),
        cell: ({ getValue }) => {
          const transportType = getValue<"Ferry" | "Speedboat" | "Flight">();
          const icons: Record<"Ferry" | "Speedboat" | "Flight", LucideIcon> = {
            Ferry: ShipWheel,
            Speedboat: Ship,
            Flight: Plane,
          };
          const iconBgColors: Record<"Ferry" | "Speedboat" | "Flight", string> =
            {
              Ferry: "bg-blue-100",
              Speedboat: "bg-green-100",
              Flight: "bg-yellow-100",
            };
          return (
            <CellDisplay
              Icon={icons[transportType]}
              iconBgClass={iconBgColors[transportType]}
            >
              <span className="px-2 py-0.5 rounded-full text-sm font-medium">
                {transportType}
              </span>
            </CellDisplay>
          );
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data: initialData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  useEffect(() => {
    const rows = table.getRowModel().rows.map((row) => row.original);
    console.log("Table Data:", rows);
  }, [table]);

  const goToPage = useCallback(
    (pageNum: number) => {
      if (pageNum < 1 || pageNum > totalPages) return;
      setIsLocalNavigating(true);
      startTransition(() => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", String(pageNum));
        router.push(`?${params.toString()}`);
      });
    },
    [router, totalPages, searchParams]
  );

  useEffect(() => {
    setIsLocalNavigating(false);
  }, [searchParams]);

  function renderPageButtons() {
    const PAGES_TO_SHOW = 3;
    let start = currentPage - Math.floor(PAGES_TO_SHOW / 2);
    let end = start + PAGES_TO_SHOW - 1;

    if (start < 1) {
      start = 1;
      end = PAGES_TO_SHOW;
    }
    if (end > totalPages) {
      end = totalPages;
      start = Math.max(1, totalPages - PAGES_TO_SHOW + 1);
    }

    const buttons: React.ReactNode[] = [];

    if (start > 1) {
      buttons.push(
        <Button
          key="page-1"
          variant={currentPage === 1 ? "default" : "outline"}
          size="sm"
          onClick={() => goToPage(1)}
        >
          1
        </Button>
      );
      if (start > 2) {
        buttons.push(
          <span key="start-ellipsis" className="px-2">
            ...
          </span>
        );
      }
    }

    for (let i = start; i <= end; i++) {
      buttons.push(
        <Button
          key={i}
          variant={currentPage === i ? "default" : "outline"}
          size="sm"
          onClick={() => goToPage(i)}
        >
          {i}
        </Button>
      );
    }

    if (end < totalPages) {
      if (end < totalPages - 1) {
        buttons.push(
          <span key="end-ellipsis" className="px-2">
            ...
          </span>
        );
      }
      buttons.push(
        <Button
          key={totalPages}
          variant={currentPage === totalPages ? "default" : "outline"}
          size="sm"
          onClick={() => goToPage(totalPages)}
        >
          {totalPages}
        </Button>
      );
    }

    return buttons;
  }

  return (
    <div className="relative">
      {(!initialData || initialData.length === 0) && (
        <div className="min-h-[200px] flex items-center justify-center">
          <span className="text-gray-500">No data to show</span>
        </div>
      )}

      {initialData && initialData.length > 0 && (
        <div className="flex flex-col gap-4">
          {table.getRowModel().rows.map((row) => (
            <div
              key={row.id}
              className="flex items-center justify-between p-4 border rounded-md shadow-sm bg-white"
            >
              {row.getVisibleCells().map((cell) => (
                <div key={cell.id} className="flex-1">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-4">
          <Button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            Prev
          </Button>
          {renderPageButtons()}
          <Button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {(isLocalNavigating || isPending) && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-10">
          <Loader2 className="animate-spin h-10 w-10 text-gray-500" />
        </div>
      )}
    </div>
  );
}

export default DataTable;
