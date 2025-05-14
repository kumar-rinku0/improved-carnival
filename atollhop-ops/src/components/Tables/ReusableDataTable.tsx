"use client";

import React, { useCallback, useEffect, useState, useTransition } from "react";
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

export interface ReusableDataTableProps<T extends object> {
  data: T[];
  columns: ColumnDef<T>[];
  totalPages: number;
  initialPage: number;
}

export function ReusableDataTable<T extends object>({
  data,
  columns,
  totalPages,
  initialPage,
}: ReusableDataTableProps<T>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [isLocalNavigating, setIsLocalNavigating] = useState(false);

  const currentPage = Number(searchParams.get("page")) || initialPage;

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  useEffect(() => {
    setIsLocalNavigating(false);
  }, [searchParams]);

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
      {data.length === 0 ? (
        <div className="min-h-[200px] flex items-center justify-center">
          <span className="text-gray-500">No data to show</span>
        </div>
      ) : (
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

export default ReusableDataTable;
