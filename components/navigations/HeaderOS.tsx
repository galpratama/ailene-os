import { Bell, ChevronRight, Plus } from "lucide-react";

export default function HeaderOS() {
  return (
    <header className="h-12 shrink-0 bg-white border-b border-gray-200 flex items-center justify-between px-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
        <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
        <span className="text-gray-800">Ailene Group</span>
        <ChevronRight size={12} className="text-gray-400" />
        <span className="text-gray-800">Workspace</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button className="flex items-center gap-1.5 h-8 px-3 text-xs font-semibold rounded-lg bg-green-600 text-white hover:bg-green-700 active:bg-green-800 transition-colors">
          <Plus size={13} />
          New Task
        </button>

        <button className="relative w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
          <Bell size={15} />
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center leading-none">
            3
          </span>
        </button>

        <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-xs font-bold text-white cursor-pointer">
          RR
        </div>
      </div>
    </header>
  );
}
