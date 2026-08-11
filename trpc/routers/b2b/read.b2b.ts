import { STATUS_OK } from "@/lib/status_code";
import { administratorProcedure } from "@/trpc/init";
import { actionDataScopeWhere, pipelineDataScopeWhere } from "@/trpc/utils/data_scope";
import { readFailedNotFound } from "@/trpc/utils/errors";
import { objectHasOnlyID } from "@/trpc/utils/validation";

export const readB2B = {
  company: administratorProcedure
    .input(objectHasOnlyID())
    .query(async (opts) => {
      const theCompany = await opts.ctx.prisma.b2BCompany.findFirst({
        include: {
          industry: { select: { id: true, industry_name: true } },
          contacts: { include: { contact: true } },
        },
        where: { id: opts.input.id },
      });
      if (!theCompany) {
        throw readFailedNotFound("company");
      }

      const timeline = await opts.ctx.prisma.masterDataAuditLog.findMany({
        where: { target_entity_type: "ORGANIZATION", target_entity_id: theCompany.id },
        include: { actor: { select: { full_name: true } } },
        orderBy: { created_at: "desc" },
        take: 50,
      });

      return {
        code: STATUS_OK,
        message: "Success",
        company: {
          id: theCompany.id,
          name: theCompany.name,
          status: theCompany.status,
          aliases: theCompany.aliases,
          legal_identifier: theCompany.legal_identifier,
          archived_at: theCompany.archived_at,
          industry_id: theCompany.industry.id,
          industry_name: theCompany.industry.industry_name,
          pic_name: theCompany.pic_name,
          pic_job_title: theCompany.pic_job_title,
          pic_wa: theCompany.pic_wa,
          pic_email: theCompany.pic_email,
          image_url: theCompany.image_url,
          created_at: theCompany.created_at,
          updated_at: theCompany.updated_at,
        },
        contacts: theCompany.contacts.map((rel) => ({
          id: rel.contact.id,
          full_name: rel.contact.full_name,
          email: rel.contact.email,
          phone: rel.contact.phone,
          job_title: rel.contact.job_title,
          is_primary: rel.is_primary,
        })),
        timeline: timeline.map((entry) => ({
          id: entry.id,
          field_changed: entry.field_changed,
          old_value: entry.old_value,
          new_value: entry.new_value,
          reason: entry.reason,
          actor_name: entry.actor.full_name,
          created_at: entry.created_at,
        })),
      };
    }),

  contact: administratorProcedure
    .input(objectHasOnlyID())
    .query(async (opts) => {
      const theContact = await opts.ctx.prisma.contact.findFirst({
        where: { id: opts.input.id },
        include: {
          organizations: {
            include: { organization: { select: { id: true, name: true } } },
          },
        },
      });
      if (!theContact) {
        throw readFailedNotFound("contact");
      }
      return {
        code: STATUS_OK,
        message: "Success",
        contact: {
          id: theContact.id,
          full_name: theContact.full_name,
          email: theContact.email,
          phone: theContact.phone,
          job_title: theContact.job_title,
          created_at: theContact.created_at,
        },
        relationships: theContact.organizations.map((rel) => ({
          organization_id: rel.organization.id,
          organization_name: rel.organization.name,
          is_primary: rel.is_primary,
          relationship_role: rel.relationship_role,
          effective_from: rel.effective_from,
          effective_to: rel.effective_to,
        })),
      };
    }),

  pipeline: administratorProcedure
    .input(objectHasOnlyID())
    .query(async (opts) => {
      const thePipeline = await opts.ctx.prisma.b2BPipeline.findFirst({
        include: {
          owner: { select: { id: true, full_name: true, avatar: true } },
          company: {
            include: {
              industry: { select: { id: true, industry_name: true } },
            },
          },
        },
        where: {
          id: opts.input.id,
          ...pipelineDataScopeWhere(opts.ctx.user),
        },
      });
      if (!thePipeline) {
        throw readFailedNotFound("pipeline");
      }
      return {
        code: STATUS_OK,
        message: "Success",
        pipeline: {
          id: thePipeline.id,
          name: thePipeline.name,
          company_id: thePipeline.company.id,
          company_name: thePipeline.company.name,
          industry_id: thePipeline.company.industry.id,
          industry_name: thePipeline.company.industry.industry_name,
          pic_name: thePipeline.company.pic_name,
          pic_job_title: thePipeline.company.pic_job_title,
          pic_wa: thePipeline.company.pic_wa,
          pic_email: thePipeline.company.pic_email,
          company_image_url: thePipeline.company.image_url,
          stage: thePipeline.stage,
          current_stage_reason_code: thePipeline.current_stage_reason_code,
          on_hold_review_date: thePipeline.on_hold_review_date,
          probability: thePipeline.probability,
          probability_status: thePipeline.probability_status,
          project_value: thePipeline.project_value,
          project_start_month: thePipeline.project_start_month,
          project_end_month: thePipeline.project_end_month,
          owner_id: thePipeline.owner.id,
          owner_name: thePipeline.owner.full_name,
          owner_avatar: thePipeline.owner.avatar,
          created_at: thePipeline.created_at,
          updated_at: thePipeline.updated_at,
        },
      };
    }),

  action: administratorProcedure
    .input(objectHasOnlyID())
    .query(async (opts) => {
      const theAction = await opts.ctx.prisma.b2BAction.findFirst({
        where: { id: opts.input.id, ...actionDataScopeWhere(opts.ctx.user) },
      });
      if (!theAction) {
        throw readFailedNotFound("action");
      }
      return {
        code: STATUS_OK,
        message: "Success",
        action: theAction,
      };
    }),
};
