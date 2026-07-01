import { AlertCircle, CheckSquare, Clock, Zap } from "lucide-react";

const stats = [
  {
    label: "Pending Approvals",
    value: 0,
    icon: AlertCircle,
    color: "text-amber-500",
    bg: "bg-amber-50",
  },
  {
    label: "My Tasks Today",
    value: 0,
    icon: CheckSquare,
    color: "text-blue-500",
    bg: "bg-blue-50",
  },
  {
    label: "Team Overdue",
    value: 0,
    icon: Clock,
    color: "text-red-500",
    bg: "bg-red-50",
  },
  {
    label: "Active Tasks",
    value: 0,
    icon: Zap,
    color: "text-green-500",
    bg: "bg-green-50",
  },
];

const aiActivities = [
  "No AI activity recorded in the last 24 hours.",
];

export default function HomePageOS() {
  return (
    <div className="flex flex-col min-h-full">
      {/* Greeting */}
      <div className="bg-neutral-50 border-b border-gray-100 px-8 py-6">
        <p className="text-xs text-neutral-400 uppercase tracking-wider font-medium mb-1">
          {new Date().toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
        <h1 className="text-2xl font-bold text-gray-900">Good morning, Akmal 👋</h1>
        <p className="text-sm text-gray-500 mt-1">You have no tasks due today.</p>
      </div>

      <div className="flex-1 px-8 py-6 flex flex-col gap-6">
        {/* Stat cards */}
        <div className="grid grid-cols-4 gap-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="bg-white rounded-xl border border-gray-100 p-5 flex flex-col gap-3"
            >
              <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center`}>
                <s.icon size={16} className={s.color} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* AI activity */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                24 Jam Terakhir
              </span>
              <span className="px-1.5 py-0.5 rounded text-xs bg-neutral-100 text-neutral-500">
                AI Summary
              </span>
            </div>
            <ul className="flex flex-col gap-2">
              {aiActivities.map((a, i) => (
                <li key={i} className="flex gap-2 text-sm text-gray-600">
                  <span className="w-1 h-1 rounded-full bg-gray-300 mt-2 shrink-0" />
                  {a}
                </li>
              ))}
            </ul>
          </div>

          {/* Needs attention */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-4">
              Needs Your Attention
            </p>
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-xs font-medium text-gray-700 mb-2">
                  Approvals waiting on you
                </p>
                <p className="text-sm text-gray-400 italic">No pending approvals.</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-700 mb-2">Your tasks</p>
                <p className="text-sm text-gray-400 italic">No overdue or due-today tasks.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
