"use client";

import type { OutreachLead, OutreachOrder, OutreachStatus } from "@/apis/outreach";
import AppButton from "@/components/buttons/AppButton";
import WarehouseRankedBarsOS from "@/components/charts/WarehouseRankedBarsOS";
import AnalyticsDataTableOS, { type AnalyticsColumn } from "@/components/elements/AnalyticsDataTableOS";
import AnalyticsToggleOS from "@/components/elements/AnalyticsToggleOS";
import RevenueCardOS from "@/components/elements/RevenueCardOS";
import RevenueKpiOS from "@/components/elements/RevenueKpiOS";
import AppInput from "@/components/fields/AppInput";
import AppSelect from "@/components/fields/AppSelect";
import AppSwitch from "@/components/fields/AppSwitch";
import Label from "@/components/labels/Label";
import OutreachStatusLabel from "@/components/labels/OutreachStatusLabel";
import OutreachDecisionModalOS, { type OutreachDecision } from "@/components/modals/OutreachDecisionModalOS";
import OutreachLeadDetailSheetOS from "@/components/modals/OutreachLeadDetailSheetOS";
import AppPaginationOS from "@/components/navigations/AppPaginationOS";
import PageHeaderOS from "@/components/navigations/PageHeaderOS";
import { approveOutreachLeads, getOutreachStats, listOutreachLeads, rejectOutreachLeads } from "@/lib/actions";
import { requireApiData } from "@/lib/api-result";
import {
  approvableStatuses,
  closedStatuses,
  funnelSteps,
  inSequenceStatuses,
  jakartaDateTime,
  leadDisplayName,
  mergeCampaignCounts,
  outreachFunnel,
  outreachViews,
  rejectableStatuses,
  relativeFromNow,
  sumStatuses,
  type OutreachView,
} from "@/lib/outreach";
import { count, percent } from "@/lib/revenue";
import { showErrorToast } from "@/lib/toast";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, ExternalLink, RefreshCw, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const PAGE_SIZE = 25;

const defaultOrders: Record<OutreachView, OutreachOrder> = {
  approval: "fit_score",
  approved: "next_action",
  sequence: "next_action",
  replied: "updated_at",
  closed: "updated_at",
  all: "updated_at",
};

const orderOptions: { value: OutreachOrder; label: string }[] = [
  { value: "fit_score", label: "Best fit first" },
  { value: "next_action", label: "Next action first" },
  { value: "invited_at", label: "Oldest invite first" },
  { value: "updated_at", label: "Recently updated" },
];

type CampaignRow = { campaign: string; counts: Partial<Record<OutreachStatus, number>> };

const funnelColors = ["var(--viz-other)", "var(--viz-1)", "var(--viz-2)", "var(--viz-3)", "var(--viz-4)", "var(--viz-5)"];

export default function OutreachPageOS({ sessionToken }: { sessionToken: string }) {
  const queryClient = useQueryClient();
  const enabled = !!sessionToken;

  const [campaign, setCampaign] = useState("");
  const [view, setView] = useState<OutreachView>("approval");
  const [order, setOrder] = useState<OutreachOrder | null>(null);
  const [dueOnly, setDueOnly] = useState(false);
  const [search, setSearch] = useState("");
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<number[]>([]);
  const [openLeadId, setOpenLeadId] = useState<number | null>(null);
  const [decision, setDecision] = useState<{ kind: OutreachDecision; ids: number[] } | null>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setKeyword(search.trim());
      setPage(1);
      setSelected([]);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  const stats = useQuery({
    queryKey: ["outreach-leads", "stats"],
    queryFn: async () => requireApiData(await getOutreachStats()),
    enabled,
  });

  const filters = {
    campaign: campaign || undefined,
    statuses: outreachViews.find((entry) => entry.value === view)?.statuses,
    due_only: dueOnly || undefined,
    order: order ?? defaultOrders[view],
    keyword: keyword || undefined,
    page,
    page_size: PAGE_SIZE,
  };

  const leads = useQuery({
    queryKey: ["outreach-leads", "list", filters],
    queryFn: async () => requireApiData(await listOutreachLeads(filters)),
    enabled,
    placeholderData: keepPreviousData,
  });

  async function afterDecision() {
    setDecision(null);
    setSelected([]);
    await queryClient.invalidateQueries({ queryKey: ["outreach-leads"] });
  }

  const approveMutation = useMutation({
    mutationFn: async ({ ids, withNote }: { ids: number[]; withNote: boolean }) => requireApiData(await approveOutreachLeads({ ids, with_note: withNote })),
    onSuccess: async (result) => {
      toast.success(`${result.approved.length} approved · ${result.approvals_today}/${result.limit} approvals used today.`);
      if (result.skipped.length > 0) toast.warning(`${result.skipped.length} not approved: the daily limit was reached or their status changed.`);
      await afterDecision();
    },
    onError: (error) => showErrorToast(error, "Failed to approve leads."),
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ ids, reason }: { ids: number[]; reason: string }) => requireApiData(await rejectOutreachLeads({ ids, reason: reason || undefined })),
    onSuccess: async (result) => {
      toast.success(`${result.rejected.length} rejected.`);
      if (result.skipped.length > 0) toast.warning(`${result.skipped.length} skipped because their status no longer allows rejection.`);
      await afterDecision();
    },
    onError: (error) => showErrorToast(error, "Failed to reject leads."),
  });

  const byCampaign = stats.data?.by_campaign ?? {};
  const campaigns = Object.keys(byCampaign).sort();
  const counts = mergeCampaignCounts(byCampaign, campaign);
  const funnel = outreachFunnel(counts);
  const quota = stats.data?.approvals_today;
  const remainingToday = quota ? Math.max(quota.limit - quota.used, 0) : null;
  const acceptance = stats.data?.acceptance;
  const replied = counts.replied ?? 0;

  const rows = leads.data?.list ?? [];
  const metapaging = leads.data?.metapaging;
  const selectableIds = rows.filter((row) => approvableStatuses.includes(row.status) || rejectableStatuses.includes(row.status)).map((row) => row.id);
  const selectedRows = rows.filter((row) => selected.includes(row.id));
  const approveIds = selectedRows.filter((row) => approvableStatuses.includes(row.status)).map((row) => row.id);
  const rejectIds = selectedRows.filter((row) => rejectableStatuses.includes(row.status)).map((row) => row.id);
  const allSelected = selectableIds.length > 0 && selectableIds.every((id) => selected.includes(id));

  function changeFilter(apply: () => void) {
    apply();
    setPage(1);
    setSelected([]);
  }

  function toggle(id: number) {
    setSelected((current) => (current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id]));
  }

  function decide(lead: OutreachLead, kind: OutreachDecision) {
    setDecision({ kind, ids: [lead.id] });
  }

  const campaignRows: CampaignRow[] = campaigns.map((name) => ({ campaign: name, counts: byCampaign[name] }));
  const campaignColumns: AnalyticsColumn<CampaignRow>[] = [
    {
      key: "campaign",
      label: "Campaign",
      value: (row) => row.campaign,
      render: (row) => (
        <AppButton type="button" variant="textLink" size="textLink" onClick={() => changeFilter(() => setCampaign(row.campaign))}>
          {row.campaign}
        </AppButton>
      ),
    },
    { key: "found", label: "Found", value: (row) => outreachFunnel(row.counts)[0], align: "right" },
    { key: "pending", label: "Pending", value: (row) => row.counts.pending_approval ?? 0, align: "right" },
    { key: "approved", label: "Approved", value: (row) => row.counts.approved ?? 0, align: "right" },
    { key: "invited", label: "Invited", value: (row) => outreachFunnel(row.counts)[2], align: "right" },
    { key: "connected", label: "Connected", value: (row) => outreachFunnel(row.counts)[3], align: "right" },
    { key: "sequence", label: "In sequence", value: (row) => sumStatuses(row.counts, inSequenceStatuses), align: "right" },
    { key: "replied", label: "Replied", value: (row) => row.counts.replied ?? 0, align: "right" },
    {
      key: "reply-rate",
      label: "Reply rate",
      value: (row) => {
        const connected = outreachFunnel(row.counts)[3];
        return connected > 0 ? (row.counts.replied ?? 0) / connected : null;
      },
      render: (row) => {
        const connected = outreachFunnel(row.counts)[3];
        return percent(connected > 0 ? (row.counts.replied ?? 0) / connected : null);
      },
      align: "right",
    },
    { key: "closed", label: "Closed", value: (row) => sumStatuses(row.counts, closedStatuses), align: "right" },
  ];

  return (
    <div className="flex flex-col gap-5 px-4 py-6 sm:px-8">
      <PageHeaderOS title="LinkedIn Outreach" description="Lead yang ditemukan agent LinkedIn outreach: review dan approve, lalu pantau invite, koneksi, pesan, dan balasan.">
        <div className="w-48">
          <AppSelect
            selectId="outreach-campaign"
            placeholder="All campaigns"
            value={campaign}
            options={[{ value: "", label: "All campaigns" }, ...campaigns.map((name) => ({ value: name, label: name }))]}
            onChange={(value) => changeFilter(() => setCampaign(String(value ?? "")))}
          />
        </div>
        <AppButton
          type="button"
          variant="secondary"
          size="icon"
          title="Refresh"
          aria-label="Refresh outreach data"
          onClick={() => queryClient.invalidateQueries({ queryKey: ["outreach-leads"] })}
        >
          <RefreshCw size={14} className={stats.isFetching || leads.isFetching ? "animate-spin" : ""} />
        </AppButton>
      </PageHeaderOS>

      {stats.isError && <p className="rounded-lg border border-line px-4 py-3 text-sm text-merah">{stats.error.message}</p>}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <RevenueKpiOS
          label="Needs approval"
          isLoading={stats.isLoading}
          value={count(counts.pending_approval ?? 0)}
          info="Leads the agent found and scored, waiting for a person to approve or reject before any invite is sent."
          lines={[<span key="found">{count(funnel[0])} found in total</span>]}
        />
        <RevenueKpiOS
          label="Approvals today"
          isLoading={stats.isLoading}
          value={quota ? `${count(quota.used)} / ${count(quota.limit)}` : "—"}
          info="At most this many leads can be approved per Asia/Jakarta day across all campaigns, to keep the LinkedIn account safe."
          lines={[<span key="left">{count(remainingToday)} left today · all campaigns</span>]}
        />
        <RevenueKpiOS
          label="In sequence"
          isLoading={stats.isLoading}
          value={count(sumStatuses(counts, inSequenceStatuses))}
          info="Invited, connected, thanked, messaged, or followed up: leads the agent is still working."
          lines={[<span key="invited">{count(counts.invited ?? 0)} invites awaiting acceptance</span>]}
        />
        <RevenueKpiOS
          label="Acceptance rate"
          isLoading={stats.isLoading}
          value={percent(acceptance && acceptance.sample > 0 ? acceptance.accepted / acceptance.sample : null)}
          info="Invites sent between 30 and 7 days ago that were accepted. Newer invites are left out because they may still be accepted."
          lines={[<span key="sample">{count(acceptance?.accepted ?? 0)} of {count(acceptance?.sample ?? 0)} invites · all campaigns</span>]}
        />
        <RevenueKpiOS
          label="Replied"
          isLoading={stats.isLoading}
          value={count(replied)}
          info="Leads that answered a message. The rate is replies over leads that accepted the connection."
          lines={[<span key="rate">{percent(funnel[3] > 0 ? replied / funnel[3] : null)} of connected</span>]}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
        <RevenueCardOS
          className="xl:col-span-2"
          title="Outreach funnel"
          description="Berapa lead yang sudah melewati tiap tahap, dihitung dari status saat ini. Lead yang disqualified atau gagal hanya dihitung di Found."
          source="os"
          isLoading={stats.isLoading}
          isEmpty={funnel[0] === 0}
          emptyMessage="The agent has not found any leads yet."
        >
          <WarehouseRankedBarsOS
            maxValue={funnel[0]}
            items={funnelSteps.map((step, index) => ({
              key: step,
              label: step,
              value: funnel[index],
              display: count(funnel[index]),
              color: funnelColors[index],
              trailing: index > 0 ? <span className="text-xs text-gray-500 dark:text-zinc-400">{percent(funnel[0] > 0 ? funnel[index] / funnel[0] : null)}</span> : undefined,
              rows: [
                { label: "leads", value: count(funnel[index]) },
                ...(index > 0 ? [{ label: `from ${funnelSteps[index - 1].toLowerCase()}`, value: percent(funnel[index - 1] > 0 ? funnel[index] / funnel[index - 1] : null) }] : []),
              ],
            }))}
          />
        </RevenueCardOS>
        <RevenueCardOS
          className="xl:col-span-3"
          title="By campaign"
          description="Status lead per campaign. Klik nama campaign untuk memfilter seluruh halaman."
          source="os"
          isLoading={stats.isLoading}
          isEmpty={campaignRows.length === 0}
          emptyMessage="No campaigns yet."
        >
          <AnalyticsDataTableOS columns={campaignColumns} rows={campaignRows} rowKey={(row) => row.campaign} />
        </RevenueCardOS>
      </div>

      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <AnalyticsToggleOS label="Lead view" options={outreachViews} value={view} onChange={(value) => changeFilter(() => { setView(value); setOrder(null); })} />
          <div className="flex flex-wrap items-center gap-2">
            <AppInput inputId="outreach-search" icon={<Search size={14} />} value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, company, title..." className="max-w-full sm:w-64" />
            <div className="w-44">
              <AppSelect selectId="outreach-order" placeholder="Order" value={order ?? defaultOrders[view]} options={orderOptions} onChange={(value) => changeFilter(() => setOrder(value as OutreachOrder))} />
            </div>
            <AppSwitch inputId="outreach-due" label="Due now" compact checked={dueOnly} onChange={(checked) => changeFilter(() => setDueOnly(checked))} />
          </div>
        </div>

        <div className="flex min-h-9 flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            {selected.length > 0 ? `${selected.length} selected` : metapaging ? `${count(metapaging.total_data)} leads` : ""}
            {remainingToday !== null && <span> · {count(remainingToday)} approvals left today</span>}
          </p>
          {selected.length > 0 && (
            <div className="flex items-center gap-2">
              <AppButton type="button" variant="outline" size="sm" disabled={rejectIds.length === 0} onClick={() => setDecision({ kind: "reject", ids: rejectIds })}>
                <X size={13} />
                Reject ({rejectIds.length})
              </AppButton>
              <AppButton type="button" variant="primary" size="sm" disabled={approveIds.length === 0 || remainingToday === 0} onClick={() => setDecision({ kind: "approve", ids: approveIds })}>
                <Check size={13} />
                Approve ({approveIds.length})
              </AppButton>
            </div>
          )}
        </div>

        <div className={`overflow-hidden rounded-xl border border-line bg-card-bg ${leads.isFetching && !leads.isLoading ? "opacity-60" : ""}`}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-240 text-sm">
              <thead>
                <tr className="border-b border-line-soft text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                  <th className="w-10 px-4 py-3">
                    <input
                      type="checkbox"
                      aria-label="Select every actionable lead on this page"
                      className="accent-claude"
                      checked={allSelected}
                      disabled={selectableIds.length === 0}
                      onChange={() => setSelected(allSelected ? [] : selectableIds)}
                    />
                  </th>
                  <th className="px-4 py-3">Lead</th>
                  <th className="px-4 py-3">Campaign</th>
                  <th className="px-4 py-3">Fit</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Next action</th>
                  <th className="px-4 py-3">Updated</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const actionable = selectableIds.includes(row.id);
                  return (
                    <tr key={row.id} className="border-b border-line-soft last:border-0 hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          aria-label={`Select ${leadDisplayName(row)}`}
                          className="accent-claude"
                          checked={selected.includes(row.id)}
                          disabled={!actionable}
                          onChange={() => toggle(row.id)}
                        />
                      </td>
                      <td className="max-w-96 px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <AppButton type="button" variant="bare" size="bare" className="min-w-0 truncate font-semibold text-gray-900 hover:text-claude dark:text-zinc-100" onClick={() => setOpenLeadId(row.id)}>
                            <span className="truncate">{leadDisplayName(row)}</span>
                          </AppButton>
                          {row.profile_url && (
                            <AppButton variant="sort" size="bare" href={row.profile_url} title="Open LinkedIn profile" aria-label={`Open ${leadDisplayName(row)} on LinkedIn`}>
                              <ExternalLink size={12} />
                            </AppButton>
                          )}
                        </div>
                        <p className="truncate text-xs text-gray-500 dark:text-zinc-400">{[row.title, row.company].filter(Boolean).join(" · ") || row.headline || "—"}</p>
                        {row.error && <p className="truncate text-xs text-merah">{row.error}</p>}
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-zinc-300">{row.campaign}</td>
                      <td className="px-4 py-3">
                        {row.fit_score === null ? (
                          <span className="text-gray-400">—</span>
                        ) : (
                          <Label variant={row.fit_score >= 75 ? "hijau" : row.fit_score >= 50 ? "kuning" : "gray"}>{row.fit_score}</Label>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <OutreachStatusLabel status={row.status} />
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-zinc-300" title={jakartaDateTime(row.next_action_at)}>
                        {relativeFromNow(row.next_action_at)}
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-zinc-300" title={jakartaDateTime(row.updated_at)}>
                        {relativeFromNow(row.updated_at)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {leads.isLoading && <p className="py-10 text-center text-sm text-gray-400 dark:text-zinc-500">Loading leads...</p>}
            {leads.isError && <p className="py-10 text-center text-sm text-merah">{leads.error.message}</p>}
            {leads.isSuccess && rows.length === 0 && (
              <p className="py-10 text-center text-sm text-gray-400 dark:text-zinc-500">No leads match this view.</p>
            )}
          </div>
        </div>

        <AppPaginationOS currentPage={page} totalPages={metapaging?.total_page ?? 1} onPageChange={(next) => { setPage(next); setSelected([]); }} />
      </section>

      <OutreachLeadDetailSheetOS leadId={openLeadId} enabled={enabled} onClose={() => setOpenLeadId(null)} onDecide={decide} />

      <OutreachDecisionModalOS
        decision={decision?.kind ?? null}
        count={decision?.ids.length ?? 0}
        remainingToday={remainingToday}
        isPending={approveMutation.isPending || rejectMutation.isPending}
        onClose={() => setDecision(null)}
        onApprove={(withNote) => decision && approveMutation.mutate({ ids: decision.ids, withNote })}
        onReject={(reason) => decision && rejectMutation.mutate({ ids: decision.ids, reason })}
      />
    </div>
  );
}
