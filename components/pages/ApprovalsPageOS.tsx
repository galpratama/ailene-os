import { ThumbsUp } from "lucide-react";

export default function ApprovalsPageOS() {
  return (
    <div className="px-4 py-6 sm:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-100">Approvals</h2>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-0.5">Requests waiting for your action</p>
        </div>
        <button className="flex items-center gap-1.5 h-8 px-3 text-xs font-semibold rounded-lg bg-gray-900 text-white hover:bg-gray-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300 transition-colors">
          + New Approval
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto border-b border-gray-200 dark:border-zinc-800 mb-6">
        {["Pending", "Approved", "Rejected", "All"].map((tab, i) => (
          <button
            key={tab}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              i === 0
                ? "border-gray-900 text-gray-900 dark:border-zinc-100 dark:text-zinc-100"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Empty state */}
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-zinc-800 flex items-center justify-center mb-3">
          <ThumbsUp size={20} className="text-gray-400 dark:text-zinc-500" />
        </div>
        <p className="text-sm font-medium text-gray-600 dark:text-zinc-300">No pending approvals</p>
        <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">
          All caught up! Check back later.
        </p>
      </div>
    </div>
  );
}
