"use client";

import type { LmsProjectEntry } from "@/apis/lms";
import AppButton from "@/components/buttons/AppButton";
import AppInput from "@/components/fields/AppInput";
import LmsProjectFormOS from "@/components/forms/LmsProjectFormOS";
import PageHeaderOS from "@/components/navigations/PageHeaderOS";
import { requireApiData } from "@/lib/api-result";
import { listLmsProjects } from "@/lib/actions";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Building2,
  CalendarDays,
  Layers3,
  Pencil,
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
    <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-line bg-gray-50 text-base font-bold text-gray-500 dark:bg-zinc-800 dark:text-zinc-300">
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

function ProjectCard({
  project,
  onEdit,
}: {
  project: LmsProjectEntry;
  onEdit: () => void;
}) {
  const hasCapacity = project.attendee_pax !== null && project.attendee_pax > 0;
  const fill = hasCapacity
    ? Math.min((project.member_count / project.attendee_pax!) * 100, 100)
    : 0;
  const utilization = Math.round(fill);

  return (
    <article className="flex min-h-60 flex-col overflow-hidden rounded-2xl border border-line bg-card-bg transition-colors hover:border-claude/60">
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <ProjectLogo project={project} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-xs font-medium text-gray-400 dark:text-zinc-500">
              <Building2 size={12} className="shrink-0" />
              <span className="truncate">
                {project.company_name ?? "No company linked"}
              </span>
            </div>
            <h3 className="mt-1 line-clamp-2 text-lg font-bold leading-snug text-gray-900 dark:text-zinc-100">
              {project.name}
            </h3>
          </div>
          <AppButton
            type="button"
            variant="secondary"
            size="icon"
            title="Edit project"
            onClick={onEdit}
            className="shrink-0"
          >
            <Pencil size={14} />
          </AppButton>
        </div>

        <div className="mt-7">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-gray-400 dark:text-zinc-500">
                Seat utilization
              </p>
              <p className="mt-1 text-sm font-semibold text-gray-700 dark:text-zinc-200">
                <span className="font-heading text-xl tabular-nums text-gray-900 dark:text-zinc-100">
                  {project.member_count}
                </span>{" "}
                {hasCapacity ? `of ${project.attendee_pax} seats filled` : "members enrolled"}
              </p>
            </div>
            <p className="font-heading text-lg font-semibold tabular-nums text-gray-500 dark:text-zinc-300">
              {hasCapacity ? `${utilization}%` : "—"}
            </p>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-zinc-800">
            <div
              className="h-full rounded-full bg-claude transition-[width]"
              style={{ width: hasCapacity ? `${fill}%` : "0%" }}
            />
          </div>
        </div>
      </div>

      <div className="flex items-stretch border-t border-line-soft bg-gray-50/60 dark:bg-zinc-800/30">
        <div className="grid min-w-0 flex-1 grid-cols-3 divide-x divide-line-soft">
          <div className="px-4 py-3.5 sm:px-5">
            <p className="flex items-center gap-1.5 text-[11px] text-gray-400 dark:text-zinc-500">
              <Users size={12} /> Members
            </p>
            <p className="mt-0.5 text-sm font-semibold tabular-nums text-gray-700 dark:text-zinc-200">
              {project.member_count}
            </p>
          </div>
          <div className="px-4 py-3.5 sm:px-5">
            <p className="flex items-center gap-1.5 text-[11px] text-gray-400 dark:text-zinc-500">
              <Layers3 size={12} /> Groups
            </p>
            <p className="mt-0.5 text-sm font-semibold tabular-nums text-gray-700 dark:text-zinc-200">
              {project.group_count}
            </p>
          </div>
          <div className="px-4 py-3.5 sm:px-5">
            <p className="flex items-center gap-1.5 text-[11px] text-gray-400 dark:text-zinc-500">
              <CalendarDays size={12} /> Updated
            </p>
            <p className="mt-0.5 truncate text-sm font-semibold text-gray-700 dark:text-zinc-200">
              {formatDate(project.updated_at)}
            </p>
          </div>
        </div>
        <div className="flex items-center border-l border-line-soft px-3 sm:px-4">
          <AppButton
            href={`/lms/${project.id}`}
            variant="black"
            size="sm"
            aria-label={`Open ${project.name}`}
          >
            Open <ArrowRight size={13} />
          </AppButton>
        </div>
      </div>
    </article>
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
  const [projectSheet, setProjectSheet] = useState<{
    open: boolean;
    project: LmsProjectEntry | null;
  }>({ open: false, project: null });

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
          onClick: () => setProjectSheet({ open: true, project: null }),
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
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={() => setProjectSheet({ open: true, project })}
            />
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
        project={projectSheet.project}
        isOpen={projectSheet.open}
        onClose={() => setProjectSheet({ open: false, project: null })}
      />
    </div>
  );
}
