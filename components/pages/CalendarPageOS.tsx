"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

// Week starts on Monday (Indonesian convention)
const DAYS = ["SEN", "SEL", "RAB", "KAM", "JUM", "SAB", "MIN"];

const MONTHS_ID = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

const PRIORITY_LEGEND = [
  { label: "Urgent", color: "bg-red-500" },
  { label: "High", color: "bg-orange-500" },
  { label: "Medium", color: "bg-yellow-600" },
  { label: "Training", color: "bg-green-600" },
  { label: "Prep reminder", color: "bg-orange-300" },
];

const VIEW_OPTIONS = ["Deadline", "Start date", "Range", "Month", "Timeline"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

// Returns 0=Mon, 1=Tue, ..., 6=Sun
function getFirstDayMondayBased(year: number, month: number) {
  const dayOfWeek = new Date(year, month, 1).getDay(); // 0=Sun
  return (dayOfWeek + 6) % 7;
}

export default function CalendarPageOS() {
  const today = new Date();
  const [current, setCurrent] = useState({
    year: today.getFullYear(),
    month: today.getMonth(),
  });
  const [activeView, setActiveView] = useState("Month");

  const daysInMonth = getDaysInMonth(current.year, current.month);
  const firstDay = getFirstDayMondayBased(current.year, current.month);

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  // Pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null);

  const prev = () =>
    setCurrent((c) => {
      const m = c.month === 0 ? 11 : c.month - 1;
      const y = c.month === 0 ? c.year - 1 : c.year;
      return { year: y, month: m };
    });

  const next = () =>
    setCurrent((c) => {
      const m = c.month === 11 ? 0 : c.month + 1;
      const y = c.month === 11 ? c.year + 1 : c.year;
      return { year: y, month: m };
    });

  return (
    <div className="flex flex-col h-full px-8 py-6 gap-4">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-400 mb-1">Tasks &amp; Training</p>
          <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {MONTHS_ID[current.month]} {current.year}
          </p>
        </div>

        {/* View switcher + nav */}
        <div className="flex items-center gap-3 mt-1">
          <div className="flex items-center gap-1">
            <button
              onClick={prev}
              className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={next}
              className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-50 transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="flex items-center rounded-lg border border-gray-300 overflow-hidden">
            {VIEW_OPTIONS.map((v) => (
              <button
                key={v}
                onClick={() => setActiveView(v)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  activeView === v
                    ? "bg-gray-900 text-white"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Priority legend */}
      <div className="flex items-center gap-4">
        {PRIORITY_LEGEND.map((p) => (
          <div key={p.label} className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-sm ${p.color}`} />
            <span className="text-xs text-gray-600">{p.label}</span>
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="flex-1 bg-white rounded-xl border border-gray-300 overflow-hidden flex flex-col">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-gray-300">
          {DAYS.map((d) => (
            <div
              key={d}
              className="py-2.5 text-center text-xs font-semibold text-gray-400 tracking-wider"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Date rows */}
        <div className="flex-1 grid grid-cols-7 divide-x divide-y divide-gray-100">
          {cells.map((day, i) => {
            const isToday =
              day === today.getDate() &&
              current.month === today.getMonth() &&
              current.year === today.getFullYear();

            return (
              <div key={i} className="p-1.5 flex flex-col gap-1 min-h-28">
                {day && (
                  <span
                    className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full shrink-0 ${
                      isToday
                        ? "bg-gray-900 text-white font-bold"
                        : "text-gray-600"
                    }`}
                  >
                    {day}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
