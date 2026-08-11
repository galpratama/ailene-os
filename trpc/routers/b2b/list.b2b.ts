import { Optional } from "@/lib/optional-type";
import { STATUS_BAD_REQUEST, STATUS_OK } from "@/lib/status_code";
import { administratorProcedure, roleBasedProcedure } from "@/trpc/init";
import {
  actionDataScopeWhere,
  meetingDataScopeWhere,
  pipelineDataScopeWhere,
} from "@/trpc/utils/data_scope";
import { calculatePage } from "@/trpc/utils/paging";
import { findOrganizationDuplicates } from "@/trpc/utils/organization_dedupe";
import {
  numberIsID,
  numberIsPosInt,
  stringIsUUID,
  stringNotBlank,
} from "@/trpc/utils/validation";
import {
  B2BActionPriorityEnum,
  B2BActionStatusEnum,
  B2BLostReasonEnum,
  B2BMeetingStatusEnum,
  B2BProbabilityStatusEnum,
  B2BStageEnum,
  DuplicateReviewStatusEnum,
  OrganizationStatusEnum,
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

const STAGE_ORDER: B2BStageEnum[] = [
  B2BStageEnum.LEAD_IDENTIFIED,
  B2BStageEnum.CONTACTED,
  B2BStageEnum.REPLIED,
  B2BStageEnum.SHOW_INTEREST,
  B2BStageEnum.MEETING_BOOKED,
  B2BStageEnum.NEGOTIATION,
  B2BStageEnum.VERBAL_COMMIT,
  B2BStageEnum.CLOSED_WON,
  B2BStageEnum.CLOSED_LOST,
  B2BStageEnum.ON_HOLD,
];

const STAGE_LABELS: Record<B2BStageEnum, string> = {
  LEAD_IDENTIFIED: "Lead Identified",
  CONTACTED: "Contacted",
  REPLIED: "Replied",
  SHOW_INTEREST: "Show Interest",
  MEETING_BOOKED: "Meeting Booked",
  NEGOTIATION: "Negotiation",
  VERBAL_COMMIT: "Verbal Commit",
  CLOSED_WON: "Closed Won",
  CLOSED_LOST: "Closed Lost",
  ON_HOLD: "On Hold",
};

// Natural lead progression only — Closed Lost/On Hold are exits, not funnel stops.
const FUNNEL_STAGE_ORDER: B2BStageEnum[] = [
  B2BStageEnum.LEAD_IDENTIFIED,
  B2BStageEnum.CONTACTED,
  B2BStageEnum.REPLIED,
  B2BStageEnum.SHOW_INTEREST,
  B2BStageEnum.MEETING_BOOKED,
  B2BStageEnum.NEGOTIATION,
  B2BStageEnum.VERBAL_COMMIT,
  B2BStageEnum.CLOSED_WON,
];

const REASON_LABELS: Record<B2BLostReasonEnum, string> = {
  BUDGET_TOO_HIGH: "Budget Too High",
  TIMING_NOT_RIGHT: "Timing Not Right",
  LOST_TO_COMPETITOR: "Lost to Competitor",
  NO_RESPONSE: "No Response",
  NOT_A_FIT: "Not a Fit",
  INTERNAL_PRIORITY_SHIFT: "Internal Priority Shift",
  OTHER: "Other",
};

function getCalendarDateInTimeZone(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value])
  );
  return new Date(
    `${values.year}-${values.month}-${values.day}T00:00:00.000Z`
  );
}

export const listB2B = {
  companies: administratorProcedure
    .input(
      z.object({
        keyword: stringNotBlank().optional(),
        status: z.enum(OrganizationStatusEnum).optional(),
        include_archived: z.boolean().optional(),
        page: numberIsPosInt().optional(),
        page_size: numberIsPosInt().optional(),
      })
    )
    .query(async (opts) => {
      const whereClause: Prisma.B2BCompanyWhereInput = {
        status: opts.input.status
          ? opts.input.status
          : opts.input.include_archived
            ? undefined
            : { not: "ARCHIVED" },
      };
      if (opts.input.keyword !== undefined) {
        whereClause.OR = [
          { name: { contains: opts.input.keyword, mode: "insensitive" } },
          { pic_name: { contains: opts.input.keyword, mode: "insensitive" } },
          { pic_email: { contains: opts.input.keyword, mode: "insensitive" } },
        ];
      }

      const paging = calculatePage(
        opts.input,
        await opts.ctx.prisma.b2BCompany.aggregate({
          _count: true,
          where: whereClause,
        })
      );

      const companyList = await opts.ctx.prisma.b2BCompany.findMany({
        include: {
          industry: { select: { id: true, industry_name: true } },
        },
        orderBy: [{ name: "asc" }],
        where: whereClause,
        skip: paging.prisma.skip,
        take: paging.prisma.take,
      });

      return {
        code: STATUS_OK,
        message: "Success",
        list: companyList.map((entry) => ({
          id: entry.id,
          name: entry.name,
          status: entry.status,
          industry_id: entry.industry.id,
          industry_name: entry.industry.industry_name,
          pic_name: entry.pic_name,
          pic_job_title: entry.pic_job_title,
          pic_wa: entry.pic_wa,
          pic_email: entry.pic_email,
          image_url: entry.image_url,
        })),
        metapaging: paging.metapaging,
      };
    }),

  checkOrganizationDuplicate: administratorProcedure
    .input(
      z.object({
        name: stringNotBlank(),
        email: z.string().nullable().optional(),
        phone: z.string().nullable().optional(),
      })
    )
    .query(async (opts) => {
      const matches = await findOrganizationDuplicates(opts.ctx.prisma, {
        name: opts.input.name,
        email: opts.input.email,
        phone: opts.input.phone,
      });
      return {
        code: STATUS_OK,
        message: "Success",
        matches,
      };
    }),

  contacts: administratorProcedure
    .input(
      z.object({
        keyword: stringNotBlank().optional(),
        organization_id: numberIsID().optional(),
        page: numberIsPosInt().optional(),
        page_size: numberIsPosInt().optional(),
      })
    )
    .query(async (opts) => {
      const whereClause: Prisma.ContactWhereInput = {
        organizations: opts.input.organization_id
          ? { some: { organization_id: opts.input.organization_id } }
          : undefined,
      };
      if (opts.input.keyword !== undefined) {
        whereClause.OR = [
          { full_name: { contains: opts.input.keyword, mode: "insensitive" } },
          { email: { contains: opts.input.keyword, mode: "insensitive" } },
        ];
      }

      const paging = calculatePage(
        opts.input,
        await opts.ctx.prisma.contact.aggregate({
          _count: true,
          where: whereClause,
        })
      );

      const contactList = await opts.ctx.prisma.contact.findMany({
        orderBy: [{ full_name: "asc" }],
        where: whereClause,
        skip: paging.prisma.skip,
        take: paging.prisma.take,
      });

      return {
        code: STATUS_OK,
        message: "Success",
        list: contactList,
        metapaging: paging.metapaging,
      };
    }),

  organizationDuplicateReviews: roleBasedProcedure([
    "Administrator",
    "Super Admin",
    "Manager",
  ])
    .input(
      z.object({
        status: z.enum(DuplicateReviewStatusEnum).optional(),
        page: numberIsPosInt().optional(),
        page_size: numberIsPosInt().optional(),
      })
    )
    .query(async (opts) => {
      const whereClause: Prisma.OrganizationDuplicateReviewWhereInput = {
        status: opts.input.status ?? "PENDING",
      };

      const paging = calculatePage(
        opts.input,
        await opts.ctx.prisma.organizationDuplicateReview.aggregate({
          _count: true,
          where: whereClause,
        })
      );

      const reviewList = await opts.ctx.prisma.organizationDuplicateReview.findMany({
        include: {
          requested_by: { select: { id: true, full_name: true } },
          resolved_by: { select: { id: true, full_name: true } },
        },
        orderBy: [{ created_at: "desc" }],
        where: whereClause,
        skip: paging.prisma.skip,
        take: paging.prisma.take,
      });

      return {
        code: STATUS_OK,
        message: "Success",
        list: reviewList.map((entry) => ({
          id: entry.id,
          proposed_name: entry.proposed_name,
          proposed_pic_name: entry.proposed_pic_name,
          proposed_pic_email: entry.proposed_pic_email,
          matched_organization_ids: entry.matched_organization_ids,
          status: entry.status,
          requested_by_id: entry.requested_by.id,
          requested_by_name: entry.requested_by.full_name,
          resolved_by_name: entry.resolved_by?.full_name ?? null,
          resolved_at: entry.resolved_at,
          resolution_note: entry.resolution_note,
          created_at: entry.created_at,
        })),
        metapaging: paging.metapaging,
      };
    }),

  pipelines: administratorProcedure
    .input(
      z.object({
        stage: z.enum(B2BStageEnum).optional(),
        probability_status: z.enum(B2BProbabilityStatusEnum).optional(),
        owner_id: stringIsUUID().optional(),
        keyword: stringNotBlank().optional(),
        year: z.number().int().min(2020).max(2100).optional(),
        page: numberIsPosInt().optional(),
        page_size: numberIsPosInt().optional(),
      })
    )
    .query(async (opts) => {
      const whereClause: Prisma.B2BPipelineWhereInput = {
        stage: opts.input.stage,
        probability_status: opts.input.probability_status,
        owner_id: opts.input.owner_id,
        // Spread after owner_id so an OWN scope always wins over whatever the caller sent.
        ...pipelineDataScopeWhere(opts.ctx.user),
        OR: undefined as Optional<
          [
            { name: { contains: string; mode: "insensitive" } },
            { company: { name: { contains: string; mode: "insensitive" } } },
            {
              company: { pic_name: { contains: string; mode: "insensitive" } };
            },
            {
              company: { pic_email: { contains: string; mode: "insensitive" } };
            },
          ]
        >,
      };

      if (opts.input.keyword !== undefined) {
        whereClause.OR = [
          { name: { contains: opts.input.keyword, mode: "insensitive" } },
          {
            company: {
              name: { contains: opts.input.keyword, mode: "insensitive" },
            },
          },
          {
            company: {
              pic_name: { contains: opts.input.keyword, mode: "insensitive" },
            },
          },
          {
            company: {
              pic_email: { contains: opts.input.keyword, mode: "insensitive" },
            },
          },
        ];
      }

      if (opts.input.year !== undefined) {
        const yearStart = new Date(`${opts.input.year}-01-01T00:00:00.000Z`);
        const yearEnd = new Date(`${opts.input.year + 1}-01-01T00:00:00.000Z`);
        // Match leads in this year OR leads whose project window isn't set yet
        // (so freshly-identified leads without a start_month still show up).
        whereClause.AND = [
          {
            OR: [
              { project_start_month: { gte: yearStart, lt: yearEnd } },
              { project_start_month: null },
            ],
          },
        ];
      }

      const paging = calculatePage(
        opts.input,
        await opts.ctx.prisma.b2BPipeline.aggregate({
          _count: true,
          where: whereClause,
        })
      );

      const [pipelineList, statsRows] = await Promise.all([
        opts.ctx.prisma.b2BPipeline.findMany({
          include: {
            owner: { select: { id: true, full_name: true, avatar: true } },
            company: {
              select: {
                id: true,
                name: true,
                image_url: true,
                industry: { select: { id: true, industry_name: true } },
              },
            },
          },
          orderBy: [{ project_value: "desc" }],
          where: whereClause,
          skip: paging.prisma.skip,
          take: paging.prisma.take,
        }),
        opts.ctx.prisma.b2BPipeline.findMany({
          select: {
            project_value: true,
            probability: true,
            stage: true,
          },
          where: whereClause,
        }),
      ]);

      const returnedList = pipelineList.map((entry) => ({
        id: entry.id,
        name: entry.name,
        company_id: entry.company.id,
        company_name: entry.company.name,
        company_image_url: entry.company.image_url,
        industry_id: entry.company.industry.id,
        industry_name: entry.company.industry.industry_name,
        stage: entry.stage,
        probability: entry.probability,
        probability_status: entry.probability_status,
        project_value: entry.project_value,
        project_start_month: entry.project_start_month,
        project_end_month: entry.project_end_month,
        owner_id: entry.owner.id,
        owner_name: entry.owner.full_name,
        owner_avatar: entry.owner.avatar,
        created_at: entry.created_at,
        updated_at: entry.updated_at,
      }));

      // Scorecard aggregates (scoped to the same filter as the list)
      let pipelineValue = 0;
      let closedWonValue = 0;
      let weightedValue = 0;
      for (const row of statsRows) {
        const value = Number(row.project_value);
        pipelineValue += value;
        if (row.stage === B2BStageEnum.CLOSED_WON) {
          closedWonValue += value;
        }
        weightedValue += (value * row.probability) / 100;
      }

      return {
        code: STATUS_OK,
        message: "Success",
        list: returnedList,
        scorecards: {
          pipeline_value: pipelineValue,
          closed_won_value: closedWonValue,
          weighted_value: Math.round(weightedValue),
        },
        metapaging: {
          ...paging.metapaging,
          keyword: opts.input.keyword,
          year: opts.input.year,
        },
      };
    }),

  // Same b2b_actions data as a single pipeline's actions would be, but
  // across every pipeline/company at once — for the global Tasks board.
  allActions: administratorProcedure
    .input(
      z.object({
        keyword: stringNotBlank().optional(),
        status: z.enum(B2BActionStatusEnum).optional(),
        assignee_id: stringIsUUID().optional(),
        company_id: numberIsID().optional(),
        pipeline_id: numberIsID().optional(),
        page: numberIsPosInt().optional(),
        page_size: numberIsPosInt().optional(),
      })
    )
    .query(async (opts) => {
      const scopeWhere = actionDataScopeWhere(opts.ctx.user);

      const whereClause: Prisma.B2BActionWhereInput = {
        status: opts.input.status,
        assignee_id: opts.input.assignee_id,
        pipeline_id: opts.input.pipeline_id,
        pipeline: {
          ...(scopeWhere.pipeline as Prisma.B2BPipelineWhereInput),
          ...(opts.input.company_id && { company_id: opts.input.company_id }),
        },
        ...(opts.input.keyword && {
          OR: [
            { name: { contains: opts.input.keyword, mode: "insensitive" } },
            { summary: { contains: opts.input.keyword, mode: "insensitive" } },
          ],
        }),
      };

      const paging = calculatePage(
        opts.input,
        await opts.ctx.prisma.b2BAction.aggregate({
          _count: true,
          where: whereClause,
        })
      );

      const actionList = await opts.ctx.prisma.b2BAction.findMany({
        include: {
          assignee: { select: { id: true, full_name: true, avatar: true } },
          pipeline: {
            select: {
              id: true,
              name: true,
              company: { select: { id: true, name: true } },
            },
          },
        },
        orderBy: [{ due_date: "asc" }, { created_at: "asc" }],
        where: whereClause,
        skip: paging.prisma.skip,
        take: paging.prisma.take,
      });

      return {
        code: STATUS_OK,
        message: "Success",
        list: actionList.map((entry) => ({
          id: entry.id,
          pipeline_id: entry.pipeline_id,
          pipeline_name: entry.pipeline.name,
          company_id: entry.pipeline.company.id,
          company_name: entry.pipeline.company.name,
          name: entry.name,
          summary: entry.summary,
          status: entry.status,
          priority: entry.priority,
          due_date: entry.due_date,
          assignee_id: entry.assignee_id,
          assignee_name: entry.assignee?.full_name ?? null,
          assignee_avatar: entry.assignee?.avatar ?? null,
          created_at: entry.created_at,
          updated_at: entry.updated_at,
        })),
        metapaging: paging.metapaging,
      };
    }),

  // Same b2b_meetings data as a single pipeline's meetings would be, but across every
  // pipeline/company at once — for a global Meetings board, mirroring allActions.
  meetings: administratorProcedure
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
          ...(scopeWhere.pipeline as Prisma.B2BPipelineWhereInput),
          ...(opts.input.company_id && { company_id: opts.input.company_id }),
        },
        ...(opts.input.keyword && {
          OR: [
            { notes: { contains: opts.input.keyword, mode: "insensitive" } },
            {
              pipeline: {
                name: { contains: opts.input.keyword, mode: "insensitive" },
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
              name: true,
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
          pipeline_name: entry.pipeline.name,
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

  calendar: administratorProcedure
    .input(
      z.object({
        start_date: z.iso.date(),
        end_date: z.iso.date(),
        status: z.enum(B2BActionStatusEnum).optional(),
        priority: z.enum(B2BActionPriorityEnum).optional(),
        assignee_id: stringIsUUID().optional(),
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

      const actionWhereClause: Prisma.B2BActionWhereInput = {
        due_date: { gte: startDate, lte: endDate },
        status: opts.input.status,
        priority: opts.input.priority,
        assignee_id: opts.input.assignee_id,
        pipeline_id: opts.input.pipeline_id,
        pipeline: opts.input.company_id
          ? { company_id: opts.input.company_id }
          : undefined,
      };

      // Meetings have no status/priority/assignee of their own (see B2BMeeting) — those
      // filters only narrow actions; a meeting only respects the shared date/pipeline/company ones.
      const meetingWhereClause: Prisma.B2BMeetingWhereInput = {
        scheduled_at: { gte: startDate, lte: endDate },
        pipeline_id: opts.input.pipeline_id,
        pipeline: opts.input.company_id
          ? { company_id: opts.input.company_id }
          : undefined,
      };

      const [actionList, meetingList] = await Promise.all([
        opts.ctx.prisma.b2BAction.findMany({
          include: {
            assignee: { select: { id: true, full_name: true, avatar: true } },
            pipeline: {
              select: {
                id: true,
                name: true,
                company: { select: { id: true, name: true } },
              },
            },
          },
          orderBy: [
            { due_date: "asc" },
            { priority: "desc" },
            { created_at: "asc" },
          ],
          where: actionWhereClause,
        }),
        opts.ctx.prisma.b2BMeeting.findMany({
          include: {
            organizer: { select: { id: true, full_name: true, avatar: true } },
            pipeline: {
              select: {
                id: true,
                name: true,
                company: { select: { id: true, name: true } },
              },
            },
          },
          orderBy: [{ scheduled_at: "asc" }],
          where: meetingWhereClause,
        }),
      ]);

      const actionEvents = actionList.map((entry) => ({
        id: entry.id,
        type: "b2b_action" as const,
        title: entry.name,
        pipeline_id: entry.pipeline_id,
        pipeline_name: entry.pipeline.name,
        company_id: entry.pipeline.company.id,
        company_name: entry.pipeline.company.name,
        name: entry.name,
        summary: entry.summary,
        status: entry.status,
        priority: entry.priority,
        due_date: entry.due_date,
        assignee_id: entry.assignee_id,
        assignee_name: entry.assignee?.full_name ?? null,
        assignee_avatar: entry.assignee?.avatar ?? null,
        created_at: entry.created_at,
        updated_at: entry.updated_at,
      }));

      const meetingEvents = meetingList.map((entry) => ({
        id: entry.id,
        type: "b2b_meeting" as const,
        title: `Meeting: ${entry.pipeline.company.name}`,
        pipeline_id: entry.pipeline_id,
        pipeline_name: entry.pipeline.name,
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

      const combinedList = [...actionEvents, ...meetingEvents].sort(
        (left, right) =>
          (left.due_date?.getTime() ?? 0) - (right.due_date?.getTime() ?? 0)
      );

      return {
        code: STATUS_OK,
        message: "Success",
        list: combinedList,
        meta: {
          start_date: opts.input.start_date,
          end_date: opts.input.end_date,
          total_data: combinedList.length,
        },
      };
    }),

  // Actionable operational summary for the OS home dashboard.
  homeSummary: administratorProcedure.query(async (opts) => {
    const userId = opts.ctx.user.id;
    const now = new Date();
    const today = getCalendarDateInTimeZone(now, DASHBOARD_TIME_ZONE);
    const tomorrow = new Date(today);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    const activitySince = new Date(
      now.getTime() - ACTIVITY_WINDOW_DAYS * 24 * 60 * 60 * 1000
    );
    const staleSince = new Date(
      now.getTime() - STALE_LEAD_DAYS * 24 * 60 * 60 * 1000
    );
    const approvalWhere: Prisma.B2BActionWhereInput = {
      assignee_id: userId,
      status: B2BActionStatusEnum.REVIEW,
    };
    const overdueTaskWhere: Prisma.B2BActionWhereInput = {
      assignee_id: userId,
      status: {
        notIn: [B2BActionStatusEnum.DONE, B2BActionStatusEnum.REVIEW],
      },
      due_date: { lt: today },
    };
    const dueTodayTaskWhere: Prisma.B2BActionWhereInput = {
      assignee_id: userId,
      status: {
        notIn: [B2BActionStatusEnum.DONE, B2BActionStatusEnum.REVIEW],
      },
      due_date: { gte: today, lt: tomorrow },
    };
    const staleLeadWhere: Prisma.B2BPipelineWhereInput = {
      owner_id: userId,
      updated_at: { lt: staleSince },
      stage: {
        notIn: [
          B2BStageEnum.CLOSED_WON,
          B2BStageEnum.CLOSED_LOST,
          B2BStageEnum.ON_HOLD,
        ],
      },
      actions: {
        none: { updated_at: { gte: staleSince } },
      },
    };

    const [
      pendingApprovals,
      myTasksToday,
      teamOverdue,
      activeTasks,
      approvalsWaiting,
      overdueTaskCount,
      overdueTasks,
      dueTodayTaskCount,
      dueTodayTasks,
      staleLeadCount,
      staleLeads,
      recentActions,
      recentPipelines,
      activePipelinesForConflictCheck,
    ] = await Promise.all([
      opts.ctx.prisma.b2BAction.count({ where: approvalWhere }),
      opts.ctx.prisma.b2BAction.count({
        where: {
          assignee_id: userId,
          due_date: { gte: today, lt: tomorrow },
          status: { not: B2BActionStatusEnum.DONE },
        },
      }),
      opts.ctx.prisma.b2BAction.count({
        where: {
          due_date: { lt: today },
          status: { not: B2BActionStatusEnum.DONE },
        },
      }),
      opts.ctx.prisma.b2BAction.count({
        where: { status: B2BActionStatusEnum.IN_PROGRESS },
      }),
      opts.ctx.prisma.b2BAction.findMany({
        where: approvalWhere,
        include: { pipeline: { select: { id: true, name: true } } },
        orderBy: [
          { due_date: { sort: "asc", nulls: "last" } },
          { priority: "desc" },
        ],
        take: 5,
      }),
      opts.ctx.prisma.b2BAction.count({ where: overdueTaskWhere }),
      opts.ctx.prisma.b2BAction.findMany({
        where: overdueTaskWhere,
        include: { pipeline: { select: { id: true, name: true } } },
        orderBy: [{ priority: "desc" }, { due_date: "asc" }],
        take: 5,
      }),
      opts.ctx.prisma.b2BAction.count({ where: dueTodayTaskWhere }),
      opts.ctx.prisma.b2BAction.findMany({
        where: dueTodayTaskWhere,
        include: { pipeline: { select: { id: true, name: true } } },
        orderBy: [{ priority: "desc" }, { created_at: "asc" }],
        take: 5,
      }),
      opts.ctx.prisma.b2BPipeline.count({ where: staleLeadWhere }),
      opts.ctx.prisma.b2BPipeline.findMany({
        where: staleLeadWhere,
        include: {
          company: { select: { name: true } },
          actions: {
            select: { updated_at: true },
            orderBy: { updated_at: "desc" },
            take: 1,
          },
        },
        orderBy: [{ updated_at: "asc" }],
        take: 20,
      }),
      opts.ctx.prisma.b2BAction.findMany({
        where: {
          OR: [
            { created_at: { gte: activitySince } },
            { updated_at: { gte: activitySince } },
          ],
        },
        include: {
          pipeline: {
            select: {
              id: true,
              name: true,
              company: { select: { name: true } },
            },
          },
        },
        orderBy: [{ updated_at: "desc" }],
        take: 12,
      }),
      opts.ctx.prisma.b2BPipeline.findMany({
        where: {
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
      // Active pipelines within this actor's data_scope, for the ownership-conflict check below —
      // two different owners both holding an active lead against the same company.
      opts.ctx.prisma.b2BPipeline.findMany({
        where: {
          ...pipelineDataScopeWhere(opts.ctx.user),
          stage: { notIn: [B2BStageEnum.CLOSED_WON, B2BStageEnum.CLOSED_LOST] },
        },
        select: {
          id: true,
          name: true,
          company_id: true,
          company: { select: { name: true } },
          owner_id: true,
          owner: { select: { full_name: true } },
        },
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
        name: entry.name,
        owner_name: entry.owner.full_name,
      });
      ownershipConflictsByCompany.set(entry.company_id, bucket);
    }
    const ownershipConflicts = [...ownershipConflictsByCompany.values()].filter(
      (bucket) => new Set(bucket.pipelines.map((p) => p.owner_name)).size > 1
    );

    const activity = [
      ...recentActions.map((entry) => {
        const isNew = entry.created_at >= activitySince;
        return {
          id: `action-${entry.id}`,
          type: isNew ? ("action_created" as const) : ("action_updated" as const),
          title: entry.name,
          description: `${entry.pipeline.company.name} · ${entry.pipeline.name}`,
          pipeline_id: entry.pipeline_id,
          occurred_at: isNew ? entry.created_at : entry.updated_at,
        };
      }),
      ...recentPipelines.map((entry) => {
        const isNew = entry.created_at >= activitySince;
        return {
          id: `pipeline-${entry.id}`,
          type: isNew ? ("lead_created" as const) : ("lead_updated" as const),
          title: entry.company.name,
          description: entry.name,
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

    const mapAction = (entry: (typeof approvalsWaiting)[number]) => ({
      id: entry.id,
      name: entry.name,
      pipeline_id: entry.pipeline_id,
      pipeline_name: entry.pipeline.name,
      due_date: entry.due_date,
      priority: entry.priority,
    });

    return {
      code: STATUS_OK,
      message: "Success",
      user: {
        id: opts.ctx.user.id,
        full_name: opts.ctx.user.full_name,
      },
      stats: {
        pending_approvals: pendingApprovals,
        my_tasks_today: myTasksToday,
        team_overdue: teamOverdue,
        active_tasks: activeTasks,
      },
      activity,
      attention: {
        totals: {
          approvals: pendingApprovals,
          overdue_tasks: overdueTaskCount,
          due_today_tasks: dueTodayTaskCount,
          stale_leads: staleLeadCount,
          ownership_conflicts: ownershipConflicts.length,
        },
        approvals: approvalsWaiting.map(mapAction),
        overdue_tasks: overdueTasks.map(mapAction),
        due_today_tasks: dueTodayTasks.map(mapAction),
        ownership_conflicts: ownershipConflicts.slice(0, 5),
        stale_leads: staleLeads
          .map((entry) => {
            const lastActivityAt =
              entry.actions[0]?.updated_at &&
              entry.actions[0].updated_at > entry.updated_at
                ? entry.actions[0].updated_at
                : entry.updated_at;
            return {
              id: entry.id,
              company_name: entry.company.name,
              pipeline_name: entry.name,
              stage: entry.stage,
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

  // Weekly dashboard analytics, sourced from b2b_pipeline_stage_history — no backfill, so depth is limited to history recorded since that table shipped.
  dashboardAnalytics: administratorProcedure.query(async (opts) => {
    const isBusinessDevelopment =
      opts.ctx.user.role.name === "Business Development";
    const ownerScope: Prisma.B2BPipelineWhereInput = isBusinessDevelopment
      ? { owner_id: opts.ctx.user.id }
      : {};
    const historyOwnerScope: Prisma.B2BPipelineStageHistoryWhereInput =
      isBusinessDevelopment ? { pipeline: { owner_id: opts.ctx.user.id } } : {};

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
};
