import { STATUS_OK } from "@/lib/status_code";
import { administratorProcedure } from "@/trpc/init";
import {
  actionDataScopeWhere,
  meetingDataScopeWhere,
  pipelineDataScopeWhere,
  quotationDataScopeWhere,
} from "@/trpc/utils/data_scope";
import { canViewQuotationInternals } from "@/trpc/utils/quotation";
import { readFailedNotFound } from "@/trpc/utils/errors";
import { getMasterDataTimeline, getPipelineTimeline } from "@/trpc/utils/timeline";
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

      const timeline = await getMasterDataTimeline(
        opts.ctx.prisma,
        "ORGANIZATION",
        theCompany.id
      );

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
        timeline,
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

      const timeline = await getMasterDataTimeline(
        opts.ctx.prisma,
        "CONTACT",
        theContact.id
      );

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
        timeline,
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

      const timeline = await getPipelineTimeline(opts.ctx.prisma, thePipeline.id);

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
        timeline,
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

  meeting: administratorProcedure
    .input(objectHasOnlyID())
    .query(async (opts) => {
      const theMeeting = await opts.ctx.prisma.b2BMeeting.findFirst({
        where: { id: opts.input.id, ...meetingDataScopeWhere(opts.ctx.user) },
        include: {
          pipeline: {
            select: { id: true, name: true, company: { select: { id: true, name: true } } },
          },
          organizer: { select: { id: true, full_name: true, avatar: true } },
          created_by: { select: { id: true, full_name: true } },
          attendees: {
            include: {
              contact: {
                select: { id: true, full_name: true, email: true, phone: true },
              },
            },
          },
          next_actions: {
            select: { id: true, name: true, status: true, due_date: true },
          },
        },
      });
      if (!theMeeting) {
        throw readFailedNotFound("meeting");
      }
      return {
        code: STATUS_OK,
        message: "Success",
        meeting: {
          id: theMeeting.id,
          pipeline_id: theMeeting.pipeline.id,
          pipeline_name: theMeeting.pipeline.name,
          company_id: theMeeting.pipeline.company.id,
          company_name: theMeeting.pipeline.company.name,
          organizer_id: theMeeting.organizer.id,
          organizer_name: theMeeting.organizer.full_name,
          organizer_avatar: theMeeting.organizer.avatar,
          created_by_id: theMeeting.created_by.id,
          created_by_name: theMeeting.created_by.full_name,
          scheduled_at: theMeeting.scheduled_at,
          held_at: theMeeting.held_at,
          status: theMeeting.status,
          location_or_link: theMeeting.location_or_link,
          notes: theMeeting.notes,
          google_sync_status: theMeeting.google_sync_status,
          attendees: theMeeting.attendees.map((entry) => entry.contact),
          next_actions: theMeeting.next_actions,
          created_at: theMeeting.created_at,
          updated_at: theMeeting.updated_at,
        },
      };
    }),

  quotation: administratorProcedure
    .input(objectHasOnlyID())
    .query(async (opts) => {
      const theQuotation = await opts.ctx.prisma.b2BQuotation.findFirst({
        where: { id: opts.input.id, ...quotationDataScopeWhere(opts.ctx.user) },
        include: {
          pipeline: {
            select: { id: true, name: true, company: { select: { id: true, name: true } } },
          },
          created_by: { select: { id: true, full_name: true } },
          line_items: { orderBy: { order_index: "asc" } },
          approvals: {
            include: { actor: { select: { id: true, full_name: true } } },
            orderBy: { created_at: "desc" },
          },
        },
      });
      if (!theQuotation) {
        throw readFailedNotFound("quotation");
      }

      const canViewInternals = canViewQuotationInternals(opts.ctx.user);

      return {
        code: STATUS_OK,
        message: "Success",
        quotation: {
          id: theQuotation.id,
          pipeline_id: theQuotation.pipeline.id,
          pipeline_name: theQuotation.pipeline.name,
          company_id: theQuotation.pipeline.company.id,
          company_name: theQuotation.pipeline.company.name,
          version: theQuotation.version,
          is_current: theQuotation.is_current,
          status: theQuotation.status,
          source_type: theQuotation.source_type,
          package_type: theQuotation.package_type,
          materi: theQuotation.materi,
          bd_pct: theQuotation.bd_pct,
          dc_pct: theQuotation.dc_pct,
          addon_assessment: theQuotation.addon_assessment,
          addon_klinik: theQuotation.addon_klinik,
          addon_klinik_sesi: theQuotation.addon_klinik_sesi,
          addon_rekaman: theQuotation.addon_rekaman,
          addon_sertifikat: theQuotation.addon_sertifikat,
          addon_sertifikat_qty: theQuotation.addon_sertifikat_qty,
          addon_perjalanan: theQuotation.addon_perjalanan,
          addon_perjalanan_rp: theQuotation.addon_perjalanan_rp,
          subtotal: theQuotation.subtotal,
          discount: theQuotation.discount,
          net_value: theQuotation.net_value,
          invoice_amount: theQuotation.invoice_amount,
          pph_tax: theQuotation.pph_tax,
          requires_review: theQuotation.requires_review,
          created_by_id: theQuotation.created_by.id,
          created_by_name: theQuotation.created_by.full_name,
          created_at: theQuotation.created_at,
          updated_at: theQuotation.updated_at,
          line_items: theQuotation.line_items.map((item) => ({
            id: item.id,
            order_index: item.order_index,
            format: item.format,
            sesi: item.sesi,
            peserta: item.peserta,
            trainer: item.trainer,
          })),
          approvals: theQuotation.approvals.map((approval) => ({
            id: approval.id,
            decision: approval.decision,
            reason: approval.reason,
            actor_name: approval.actor.full_name,
            created_at: approval.created_at,
          })),
          // Omitted entirely for Staff/Business Development, never just hidden client-side.
          ...(canViewInternals && {
            trainer_cost: theQuotation.trainer_cost,
            addons_cost: theQuotation.addons_cost,
            bd_fee: theQuotation.bd_fee,
            ops_fee: theQuotation.ops_fee,
            amo_fee: theQuotation.amo_fee,
            total_cost: theQuotation.total_cost,
            net_profit: theQuotation.net_profit,
            margin_pct: theQuotation.margin_pct,
          }),
        },
      };
    }),
};
