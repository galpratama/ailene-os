"use client";

import AppInput from "@/components/fields/AppInput";
import PageHeaderOS from "@/components/navigations/PageHeaderOS";
import type { LmsProjectEntry } from "@/apis/lms";
import { Building2, Layers, Search, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function LmsAdminProjectListOS({
  projects,
  loadError,
}: {
  projects: LmsProjectEntry[];
  loadError: string | null;
}) {
  const [keyword, setKeyword] = useState("");

  // The API returns every project in one go, so the search filters locally.
  const query = keyword.trim().toLowerCase();
  const visibleProjects = query
    ? projects.filter(
        (project) =>
          project.name.toLowerCase().includes(query) ||
          project.company_name.toLowerCase().includes(query)
      )
    : projects;

  return (
    <div className="flex flex-col gap-5 px-4 py-6 sm:px-8">
      <PageHeaderOS
        title="LMS"
        description="Manage who can access each LMS project and how they're grouped."
      />

      <AppInput
        inputId="lms-projects-search"
        icon={<Search size={14} />}
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="Search by project or company..."
        className="max-w-full sm:max-w-sm"
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {visibleProjects.map((project) => (
          <Link
            key={project.id}
            href={`/lms/${project.id}`}
            className="flex gap-4 rounded-xl border border-gray-300 bg-card-bg p-5 transition-colors hover:border-claude/60 dark:border-zinc-700"
          >
            <div className="flex size-12 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 dark:border-zinc-800 dark:bg-zinc-800">
              <Building2 size={20} className="text-gray-400" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-bold text-gray-900 dark:text-zinc-100">
                {project.name}
              </h3>
              <p className="mt-1 truncate text-xs text-gray-500">
                {project.company_name}
              </p>
              <div className="mt-3 flex items-center gap-4 text-xs font-semibold text-gray-500">
                <span className="flex items-center gap-1.5">
                  <Users size={13} />
                  {project.member_count}{" "}
                  {project.member_count === 1 ? "member" : "members"}
                </span>
                <span className="flex items-center gap-1.5">
                  <Layers size={13} />
                  {project.group_count}{" "}
                  {project.group_count === 1 ? "group" : "groups"}
                </span>
              </div>
            </div>
          </Link>
        ))}
        {visibleProjects.length === 0 && (
          <p
            className={`py-10 text-center text-sm sm:col-span-2 xl:col-span-3 ${loadError ? "text-merah" : "text-gray-400 dark:text-zinc-500"}`}
          >
            {loadError ??
              (query
                ? `No projects found for "${keyword.trim()}"`
                : "No projects yet.")}
          </p>
        )}
      </div>
    </div>
  );
}
