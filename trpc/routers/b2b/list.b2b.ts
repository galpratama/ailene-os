import { STATUS_BAD_REQUEST, STATUS_OK } from "@/lib/status_code";
import type { PipelineStage } from "@/apis/sales";
import { loggedInProcedure } from "@/trpc/init";
import {
  meetingDataScopeWhere,
  pipelineDataScopeWhere,
  quotationDataScopeWhere,
} from "@/trpc/utils/data_scope";
import { calculatePage } from "@/trpc/utils/paging";
import { canViewQuotationInternals } from "@/trpc/utils/quotation";
import {
  numberIsID,
  numberIsPosInt,
  stringIsUUID,
  stringNotBlank,
} from "@/trpc/utils/validation";
import {
  B2BMeetingStatusEnum,
  B2BQuotationStatusEnum,
  Prisma,
} from "@prisma/client";
import { TRPCError } from "@trpc/server";
import z from "zod";

const DASHBOARD_TIME_ZONE = "Asia/Jakarta";
const ACTIVITY_WINDOW_DAYS = 7;
const STALE_LEAD_DAYS = 14;
const WEEK_WINDOW_DAYS = 7;
const TRAILING_WEEKS = 4;
const SANKEY_WINDOW_DAYS = 90;

const STAGE_ORDER = [
  "lead_identified",
  "triaging",
  "attempting",
  "engaged",
  "qualified",
  "meeting_booked",
  "discovery_done",
  "proposal_negotiation",
  "closed_won",
  "closed_lost",
] as const;
type DashboardStage = (typeof STAGE_ORDER)[number];
const STAGE_LABELS: Record<DashboardStage, string> = {
  lead_identified: "Lead Identified",
  triaging: "Triaging",
  attempting: "Attempting",
  engaged: "Engaged",
  qualified: "Qualified",
  meeting_booked: "Meeting Booked",
  discovery_done: "Discovery Done",
  proposal_negotiation: "Proposal / Negotiation",
  closed_won: "Closed Won",
  closed_lost: "Closed Lost",
};

// Natural lead progression only — Closed Lost/On Hold are exits, not funnel stops.
const FUNNEL_STAGE_ORDER = STAGE_ORDER.filter(
  (stage) => stage !== "closed_lost"
);

export const listB2B = {

  // b2b_meetings across every pipeline/company at once.
  meetings: loggedInProcedure
    .input(
      z.object({
        keyword: stringNotBlank().optional(),
        status: z.enum(B2BMeetingStatusEnum).optional(),
        organizer_id: stringIsUUID().optional(),
        company_id: numberIsID().optional(),
        pipeline_id: numberIsID().optional(),
        page: numberIsPosInt().optional(),
        page_size: numberIsPosInt().optional(),
      })
    )
    .query(async (opts) => {
      const scopeWhere = meetingDataScopeWhere(opts.ctx.user);

      const whereClause: Prisma.B2BMeetingWhereInput = {
        status: opts.input.status,
        organizer_id: opts.input.organizer_id,
        pipeline_id: opts.input.pipeline_id,
        pipeline: {
          ...(scopeWhere.pipeline as Prisma.PipelineWhereInput),
          ...(opts.input.company_id && { company_id: opts.input.company_id }),
        },
        ...(opts.input.keyword && {
          OR: [
            { notes: { contains: opts.input.keyword, mode: "insensitive" } },
            {
              pipeline: {
                company: {
                  name: { contains: opts.input.keyword, mode: "insensitive" },
                },
              },
            },
          ],
        }),
      };

      const paging = calculatePage(
        opts.input,
        await opts.ctx.prisma.b2BMeeting.aggregate({
          _count: true,
          where: whereClause,
        })
      );

      const meetingList = await opts.ctx.prisma.b2BMeeting.findMany({
        include: {
          organizer: { select: { id: true, full_name: true, avatar: true } },
          pipeline: {
            select: {
              id: true,
              company: { select: { id: true, name: true } },
            },
          },
        },
        orderBy: [{ scheduled_at: "asc" }],
        where: whereClause,
        skip: paging.prisma.skip,
        take: paging.prisma.take,
      });

      return {
        code: STATUS_OK,
        message: "Success",
        list: meetingList.map((entry) => ({
          id: entry.id,
          pipeline_id: entry.pipeline_id,
          pipeline_name: entry.pipeline.company.name,
          company_id: entry.pipeline.company.id,
          company_name: entry.pipeline.company.name,
          organizer_id: entry.organizer_id,
          organizer_name: entry.organizer.full_name,
          organizer_avatar: entry.organizer.avatar,
          scheduled_at: entry.scheduled_at,
          held_at: entry.held_at,
          status: entry.status,
          location_or_link: entry.location_or_link,
          created_at: entry.created_at,
          updated_at: entry.updated_at,
        })),
        metapaging: paging.metapaging,
      };
    }),

  quotations: loggedInProcedure
    .input(
      z.object({
        pipeline_id: numberIsID().optional(),
        status: z.enum(B2BQuotationStatusEnum).optional(),
        page: numberIsPosInt().optional(),
        page_size: numberIsPosInt().optional(),
      })
    )
    .query(async (opts) => {
      const canViewInternals = canViewQuotationInternals(opts.ctx.user);
      const whereClause: Prisma.B2BQuotationWhereInput = {
        pipeline_id: opts.input.pipeline_id,
        status: opts.input.status,
        ...quotationDataScopeWhere(opts.ctx.user),
      };

      const paging = calculatePage(
        opts.input,
        await opts.ctx.prisma.b2BQuotation.aggregate({
          _count: true,
          where: whereClause,
        })
      );

      const quotationList = await opts.ctx.prisma.b2BQuotation.findMany({
        include: {
          pipeline: {
            select: { id: true, company: { select: { id: true, name: true } } },
          },
          created_by: { select: { id: true, full_name: true } },
        },
        orderBy: [{ created_at: "desc" }],
        where: whereClause,
        skip: paging.prisma.skip,
        take: paging.prisma.take,
      });

      return {
        code: STATUS_OK,
        message: "Success",
        list: quotationList.map((entry) => ({
          id: entry.id,
          pipeline_id: entry.pipeline.id,
          pipeline_name: entry.pipeline.company.name,
          company_id: entry.pipeline.company.id,
          company_name: entry.pipeline.company.name,
          version: entry.version,
          is_current: entry.is_current,
          status: entry.status,
          source_type: entry.source_type,
          package_type: entry.package_type,
          net_value: entry.net_value,
          invoice_amount: entry.invoice_amount,
          requires_review: entry.requires_review,
          created_by_name: entry.created_by.full_name,
          created_at: entry.created_at,
          ...(canViewInternals && { margin_pct: entry.margin_pct }),
        })),
        metapaging: paging.metapaging,
      };
    }),

  // Manager Review queue — every quotation currently awaiting a decision.
  quotationApprovalQueue: loggedInProcedure
    .input(
      z.object({
        page: numberIsPosInt().optional(),
        page_size: numberIsPosInt().optional(),
      })
    )
    .query(async (opts) => {
      const whereClause: Prisma.B2BQuotationWhereInput = {
        status: "MANAGER_REVIEW",
        ...quotationDataScopeWhere(opts.ctx.user),
      };

      const paging = calculatePage(
        opts.input,
        await opts.ctx.prisma.b2BQuotation.aggregate({
          _count: true,
          where: whereClause,
        })
      );

      const quotationList = await opts.ctx.prisma.b2BQuotation.findMany({
        include: {
          pipeline: {
            select: { id: true, company: { select: { id: true, name: true } } },
          },
          created_by: { select: { id: true, full_name: true } },
        },
        orderBy: [{ created_at: "asc" }],
        where: whereClause,
        skip: paging.prisma.skip,
        take: paging.prisma.take,
      });

      return {
        code: STATUS_OK,
        message: "Success",
        list: quotationList.map((entry) => ({
          id: entry.id,
          pipeline_id: entry.pipeline.id,
          pipeline_name: entry.pipeline.company.name,
          company_id: entry.pipeline.company.id,
          company_name: entry.pipeline.company.name,
          version: entry.version,
          source_type: entry.source_type,
          package_type: entry.package_type,
          net_value: entry.net_value,
          margin_pct: entry.margin_pct,
          created_by_name: entry.created_by.full_name,
          created_at: entry.created_at,
        })),
        metapaging: paging.metapaging,
      };
    }),

  // Meetings only — the calendar reads action due dates from the Actions API.
  calendar: loggedInProcedure
    .input(
      z.object({
        start_date: z.iso.date(),
        end_date: z.iso.date(),
        company_id: numberIsID().optional(),
        pipeline_id: numberIsID().optional(),
      })
    )
    .query(async (opts) => {
      const startDate = new Date(`${opts.input.start_date}T00:00:00.000Z`);
      const endDate = new Date(`${opts.input.end_date}T00:00:00.000Z`);

      if (endDate < startDate) {
        throw new TRPCError({
          code: STATUS_BAD_REQUEST,
          message: "end_date must be on or after start_date.",
        });
      }

      const meetingWhereClause: Prisma.B2BMeetingWhereInput = {
        scheduled_at: { gte: startDate, lte: endDate },
        pipeline_id: opts.input.pipeline_id,
        pipeline: opts.input.company_id
          ? { company_id: opts.input.company_id }
          : undefined,
      };

      const meetingList = await opts.ctx.prisma.b2BMeeting.findMany({
        include: {
          organizer: { select: { id: true, full_name: true, avatar: true } },
          pipeline: {
            select: {
              id: true,
              company: { select: { id: true, name: true } },
            },
          },
        },
        orderBy: [{ scheduled_at: "asc" }],
        where: meetingWhereClause,
      });

      const meetingEvents = meetingList.map((entry) => ({
        id: entry.id,
        type: "b2b_meeting" as const,
        title: `Meeting: ${entry.pipeline.company.name}`,
        pipeline_id: entry.pipeline_id,
        pipeline_name: entry.pipeline.company.name,
        company_id: entry.pipeline.company.id,
        company_name: entry.pipeline.company.name,
        // due_date is the calendar page's shared grouping field — holds scheduled_at for a meeting.
        due_date: entry.scheduled_at,
        status: entry.status,
        location_or_link: entry.location_or_link,
        organizer_id: entry.organizer_id,
        organizer_name: entry.organizer.full_name,
        organizer_avatar: entry.organizer.avatar,
        created_at: entry.created_at,
        updated_at: entry.updated_at,
      }));

      return {
        code: STATUS_OK,
        message: "Success",
        list: meetingEvents,
        meta: {
          start_date: opts.input.start_date,
          end_date: opts.input.end_date,
          total_data: meetingEvents.length,
        },
      };
    }),

  // Actionable operational summary for the OS home dashboard.
  homeSummary: loggedInProcedure.query(async (opts) => {
    const userId = opts.ctx.user.id;
    const now = new Date();
    const activitySince = new Date(
      now.getTime() - ACTIVITY_WINDOW_DAYS * 24 * 60 * 60 * 1000
    );
    const staleSince = new Date(
      now.getTime() - STALE_LEAD_DAYS * 24 * 60 * 60 * 1000
    );
    const staleLeadWhere: Prisma.PipelineWhereInput = {
      ...pipelineDataScopeWhere(opts.ctx.user),
      updated_at: { lt: staleSince },
      stage_code: {
        notIn: [
          "closed_won",
          "closed_lost",
        ],
      },
    };

    // This actor's own kicked-back drafts, plus (for reviewers) the Manager Review queue.
    const quotationsPendingWhere: Prisma.B2BQuotationWhereInput = {
      OR: [
        { status: "NEEDS_REVISION", created_by_id: userId },
        { status: "MANAGER_REVIEW", ...quotationDataScopeWhere(opts.ctx.user) },
      ],
    };

    const [
      staleLeadCount,
      staleLeads,
      recentPipelines,
      activePipelinesForConflictCheck,
      quotationsPendingCount,
      quotationsPending,
    ] = await Promise.all([
      opts.ctx.prisma.pipeline.count({ where: staleLeadWhere }),
      opts.ctx.prisma.pipeline.findMany({
        where: staleLeadWhere,
        include: {
          company: { select: { name: true } },
        },
        orderBy: [{ updated_at: "asc" }],
        take: 20,
      }),
      opts.ctx.prisma.pipeline.findMany({
        where: {
          ...pipelineDataScopeWhere(opts.ctx.user),
          OR: [
            { created_at: { gte: activitySince } },
            { updated_at: { gte: activitySince } },
          ],
        },
        include: {
          company: { select: { name: true } },
        },
        orderBy: [{ updated_at: "desc" }],
        take: 12,
      }),
      // Active in-scope pipelines, for the ownership-conflict check below (two owners, same company).
      opts.ctx.prisma.pipeline.findMany({
        where: {
          ...pipelineDataScopeWhere(opts.ctx.user),
          stage_code: { notIn: ["closed_won", "closed_lost"] },
        },
        select: {
          id: true,
          company_id: true,
          company: { select: { name: true } },
          sales_owner_id: true,
          sales_owner: { select: { full_name: true } },
        },
      }),
      opts.ctx.prisma.b2BQuotation.count({ where: quotationsPendingWhere }),
      opts.ctx.prisma.b2BQuotation.findMany({
        where: quotationsPendingWhere,
        include: {
          pipeline: {
            select: { id: true, company: { select: { name: true } } },
          },
        },
        orderBy: [{ created_at: "asc" }],
        take: 5,
      }),
    ]);

    const ownershipConflictsByCompany = new Map<
      number,
      {
        company_id: number;
        company_name: string;
        pipelines: { id: number; name: string; owner_name: string }[];
      }
    >();
    for (const entry of activePipelinesForConflictCheck) {
      const bucket = ownershipConflictsByCompany.get(entry.company_id) ?? {
        company_id: entry.company_id,
        company_name: entry.company.name,
        pipelines: [],
      };
      bucket.pipelines.push({
        id: entry.id,
        name: entry.company.name,
        owner_name: entry.sales_owner.full_name,
      });
      ownershipConflictsByCompany.set(entry.company_id, bucket);
    }
    const ownershipConflicts = [...ownershipConflictsByCompany.values()].filter(
      (bucket) => new Set(bucket.pipelines.map((p) => p.owner_name)).size > 1
    );

    const activity = [
      ...recentPipelines.map((entry) => {
        const isNew = entry.created_at >= activitySince;
        return {
          id: `pipeline-${entry.id}`,
          type: isNew ? ("lead_created" as const) : ("lead_updated" as const),
          title: entry.company.name,
          description: entry.company.name,
          pipeline_id: entry.id,
          occurred_at: isNew ? entry.created_at : entry.updated_at,
        };
      }),
    ]
      .sort(
        (left, right) =>
          right.occurred_at.getTime() - left.occurred_at.getTime()
      )
      .slice(0, 8);

    return {
      code: STATUS_OK,
      message: "Success",
      user: {
        id: opts.ctx.user.id,
        full_name: opts.ctx.user.full_name,
      },
      activity,
      attention: {
        totals: {
          stale_leads: staleLeadCount,
          ownership_conflicts: ownershipConflicts.length,
          quotations_pending: quotationsPendingCount,
        },
        ownership_conflicts: ownershipConflicts.slice(0, 5),
        quotations_pending: quotationsPending.map((entry) => ({
          id: entry.id,
          pipeline_id: entry.pipeline_id,
          pipeline_name: entry.pipeline.company.name,
          company_name: entry.pipeline.company.name,
          version: entry.version,
          status: entry.status,
          net_value: entry.net_value,
        })),
        stale_leads: staleLeads
          .map((entry) => {
            const lastActivityAt = entry.updated_at;
            return {
              id: entry.id,
              company_name: entry.company.name,
              pipeline_name: entry.company.name,
              stage: entry.stage_code as PipelineStage,
              last_activity_at: lastActivityAt,
              inactive_days: Math.floor(
                (now.getTime() - lastActivityAt.getTime()) / 86_400_000
              ),
            };
          })
          .sort((left, right) => right.inactive_days - left.inactive_days)
          .slice(0, 5),
      },
      meta: {
        generated_at: now,
        time_zone: DASHBOARD_TIME_ZONE,
        activity_since: activitySince,
        activity_window_days: ACTIVITY_WINDOW_DAYS,
        stale_lead_days: STALE_LEAD_DAYS,
      },
    };
  }),

  dashboardAnalytics: loggedInProcedure.query(async (opts) => {
    const now = new Date();
    const weekStart = new Date(now.getTime() - WEEK_WINDOW_DAYS * 86_400_000);
    const trailingStart = new Date(
      now.getTime() - (TRAILING_WEEKS + 1) * WEEK_WINDOW_DAYS * 86_400_000
    );
    const trailingEnd = new Date(
      now.getTime() - WEEK_WINDOW_DAYS * 86_400_000
    );
    const rows = await opts.ctx.prisma.pipeline.findMany({
      where: pipelineDataScopeWhere(opts.ctx.user),
      select: { stage_code: true },
    });
    const stageCountMap = new Map<DashboardStage, number>();
    for (const row of rows) {
      const stage = row.stage_code as DashboardStage;
      if (STAGE_ORDER.includes(stage)) {
        stageCountMap.set(stage, (stageCountMap.get(stage) ?? 0) + 1);
      }
    }
    const totalLeads = [...stageCountMap.values()].reduce(
      (sum, count) => sum + count,
      0
    );
    const stage_distribution = STAGE_ORDER.map((stage) => {
      const count = stageCountMap.get(stage) ?? 0;
      return {
        stage,
        label: STAGE_LABELS[stage],
        count,
        percentage: totalLeads > 0 ? (count / totalLeads) * 100 : 0,
      };
    });
    const leadIdentifiedCount = stageCountMap.get("lead_identified") ?? 0;
    const funnel = FUNNEL_STAGE_ORDER.map((stage) => ({
      stage,
      label: STAGE_LABELS[stage],
      count: stageCountMap.get(stage) ?? 0,
      percentage:
        leadIdentifiedCount > 0
          ? ((stageCountMap.get(stage) ?? 0) / leadIdentifiedCount) * 100
          : 0,
    }));
    const weekly_conversion = STAGE_ORDER.map((stage) => ({
      stage,
      label: STAGE_LABELS[stage],
      this_week: 0,
      trailing_avg: 0,
      delta_pct: null,
    }));
    return {
      code: STATUS_OK,
      message: "Success",
      stage_distribution,
      funnel,
      sankey: { nodes: [], links: [] },
      weekly_conversion,
      win_rate_this_week: null,
      reason_distribution: [],
      meta: {
        generated_at: now,
        week_window_days: WEEK_WINDOW_DAYS,
        week_start: weekStart,
        week_end: now,
        trailing_weeks: TRAILING_WEEKS,
        trailing_start: trailingStart,
        trailing_end: trailingEnd,
        sankey_window_days: SANKEY_WINDOW_DAYS,
      },
    };
  }),

  /* Legacy stage-history analytics retained below for migration reference.
  dashboardAnalytics: loggedInProcedure.query(async (opts) => {
    // Scope by data_scope, not role: who may act is a separate question from which records they see.
    const isOwnScoped = opts.ctx.user.data_scope === DataScopeEnum.OWN;
    const ownerScope: Prisma.B2BPipelineWhereInput = isOwnScoped
      ? { owner_id: opts.ctx.user.id }
      : {};
    const historyOwnerScope: Prisma.B2BPipelineStageHistoryWhereInput =
      isOwnScoped ? { pipeline: { owner_id: opts.ctx.user.id } } : {};

    const now = new Date();
    const weekStart = new Date(now.getTime() - WEEK_WINDOW_DAYS * 86_400_000);
    const sankeyStart = new Date(
      now.getTime() - SANKEY_WINDOW_DAYS * 86_400_000
    );
    const trailingWindows = Array.from({ length: TRAILING_WEEKS }, (_, i) => ({
      start: new Date(now.getTime() - (i + 2) * WEEK_WINDOW_DAYS * 86_400_000),
      end: new Date(now.getTime() - (i + 1) * WEEK_WINDOW_DAYS * 86_400_000),
    }));

    const [stageGroups, sankeyGroups, thisWeekGroups, trailingGroups, reasonGroups] =
      await Promise.all([
        opts.ctx.prisma.b2BPipeline.groupBy({
          by: ["stage"],
          where: ownerScope,
          _count: true,
        }),
        opts.ctx.prisma.b2BPipelineStageHistory.groupBy({
          by: ["from_stage", "to_stage"],
          where: { created_at: { gte: sankeyStart }, ...historyOwnerScope },
          _count: true,
        }),
        opts.ctx.prisma.b2BPipelineStageHistory.groupBy({
          by: ["to_stage"],
          where: { created_at: { gte: weekStart }, ...historyOwnerScope },
          _count: true,
        }),
        Promise.all(
          trailingWindows.map((window) =>
            opts.ctx.prisma.b2BPipelineStageHistory.groupBy({
              by: ["to_stage"],
              where: {
                created_at: { gte: window.start, lt: window.end },
                ...historyOwnerScope,
              },
              _count: true,
            })
          )
        ),
        opts.ctx.prisma.b2BPipelineStageHistory.groupBy({
          by: ["reason_code"],
          where: {
            to_stage: { in: [B2BStageEnum.CLOSED_LOST, B2BStageEnum.ON_HOLD] },
            created_at: { gte: weekStart },
            ...historyOwnerScope,
          },
          _count: true,
        }),
      ]);

    const stageCountMap = new Map(
      stageGroups.map((group) => [group.stage, group._count])
    );
    const totalLeads = stageGroups.reduce((sum, group) => sum + group._count, 0);

    const stage_distribution = STAGE_ORDER.map((stage) => {
      const count = stageCountMap.get(stage) ?? 0;
      return {
        stage,
        label: STAGE_LABELS[stage],
        count,
        percentage: totalLeads > 0 ? (count / totalLeads) * 100 : 0,
      };
    });

    const leadIdentifiedCount =
      stageCountMap.get(B2BStageEnum.LEAD_IDENTIFIED) ?? 0;
    const funnel = FUNNEL_STAGE_ORDER.map((stage) => {
      const count = stageCountMap.get(stage) ?? 0;
      return {
        stage,
        label: STAGE_LABELS[stage],
        count,
        percentage:
          leadIdentifiedCount > 0 ? (count / leadIdentifiedCount) * 100 : 0,
      };
    });

    const stagePosition = new Map(STAGE_ORDER.map((stage, index) => [stage, index]));
    // recharts' Sankey crashes (stack overflow) on cyclic/backward links, so only keep transitions that move forward through STAGE_ORDER.
    const forwardGroups = sankeyGroups.filter(
      (group): group is typeof group & { from_stage: B2BStageEnum } =>
        group.from_stage !== null &&
        stagePosition.get(group.to_stage)! > stagePosition.get(group.from_stage)!
    );

    // Only include stages referenced by a transition this window — an unconnected node just clutters the diagram.
    const referencedStages = new Set<B2BStageEnum>();
    for (const group of forwardGroups) {
      referencedStages.add(group.from_stage);
      referencedStages.add(group.to_stage);
    }
    const sankeyStageOrder = STAGE_ORDER.filter((stage) =>
      referencedStages.has(stage)
    );
    const sankeyNodeIndex = new Map(
      sankeyStageOrder.map((stage, index) => [stage, index])
    );
    const sankey = {
      nodes: sankeyStageOrder.map((stage) => ({ name: STAGE_LABELS[stage] })),
      links: forwardGroups.map((group) => ({
        source: sankeyNodeIndex.get(group.from_stage)!,
        target: sankeyNodeIndex.get(group.to_stage)!,
        value: group._count,
      })),
    };

    const thisWeekCountMap = new Map(
      thisWeekGroups.map((group) => [group.to_stage, group._count])
    );
    const trailingCountMaps = trailingGroups.map(
      (groups) => new Map(groups.map((group) => [group.to_stage, group._count]))
    );
    const weekly_conversion = STAGE_ORDER.map((stage) => {
      const thisWeek = thisWeekCountMap.get(stage) ?? 0;
      const trailingSum = trailingCountMaps.reduce(
        (sum, map) => sum + (map.get(stage) ?? 0),
        0
      );
      const trailingAvg = trailingSum / TRAILING_WEEKS;
      return {
        stage,
        label: STAGE_LABELS[stage],
        this_week: thisWeek,
        trailing_avg: Math.round(trailingAvg * 10) / 10,
        delta_pct:
          trailingAvg > 0
            ? ((thisWeek - trailingAvg) / trailingAvg) * 100
            : null,
      };
    });

    const closedWonThisWeek =
      thisWeekCountMap.get(B2BStageEnum.CLOSED_WON) ?? 0;
    const closedLostThisWeek =
      thisWeekCountMap.get(B2BStageEnum.CLOSED_LOST) ?? 0;
    const winRateDenominator = closedWonThisWeek + closedLostThisWeek;
    const win_rate_this_week =
      winRateDenominator > 0
        ? (closedWonThisWeek / winRateDenominator) * 100
        : null;

    const reason_distribution = reasonGroups
      .map((group) => ({
        reason: group.reason_code,
        label: group.reason_code
          ? REASON_LABELS[group.reason_code]
          : "Not specified",
        count: group._count,
      }))
      .sort((left, right) => right.count - left.count);

    return {
      code: STATUS_OK,
      message: "Success",
      stage_distribution,
      funnel,
      sankey,
      weekly_conversion,
      win_rate_this_week,
      reason_distribution,
      meta: {
        generated_at: now,
        week_window_days: WEEK_WINDOW_DAYS,
        week_start: weekStart,
        week_end: now,
        trailing_weeks: TRAILING_WEEKS,
        trailing_start: trailingWindows[TRAILING_WEEKS - 1].start,
        trailing_end: trailingWindows[0].end,
        sankey_window_days: SANKEY_WINDOW_DAYS,
      },
    };
  }),
  */
};
