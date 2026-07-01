import { ThumbsUp } from "lucide-react";

export default function ApprovalsPageOS() {
  return (
    <div className="px-8 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Approvals</h2>
          <p className="text-sm text-gray-500 mt-0.5">Requests waiting for your action</p>
        </div>
        <button className="flex items-center gap-1.5 h-8 px-3 text-xs font-semibold rounded-lg bg-gray-900 text-white hover:bg-gray-700 transition-colors">
          + New Approval
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-100 mb-6">
        {["Pending", "Approved", "Rejected", "All"].map((tab, i) => (
          <button
            key={tab}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              i === 0
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Empty state */}
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-3">
          <ThumbsUp size={20} className="text-gray-400" />
        </div>
        <p className="text-sm font-medium text-gray-600">No pending approvals</p>
        <p className="text-xs text-gray-400 mt-1">
          All caught up! Check back later.
        </p>
      </div>
    </div>
  );
}
