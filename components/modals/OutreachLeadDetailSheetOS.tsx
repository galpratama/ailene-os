"use client";

import type { OutreachLead, OutreachLeadDetails } from "@/apis/outreach";
import AppButton from "@/components/buttons/AppButton";
import Label from "@/components/labels/Label";
import OutreachStatusLabel from "@/components/labels/OutreachStatusLabel";
import SheetOS from "@/components/modals/SheetOS";
import { getOutreachLeadDetails } from "@/lib/actions";
import { requireApiData } from "@/lib/api-result";
import { approvableStatuses, jakartaDateTime, leadDisplayName, outreachStatusStyles, rejectableStatuses, relativeFromNow } from "@/lib/outreach";
import { useQuery } from "@tanstack/react-query";
import { Check, ExternalLink, Loader2, TriangleAlert, X } from "lucide-react";
import type { ReactNode } from "react";

const milestones: { key: keyof OutreachLead; label: string }[] = [
  { key: "created_at", label: "Found" },
  { key: "approved_at", label: "Approved" },
  { key: "rejected_at", label: "Rejected" },
  { key: "invited_at", label: "Invited" },
  { key: "connected_at", label: "Connected" },
  { key: "thanked_at", label: "Thanked" },
  { key: "messaged_at", label: "Messaged" },
  { key: "followed_up_1_at", label: "Follow-up 1" },
  { key: "followed_up_2_at", label: "Follow-up 2" },
  { key: "replied_at", label: "Replied" },
  { key: "disqualified_at", label: "Disqualified" },
];

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-zinc-100">{title}</h3>
      {children}
    </section>
  );
}

function statusName(status: string | null) {
  if (!status) return "—";
  return outreachStatusStyles[status as OutreachLead["status"]]?.label ?? status;
}

export default function OutreachLeadDetailSheetOS({
  leadId,
  enabled,
  onClose,
  onDecide,
}: {
  leadId: number | null;
  enabled: boolean;
  onClose: () => void;
  onDecide: (lead: OutreachLead, decision: "approve" | "reject") => void;
}) {
  const query = useQuery({
    queryKey: ["outreach-leads", "details", leadId],
    queryFn: async () => requireApiData(await getOutreachLeadDetails(leadId!)),
    enabled: enabled && leadId !== null,
  });
  const lead = query.data;

  return (
    <SheetOS title={lead ? leadDisplayName(lead) : "Outreach lead"} description={lead ? [lead.title, lead.company].filter(Boolean).join(" · ") || undefined : undefined} isOpen={leadId !== null} onClose={onClose} wide>
      {query.isLoading ? (
        <div className="flex flex-1 items-center justify-center py-20">
          <Loader2 size={20} className="animate-spin text-gray-400" aria-label="Loading lead" />
        </div>
      ) : query.isError || !lead ? (
        <p className="px-6 py-10 text-center text-sm text-merah">{query.error?.message ?? "The lead could not be loaded."}</p>
      ) : (
        <LeadBody lead={lead} onDecide={onDecide} />
      )}
    </SheetOS>
  );
}

function LeadBody({ lead, onDecide }: { lead: OutreachLeadDetails; onDecide: (lead: OutreachLead, decision: "approve" | "reject") => void }) {
  const canApprove = approvableStatuses.includes(lead.status);
  const canReject = rejectableStatuses.includes(lead.status);
  const reached = milestones
    .map((milestone) => ({ label: milestone.label, at: lead[milestone.key] as string | null }))
    .filter((milestone): milestone is { label: string; at: string } => !!milestone.at)
    .sort((a, b) => a.at.localeCompare(b.at));
  const events = [...lead.events].reverse();

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-6 py-5">
        <div className="flex flex-wrap items-center gap-1.5">
          <OutreachStatusLabel status={lead.status} />
          {lead.fit_score !== null && <Label variant={lead.fit_score >= 75 ? "hijau" : lead.fit_score >= 50 ? "kuning" : "gray"}>Fit {lead.fit_score}</Label>}
          <Label variant="gray">{lead.campaign}</Label>
          {lead.distance && <Label variant="gray">{lead.distance.replace("DISTANCE_", "")}° connection</Label>}
        </div>

        {lead.error && (
          <p className="flex items-start gap-1.5 rounded-lg border border-line-soft px-3 py-2 text-xs text-merah">
            <TriangleAlert size={12} className="mt-0.5 shrink-0" aria-hidden="true" />
            {lead.error}
          </p>
        )}

        {lead.headline && <p className="text-sm text-gray-700 dark:text-zinc-300">{lead.headline}</p>}

        <dl className="grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
          {[
            ["Industry", lead.industry || "—"],
            ["Location", lead.location || "—"],
            ["Next action", lead.next_action_at ? `${relativeFromNow(lead.next_action_at)} · ${jakartaDateTime(lead.next_action_at)}` : "—"],
            ["Invite note", lead.invite_with_note === null ? "Campaign default" : lead.invite_with_note ? "With note" : "Without note"],
            ["Approved by", lead.approved_by ?? "—"],
            ["Last checked", jakartaDateTime(lead.last_checked_at)],
          ].map(([label, value]) => (
            <div key={label} className="min-w-0">
              <dt className="text-xs text-gray-400">{label}</dt>
              <dd className="wrap-break-word text-gray-700 dark:text-zinc-300">{value}</dd>
            </div>
          ))}
        </dl>

        {lead.profile_url && (
          <AppButton variant="textLink" size="textLink" href={lead.profile_url} className="w-fit">
            Open LinkedIn profile <ExternalLink size={12} aria-hidden="true" />
          </AppButton>
        )}

        {lead.fit_reason && (
          <Block title="Why the agent picked this lead">
            <p className="whitespace-pre-line text-sm text-gray-600 dark:text-zinc-300">{lead.fit_reason}</p>
          </Block>
        )}

        {(lead.invite_note || lead.last_message) && (
          <Block title="Messages">
            {lead.invite_note && (
              <div className="rounded-lg border border-line-soft p-3">
                <p className="text-xs text-gray-400">Invite note</p>
                <p className="mt-1 whitespace-pre-line text-sm text-gray-700 dark:text-zinc-300">{lead.invite_note}</p>
              </div>
            )}
            {lead.last_message && (
              <div className="rounded-lg border border-line-soft p-3">
                <p className="text-xs text-gray-400">Last message</p>
                <p className="mt-1 whitespace-pre-line text-sm text-gray-700 dark:text-zinc-300">{lead.last_message}</p>
              </div>
            )}
          </Block>
        )}

        <Block title="Milestones">
          <ol className="flex flex-col gap-1 text-sm">
            {reached.map((milestone) => (
              <li key={milestone.label} className="flex justify-between gap-3">
                <span className="text-gray-600 dark:text-zinc-300">{milestone.label}</span>
                <span className="tabular-nums text-gray-500 dark:text-zinc-400">{jakartaDateTime(milestone.at)}</span>
              </li>
            ))}
          </ol>
        </Block>

        {lead.summary && (
          <Block title="LinkedIn summary">
            <p className="max-h-48 overflow-y-auto whitespace-pre-line text-sm text-gray-600 dark:text-zinc-300">{lead.summary}</p>
          </Block>
        )}

        <Block title={`Activity (${lead.events.length})`}>
          {events.length === 0 ? (
            <p className="text-sm text-gray-400">No activity recorded yet.</p>
          ) : (
            <ol>
              {events.map((event, index) => (
                <li key={event.id} className="relative pb-4 pl-6 last:pb-0">
                  {index < events.length - 1 && <span aria-hidden="true" className="absolute left-1.5 top-3 h-full w-px bg-line-soft" />}
                  <span aria-hidden="true" className="absolute left-0 top-1.5 flex size-3 items-center justify-center rounded-full border border-line bg-card-bg">
                    <span className="size-1.5 rounded-full bg-claude dark:bg-lime-bright" />
                  </span>
                  <p className="text-xs font-semibold capitalize text-gray-800 dark:text-zinc-200">
                    {event.event.replaceAll("_", " ")}
                    {event.from_status !== event.to_status && (
                      <span className="font-normal normal-case text-gray-500 dark:text-zinc-400">
                        {" "}· {statusName(event.from_status)} → {statusName(event.to_status)}
                      </span>
                    )}
                  </p>
                  {event.detail && <p className="mt-0.5 wrap-break-word text-xs text-gray-600 dark:text-zinc-300">{event.detail}</p>}
                  {event.message && <p className="mt-1 whitespace-pre-line rounded-md bg-dashboard-bg px-2 py-1.5 text-xs text-gray-600 dark:text-zinc-300">{event.message}</p>}
                  <p className="mt-0.5 text-xs text-gray-400 dark:text-zinc-500">
                    {event.actor} · {jakartaDateTime(event.created_at)}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </Block>
      </div>

      {(canApprove || canReject) && (
        <div className="sticky bottom-0 flex gap-2 border-t border-line-soft bg-white px-6 py-4 dark:bg-zinc-900">
          {canReject && (
            <AppButton type="button" variant="outline" className="flex-1 justify-center" onClick={() => onDecide(lead, "reject")}>
              <X size={14} />
              Reject
            </AppButton>
          )}
          {canApprove && (
            <AppButton type="button" variant="primary" className="flex-1 justify-center" onClick={() => onDecide(lead, "approve")}>
              <Check size={14} />
              Approve
            </AppButton>
          )}
        </div>
      )}
    </div>
  );
}
