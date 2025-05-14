"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon, X } from "lucide-react";
import { DateRange as DayPickerDateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

export interface DatePickerWithRangeProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  onChange?: (range: DateRange) => void;
  disabled?: boolean;
}

export function DatePickerWithRange({
  className,
  onChange,
  disabled = false,
  ...props
}: DatePickerWithRangeProps) {
  const [dateRange, setDateRange] = React.useState<DateRange>({
    start: null,
    end: null,
  });

  React.useEffect(() => {
    if (disabled) {
      const clearedRange = { start: null, end: null };
      setDateRange(clearedRange);
      onChange?.(clearedRange);
    }
  }, [disabled, onChange]);

  const handleSelect = (selected: DayPickerDateRange | undefined) => {
    if (disabled) return;
    const newRange: DateRange = {
      start: selected?.from ?? null,
      end: selected?.to ?? null,
    };
    setDateRange(newRange);
    onChange?.(newRange);
  };

  const clearInput = (e: React.MouseEvent<HTMLSpanElement>) => {
    e.stopPropagation();
    const clearedRange = { start: null, end: null };
    setDateRange(clearedRange);
    onChange?.(clearedRange);
  };

  return (
    <div className={cn("grid gap-2", className)} {...props}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            disabled={disabled}
            className={cn(
              "w-[250px] justify-start text-left font-normal flex items-center",
              !dateRange.start && "text-muted-foreground",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <CalendarIcon className="mr-2" />
            <div className="flex-1">
              {dateRange.start ? (
                dateRange.end ? (
                  format(dateRange.start, "LLL dd, y") +
                  " - " +
                  format(dateRange.end, "LLL dd, y")
                ) : (
                  format(dateRange.start, "LLL dd, y")
                )
              ) : (
                <span>Select dates</span>
              )}
            </div>
            {dateRange.start && !disabled && (
              <span onClick={clearInput} className="cursor-pointer">
                <X className="h-4 w-4" />
              </span>
            )}
          </Button>
        </PopoverTrigger>
        {}
        {!disabled && (
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange.start ?? undefined}
              selected={{
                from: dateRange.start ?? undefined,
                to: dateRange.end ?? undefined,
              }}
              onSelect={handleSelect}
              numberOfMonths={2}
            />
          </PopoverContent>
        )}
      </Popover>
    </div>
  );
}
