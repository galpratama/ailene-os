"use client";

import type { LmsWorkflowDetails } from "@/apis/lms-workflows";
import AppButton from "@/components/buttons/AppButton";
import TaskAssigneeAvatarOS from "@/components/elements/TaskAssigneeAvatarOS";
import Label from "@/components/labels/Label";
import LmsWorkflowStatusLabel from "@/components/labels/LmsWorkflowStatusLabel";
import {
  AlertTriangle,
  Clock3,
  Download,
  FileText,
  Loader2,
  MessageSquareText,
  X,
} from "lucide-react";
import { useEffect } from "react";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  }).format(new Date(value));
}

function formatBytes(value: number) {
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${Math.round(value / 1024)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

const feedbackKinds = {
  automate: { label: "Automate", variant: "ungu" },
  improve: { label: "Improve", variant: "biru" },
  question: { label: "Question", variant: "kuning" },
} as const;

export default function LmsWorkflowDetailModalOS({
  workflow,
  isLoading,
  error,
  onRetry,
  onClose,
}: {
  workflow: LmsWorkflowDetails | null;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  onClose: () => void;
}) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [onClose]);

  const nodeTitles = new Map(workflow?.nodes.map((node) => [node.id, node.title]));

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/35"
      onClick={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="workflow-detail-title"
        className="flex h-full w-full max-w-2xl flex-col border-l border-line bg-card-bg shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-line-soft px-4 py-3 sm:px-6">
          <div className="min-w-0">
            <p className="text-xs font-medium text-gray-500 dark:text-zinc-400">Submitted workflow</p>
            <h2 id="workflow-detail-title" className="truncate text-base font-bold text-gray-900 dark:text-zinc-100">
              {workflow?.title ?? "Workflow detail"}
            </h2>
          </div>
          <AppButton variant="secondary" size="icon" aria-label="Close workflow detail" onClick={onClose}>
            <X size={17} />
          </AppButton>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {isLoading && (
            <div className="flex min-h-80 items-center justify-center gap-2 text-sm text-gray-500 dark:text-zinc-400">
              <Loader2 size={18} className="animate-spin" /> Loading workflow…
            </div>
          )}
          {error && !isLoading && (
            <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-merah/30 bg-merah-t px-4 py-3 text-sm text-merah">
              <span>{error}</span>
              <AppButton variant="outline" size="sm" onClick={onRetry}>Try again</AppButton>
            </div>
          )}
          {workflow && !isLoading && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-line bg-gray-50 p-4 dark:bg-zinc-800/50">
                <div className="flex min-w-0 items-center gap-3">
                  <TaskAssigneeAvatarOS
                    name={workflow.learner.full_name}
                    avatar={workflow.learner.avatar}
                    colorKey={workflow.learner.access_id}
                    size="lg"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-900 dark:text-zinc-100">{workflow.learner.full_name}</p>
                    <p className="truncate text-xs text-gray-500 dark:text-zinc-400">{workflow.learner.email}</p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-zinc-400">{workflow.learner.group.name} · {workflow.learner.job_title}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <LmsWorkflowStatusLabel status={workflow.status} />
                  <p className="text-xs text-gray-500 dark:text-zinc-400">{formatDate(workflow.submitted_at)} WIB</p>
                </div>
              </div>

              <dl className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-line p-4">
                  <dt className="text-xs font-semibold text-gray-500 dark:text-zinc-400">Problem</dt>
                  <dd className="mt-1 whitespace-pre-line text-sm text-gray-800 dark:text-zinc-200">{workflow.problem}</dd>
                </div>
                <div className="rounded-xl border border-line p-4">
                  <dt className="text-xs font-semibold text-gray-500 dark:text-zinc-400">Expected result</dt>
                  <dd className="mt-1 whitespace-pre-line text-sm text-gray-800 dark:text-zinc-200">{workflow.result}</dd>
                </div>
                <div className="rounded-xl border border-line p-4 sm:col-span-2">
                  <dt className="text-xs font-semibold text-gray-500 dark:text-zinc-400">Frequency</dt>
                  <dd className="mt-1 capitalize text-sm text-gray-800 dark:text-zinc-200">{workflow.frequency}</dd>
                </div>
              </dl>

              <section>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-zinc-100">Workflow steps</h3>
                  <p className="flex items-center gap-1 text-xs tabular-nums text-gray-500 dark:text-zinc-400">
                    <Clock3 size={13} /> {workflow.summary.total_minutes} min total
                  </p>
                </div>
                <ol className="flex flex-col gap-2">
                  {workflow.nodes.map((node, index) => (
                    <li key={node.id} className="relative flex gap-3 rounded-xl border border-line p-3.5">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-xs font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
                        {index + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-gray-900 dark:text-zinc-100">{node.title}</p>
                          {node.pain_point && <Label variant="merah"><AlertTriangle size={11} /> Pain point</Label>}
                        </div>
                        {(node.source || node.tool) && (
                          <p className="mt-1 text-xs text-gray-500 dark:text-zinc-400">
                            {[node.source && `Source: ${node.source}`, node.tool && `Tool: ${node.tool}`].filter(Boolean).join(" · ")}
                          </p>
                        )}
                      </div>
                      {node.minutes !== null && (
                        <span className="shrink-0 text-xs tabular-nums text-gray-500 dark:text-zinc-400">{node.minutes} min</span>
                      )}
                    </li>
                  ))}
                </ol>
              </section>

              {workflow.attachments.length > 0 && (
                <section>
                  <h3 className="mb-3 text-sm font-bold text-gray-900 dark:text-zinc-100">Attachments</h3>
                  <div className="flex flex-col gap-2">
                    {workflow.attachments.map((attachment) => (
                      <div key={attachment.url} className="flex items-center gap-3 rounded-xl border border-line p-3">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500 dark:bg-zinc-800 dark:text-zinc-300"><FileText size={16} /></span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-gray-800 dark:text-zinc-200">{attachment.name}</p>
                          <p className="text-xs text-gray-500 dark:text-zinc-400">{formatBytes(attachment.size_bytes)}</p>
                        </div>
                        <AppButton href={attachment.url} variant="outline" size="iconSm" aria-label={`Open ${attachment.name}`} title="Open attachment">
                          <Download size={14} />
                        </AppButton>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {workflow.feedback.length > 0 && (
                <section>
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-zinc-100">
                    <MessageSquareText size={15} /> Feedback
                  </h3>
                  <div className="flex flex-col gap-3">
                    {workflow.feedback.map((entry) => {
                      const config = feedbackKinds[entry.kind];
                      return (
                        <article key={entry.id} className="rounded-xl border border-line p-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <Label variant={config.variant}>{config.label}</Label>
                            <span className="text-xs text-gray-500 dark:text-zinc-400">
                              {entry.node_id ? nodeTitles.get(entry.node_id) ?? "Workflow step" : "Overall workflow"}
                            </span>
                          </div>
                          <p className="mt-2 whitespace-pre-line text-sm text-gray-800 dark:text-zinc-200">{entry.body}</p>
                          <p className="mt-2 text-xs text-gray-500 dark:text-zinc-400">{entry.author.full_name} · {formatDate(entry.created_at)} WIB</p>
                        </article>
                      );
                    })}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
