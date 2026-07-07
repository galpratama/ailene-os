"use client";

import AppButton from "@/components/buttons/AppButton";
import CalendarActionModalOS, {
  CalendarActionModalEvent,
} from "@/components/modals/CalendarActionModalOS";
import { setSessionToken, trpc } from "@/trpc/client";
import type { B2BActionPriorityEnum } from "@prisma/client";
import {
  CalendarClock,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const DAYS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

const priorityStyles: Record<
  B2BActionPriorityEnum,
  { label: string; dot: string; chip: string }
> = {
  LOW: {
    label: "Low",
    dot: "bg-gray-400",
    chip: "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700",
  },
  MEDIUM: {
    label: "Medium",
    dot: "bg-biru",
    chip: "bg-biru-t text-blue-700 hover:bg-biru-t/80 dark:bg-blue-500/10 dark:text-blue-300 dark:hover:bg-blue-500/20",
  },
  HIGH: {
    label: "High",
    dot: "bg-oranye",
    chip: "bg-oranye-t text-oranye hover:bg-oranye-t/80 dark:bg-orange-500/10 dark:text-orange-300 dark:hover:bg-orange-500/20",
  },
  URGENT: {
    label: "Urgent",
    dot: "bg-merah",
    chip: "bg-merah-t text-merah hover:bg-merah-t/80 dark:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-500/20",
  },
};

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function addDays(date: Date, days: number) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

function getMonthStart(year: number, month: number) {
  return new Date(year, month, 1);
}

function getVisibleStart(year: number, month: number) {
  const firstDay = getMonthStart(year, month);
  const mondayBasedDay = (firstDay.getDay() + 6) % 7;
  return addDays(firstDay, -mondayBasedDay);
}

function dateKey(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function dateKeyFromValue(value: string | Date | null) {
  if (!value) return "";
  const date = new Date(value);
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

function formatDate(value: Date) {
  return value.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatMonth(value: Date) {
  return value.toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });
}

export default function CalendarPageOS({
  sessionToken,
}: {
  sessionToken: string;
}) {
  useEffect(() => {
    if (sessionToken) setSessionToken(sessionToken);
  }, [sessionToken]);

  const today = useMemo(() => new Date(), []);
  const [current, setCurrent] = useState({
    year: today.getFullYear(),
    month: today.getMonth(),
  });
  const [selectedEvent, setSelectedEvent] =
    useState<CalendarActionModalEvent | null>(null);

  const visibleStart = useMemo(
    () => getVisibleStart(current.year, current.month),
    [current.month, current.year]
  );
  const visibleDays = useMemo(
    () => Array.from({ length: 42 }, (_, i) => addDays(visibleStart, i)),
    [visibleStart]
  );
  const visibleEnd = visibleDays[visibleDays.length - 1];

  const { data, isLoading, isError } = trpc.list.b2b.calendar.useQuery(
    {
      start_date: dateKey(visibleStart),
      end_date: dateKey(visibleEnd),
    },
    { enabled: !!sessionToken }
  );

  const eventsByDate = useMemo(() => {
    const grouped = new Map<string, CalendarActionModalEvent[]>();
    for (const event of data?.list ?? []) {
      const key = dateKeyFromValue(event.due_date);
      if (!key) continue;
      grouped.set(key, [...(grouped.get(key) ?? []), event]);
    }
    return grouped;
  }, [data?.list]);

  const goToPreviousMonth = () =>
    setCurrent((value) => {
      const month = value.month === 0 ? 11 : value.month - 1;
      const year = value.month === 0 ? value.year - 1 : value.year;
      return { year, month };
    });

  const goToNextMonth = () =>
    setCurrent((value) => {
      const month = value.month === 11 ? 0 : value.month + 1;
      const year = value.month === 11 ? value.year + 1 : value.year;
      return { year, month };
    });

  const goToToday = () =>
    setCurrent({ year: today.getFullYear(), month: today.getMonth() });

  const currentMonth = getMonthStart(current.year, current.month);
  const todayKey = dateKey(today);

  return (
    <div className="min-h-full px-4 py-6 sm:px-8">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-medium text-gray-400 dark:text-zinc-500">
            Tasks &amp; Training
          </p>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-zinc-100">
            Calendar
          </h1>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-zinc-400">
            {formatDate(visibleStart)} - {formatDate(visibleEnd)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <AppButton
            type="button"
            variant="outline"
            size="sm"
            onClick={goToToday}
          >
            <CalendarDays size={13} />
            Today
          </AppButton>
          <div className="flex items-center gap-1">
            <AppButton
              type="button"
              variant="outline"
              size="iconSm"
              onClick={goToPreviousMonth}
              aria-label="Previous month"
            >
              <ChevronLeft size={14} />
            </AppButton>
            <AppButton
              type="button"
              variant="outline"
              size="iconSm"
              onClick={goToNextMonth}
              aria-label="Next month"
            >
              <ChevronRight size={14} />
            </AppButton>
          </div>
          <div className="flex h-8 items-center rounded-lg border border-gray-300 bg-gray-50 px-3 text-xs font-semibold text-gray-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            Month
          </div>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-100">
          {formatMonth(currentMonth)}
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          {Object.entries(priorityStyles).map(([priority, style]) => (
            <div key={priority} className="flex items-center gap-1.5">
              <span className={`size-2 rounded-full ${style.dot}`} />
              <span className="text-xs text-gray-600 dark:text-zinc-400">
                {style.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {isError && (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300">
          Failed to load calendar actions. You may not have access to this data.
        </p>
      )}

      <div className="overflow-x-auto rounded-xl border border-dashboard-border bg-card-bg">
        <div className="min-w-220">
          <div className="grid grid-cols-7 border-b border-dashboard-border bg-dashboard-bg">
            {DAYS.map((day) => (
              <div
                key={day}
                className="px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-zinc-500"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {visibleDays.map((day, index) => {
              const key = dateKey(day);
              const isCurrentMonth = day.getMonth() === current.month;
              const isToday = key === todayKey;
              const events = eventsByDate.get(key) ?? [];
              const isLastColumn = index % 7 === 6;
              const isLastRow = index >= 35;

              return (
                <div
                  key={key}
                  className={[
                    "min-h-36 border-gray-200 p-2 dark:border-zinc-800",
                    isLastColumn ? "" : "border-r",
                    isLastRow ? "" : "border-b",
                    isCurrentMonth ? "bg-card-bg" : "bg-dashboard-bg/70",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={[
                        "flex size-6 items-center justify-center rounded-full text-xs font-semibold",
                        isToday
                          ? "bg-claude text-white"
                          : isCurrentMonth
                            ? "text-gray-700 dark:text-zinc-300"
                            : "text-gray-400 dark:text-zinc-600",
                      ].join(" ")}
                    >
                      {day.getDate()}
                    </span>
                    {events.length > 0 && (
                      <span className="flex items-center gap-1 text-[11px] font-medium text-gray-400 dark:text-zinc-500">
                        <CalendarClock size={11} />
                        {events.length}
                      </span>
                    )}
                  </div>

                  <div className="mt-2 flex flex-col gap-1.5">
                    {events.map((event) => {
                      const style = priorityStyles[event.priority];
                      return (
                        <AppButton
                          key={event.id}
                          type="button"
                          variant="ghost"
                          size="sm"
                          className={`h-auto min-h-7 w-full justify-start rounded-md px-1.5 py-1 ${style.chip}`}
                          onClick={() => setSelectedEvent(event)}
                        >
                          <span
                            className={`mt-1 size-1.5 shrink-0 rounded-full ${style.dot}`}
                          />
                          <span className="min-w-0 flex-1 truncate text-left text-xs font-semibold">
                            {event.title}
                          </span>
                        </AppButton>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="mt-4 flex items-center gap-2 text-sm text-gray-400 dark:text-zinc-500">
          <Loader2 size={15} className="animate-spin" />
          Loading calendar actions...
        </div>
      )}

      <CalendarActionModalOS
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  );
}
