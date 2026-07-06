import { FolderOpen } from "lucide-react";

export default function ProjectsPageOS() {
  return (
    <div className="px-8 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-100">Projects</h2>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-0.5">Track progress across all projects</p>
        </div>
        <button className="flex items-center gap-1.5 h-8 px-3 text-xs font-semibold rounded-lg bg-gray-900 text-white hover:bg-gray-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300 transition-colors">
          + New Project
        </button>
      </div>

      {/* Empty state */}
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-zinc-800 flex items-center justify-center mb-3">
          <FolderOpen size={20} className="text-gray-400 dark:text-zinc-500" />
        </div>
        <p className="text-sm font-medium text-gray-600 dark:text-zinc-300">No projects yet</p>
        <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">
          Create your first project to get started.
        </p>
      </div>
    </div>
  );
}
