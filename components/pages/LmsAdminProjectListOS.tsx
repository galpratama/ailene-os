"use client";

import type { LmsProjectEntry } from "@/apis/lms";
import AppInput from "@/components/fields/AppInput";
import LmsProjectFormOS from "@/components/forms/LmsProjectFormOS";
import PageHeaderOS from "@/components/navigations/PageHeaderOS";
import { requireApiData } from "@/lib/api-result";
import { listLmsProjects } from "@/lib/actions";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  Building2,
  CalendarDays,
  Layers3,
  Plus,
  Search,
  Users,
} from "lucide-react";
import { useState } from "react";

function initialsOf(value: string) {
  const words = value.trim().split(/\s+/);
  return ((words[0]?.[0] ?? "") + (words[1]?.[0] ?? "")).toUpperCase() || "?";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function ProjectLogo({ project }: { project: LmsProjectEntry }) {
  const company = project.company_name ?? project.name;
  return (
    <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-line bg-gray-50 text-sm font-semibold text-gray-500 dark:bg-zinc-800 dark:text-zinc-300">
      {project.company_image_url ? (
        <div
          role="img"
          aria-label={`${company} logo`}
          className="size-full bg-contain bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${JSON.stringify(project.company_image_url)})` }}
        />
      ) : (
        initialsOf(company)
      )}
    </div>
  );
}

function ProjectCard({ project }: { project: LmsProjectEntry }) {
  return (
    <Link
      href={`/lms/${project.id}`}
      aria-label={`Open ${project.name}`}
      className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-claude dark:focus-visible:ring-lime-bright"
    >
      <article className="flex flex-col overflow-hidden rounded-xl border border-line bg-card-bg transition-colors group-hover:border-claude/50">
        <div className="flex flex-1 flex-col p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <ProjectLogo project={project} />
            <div className="min-w-0 flex-1">
              <h3 className="line-clamp-1 text-sm font-semibold text-gray-900 dark:text-zinc-100">
                {project.name}
              </h3>
              <p className="mt-0.5 truncate text-xs text-gray-400 dark:text-zinc-500">
                {project.company_name ?? "No company linked"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 border-t border-line-soft px-4 py-3 sm:px-5">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-zinc-400">
            <span className="inline-flex items-center gap-1.5">
              <Users size={12} />
              {project.member_count} members
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Layers3 size={12} />
              {project.group_count} groups
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays size={12} />
              Updated {formatDate(project.updated_at)}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

export default function LmsAdminProjectListOS({
  projects: initialProjects,
  sessionToken,
  loadError,
}: {
  projects: LmsProjectEntry[];
  sessionToken: string;
  loadError: string | null;
}) {
  const [keyword, setKeyword] = useState("");
  const [isProjectFormOpen, setIsProjectFormOpen] = useState(false);

  const projectsQuery = useQuery({
    queryKey: ["lms-projects"],
    queryFn: async () => requireApiData(await listLmsProjects()),
    enabled: !!sessionToken,
    initialData: loadError ? undefined : initialProjects,
  });
  const projects = projectsQuery.data ?? initialProjects;

  const query = keyword.trim().toLowerCase();
  const visibleProjects = query
    ? projects.filter(
        (project) =>
          project.name.toLowerCase().includes(query) ||
          project.company_name?.toLowerCase().includes(query) ||
          project.company_slug?.toLowerCase().includes(query),
      )
    : projects;
  const errorMessage = projectsQuery.isSuccess
    ? null
    : (projectsQuery.error?.message ?? loadError);

  return (
    <div className="flex flex-col gap-5 px-4 py-6 sm:px-8">
      <PageHeaderOS
        title="LMS"
        description="Manage learning projects, members, groups, content, and insights."
        action={{
          label: "New project",
          icon: Plus,
          onClick: () => setIsProjectFormOpen(true),
        }}
      />

      <div className="flex items-center justify-between gap-4">
        <AppInput
          inputId="lms-projects-search"
          icon={<Search size={14} />}
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="Search by project or company..."
          className="max-w-full sm:max-w-sm"
        />
        <p className="hidden text-xs text-gray-400 sm:block">
          {projects.length} {projects.length === 1 ? "project" : "projects"}
        </p>
      </div>

      {projectsQuery.isLoading && (
        <p className="py-10 text-center text-sm text-gray-400">Loading projects...</p>
      )}

      {!projectsQuery.isLoading && visibleProjects.length > 0 && (
        <div className="grid gap-5 xl:grid-cols-2">
          {visibleProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      {!projectsQuery.isLoading && visibleProjects.length === 0 && (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-line px-6 py-14 text-center">
          <div className="flex size-11 items-center justify-center rounded-xl border border-line-soft bg-gray-50 dark:bg-zinc-800">
            <Building2 size={19} className="text-gray-400" />
          </div>
          <p className={`mt-3 text-sm font-semibold ${errorMessage ? "text-merah" : "text-gray-700 dark:text-zinc-200"}`}>
            {errorMessage ?? (query ? "No matching projects" : "No projects yet")}
          </p>
          {!errorMessage && (
            <p className="mt-1 text-xs text-gray-400 dark:text-zinc-500">
              {query
                ? `Nothing matched “${keyword.trim()}”.`
                : "Create a project to start organizing LMS members and content."}
            </p>
          )}
        </div>
      )}

      <LmsProjectFormOS
        project={null}
        isOpen={isProjectFormOpen}
        onClose={() => setIsProjectFormOpen(false)}
      />
    </div>
  );
}
