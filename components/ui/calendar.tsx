"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import * as React from "react";
import { DayPicker } from "react-day-picker";
import { es } from "react-day-picker/locale";

import { cn } from "@/lib/utils";

type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      locale={es}
      showOutsideDays={showOutsideDays}
      className={cn("text-navy", className)}
      classNames={{
        months: "relative flex flex-col gap-4",
        month: "flex flex-col gap-3",
        month_caption: "flex h-8 items-center justify-center",
        caption_label: "text-sm font-semibold capitalize text-navy",
        nav: "absolute inset-x-0 top-0 flex items-center justify-between",
        button_previous:
          "inline-flex h-7 w-7 items-center justify-center idp-radius-md rounded-md border border-border bg-white text-muted transition-colors hover:bg-surface hover:text-navy disabled:opacity-40",
        button_next:
          "inline-flex h-7 w-7 items-center justify-center idp-radius-md rounded-md border border-border bg-white text-muted transition-colors hover:bg-surface hover:text-navy disabled:opacity-40",
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday: "w-8 text-[0.7rem] font-medium uppercase text-muted",
        week: "mt-1 flex w-full",
        day: "relative h-8 w-8 p-0 text-center text-sm",
        day_button:
          "inline-flex h-8 w-8 items-center justify-center idp-radius-md rounded-md text-navy transition-colors hover:bg-surface aria-selected:opacity-100",
        today: "font-semibold text-blue-accent",
        outside: "text-muted/50",
        disabled: "text-muted/40 opacity-50",
        selected: "[&>button]:bg-navy [&>button]:text-white [&>button]:hover:bg-navy-deep",
        range_start:
          "[&>button]:bg-navy [&>button]:text-white [&>button]:rounded-r-none [&>button]:hover:bg-navy-deep",
        range_end:
          "[&>button]:bg-navy [&>button]:text-white [&>button]:rounded-l-none [&>button]:hover:bg-navy-deep",
        range_middle:
          "bg-blue-light [&:first-child]:rounded-l-md [&:last-child]:rounded-r-md [&>button]:rounded-none [&>button]:bg-transparent [&>button]:text-navy [&>button]:hover:bg-blue-light",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === "left" ? (
            <ChevronLeft className="size-4" strokeWidth={2} aria-hidden />
          ) : (
            <ChevronRight className="size-4" strokeWidth={2} aria-hidden />
          ),
      }}
      {...props}
    />
  );
}

export { Calendar };
