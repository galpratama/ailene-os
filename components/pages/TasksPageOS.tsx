"use client";

import { ChevronDown, Plus, SlidersHorizontal } from "lucide-react";
import { useState } from "react";

const COLUMNS = [
  { id: "not_yet", label: "NOT YET", color: "bg-gray-200 text-gray-600" },
  { id: "todo", label: "TO DO", color: "bg-blue-100 text-blue-700" },
  { id: "in_progress", label: "IN PROGRESS", color: "bg-amber-100 text-amber-700" },
  { id: "review", label: "REVIEW", color: "bg-purple-100 text-purple-700" },
  { id: "revision", label: "REVISION", color: "bg-orange-100 text-orange-700" },
];

const SHOW_OPTIONS = ["Active", "Due Today", "Overdue", "Done", "All"];

export default function TasksPageOS() {
  const [activeShow, setActiveShow] = useState("Active");

  return (
    <div className="flex flex-col h-full">
      {/* Filter bar */}
      <div className="px-6 py-3 border-b border-gray-200 flex items-center gap-3">
        <div className="flex items-center gap-1 text-xs">
          <span className="font-semibold text-gray-500 mr-1">SHOW</span>
          {SHOW_OPTIONS.map((opt) => (
            <button
              key={opt}
              onClick={() => setActiveShow(opt)}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                activeShow === opt
                  ? "bg-gray-900 text-white"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>

        <div className="w-px h-4 bg-gray-200 mx-1" />

        <button className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 transition-colors">
          <SlidersHorizontal size={12} />
          <span className="font-medium">ASSIGNEE</span>
          <ChevronDown size={11} />
        </button>

        <button className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 transition-colors">
          <span className="font-medium">COMPANY</span>
          <ChevronDown size={11} />
        </button>

        <div className="ml-auto">
          <button className="flex items-center gap-1.5 h-8 px-3 text-xs font-semibold rounded-lg bg-gray-900 text-white hover:bg-gray-700 transition-colors">
            <Plus size={13} />
            New Task
          </button>
        </div>
      </div>

      {/* Kanban board */}
      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-4 p-6 h-full min-w-max">
          {COLUMNS.map((col) => (
            <div key={col.id} className="w-72 flex flex-col gap-3">
              {/* Column header */}
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded text-xs font-bold ${col.color}`}
                >
                  {col.label}
                </span>
                <span className="text-xs text-gray-400">0</span>
              </div>

              {/* Empty column */}
              <div className="flex-1 min-h-32 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center">
                <p className="text-xs text-gray-300">No tasks</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
