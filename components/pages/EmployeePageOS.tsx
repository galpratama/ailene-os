import { Users } from "lucide-react";

export default function EmployeePageOS() {
  return (
    <div className="px-8 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-100">Employee</h2>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-0.5">Manage your team members</p>
        </div>
      </div>

      {/* Empty state */}
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-zinc-800 flex items-center justify-center mb-3">
          <Users size={20} className="text-gray-400 dark:text-zinc-500" />
        </div>
        <p className="text-sm font-medium text-gray-600 dark:text-zinc-300">No employees yet</p>
        <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">
          Employee data will appear here.
        </p>
      </div>
    </div>
  );
}
