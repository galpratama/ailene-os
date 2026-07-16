import { Optional } from "@/lib/optional-type";
import { STATUS_BAD_REQUEST, STATUS_OK } from "@/lib/status_code";
import { administratorProcedure } from "@/trpc/init";
import { calculatePage } from "@/trpc/utils/paging";
import {
  numberIsID,
  numberIsPosInt,
  stringIsUUID,
  stringNotBlank,
} from "@/trpc/utils/validation";
import {
  B2BActionPriorityEnum,
  B2BActionStatusEnum,
  B2BProbabilityStatusEnum,
  B2BStageEnum,
  Prisma,
} from "@prisma/client";
import { TRPCError } from "@trpc/server";
import z from "zod";

const DASHBOARD_TIME_ZONE = "Asia/Jakarta";
const ACTIVITY_WINDOW_DAYS = 7;
const STALE_LEAD_DAYS = 14;

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
        page: numberIsPosInt().optional(),
        page_size: numberIsPosInt().optional(),
      })
    )
    .query(async (opts) => {
      const whereClause: Prisma.B2BCompanyWhereInput = {};
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
      const whereClause: Prisma.B2BActionWhereInput = {
        status: opts.input.status,
        assignee_id: opts.input.assignee_id,
        pipeline_id: opts.input.pipeline_id,
        pipeline: opts.input.company_id
          ? { company_id: opts.input.company_id }
          : undefined,
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

      const whereClause: Prisma.B2BActionWhereInput = {
        due_date: { gte: startDate, lte: endDate },
        status: opts.input.status,
        priority: opts.input.priority,
        assignee_id: opts.input.assignee_id,
        pipeline_id: opts.input.pipeline_id,
        pipeline: opts.input.company_id
          ? { company_id: opts.input.company_id }
          : undefined,
      };

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
        orderBy: [
          { due_date: "asc" },
          { priority: "desc" },
          { created_at: "asc" },
        ],
        where: whereClause,
      });

      return {
        code: STATUS_OK,
        message: "Success",
        list: actionList.map((entry) => ({
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
        })),
        meta: {
          start_date: opts.input.start_date,
          end_date: opts.input.end_date,
          total_data: actionList.length,
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
    ]);

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
        },
        approvals: approvalsWaiting.map(mapAction),
        overdue_tasks: overdueTasks.map(mapAction),
        due_today_tasks: dueTodayTasks.map(mapAction),
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
};
