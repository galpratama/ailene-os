import { STATUS_OK } from "@/lib/status_code";
import { loggedInProcedure } from "@/trpc/init";
import {
  actionDataScopeWhere,
  meetingDataScopeWhere,
  quotationDataScopeWhere,
} from "@/trpc/utils/data_scope";
import { canViewQuotationInternals } from "@/trpc/utils/quotation";
import { readFailedNotFound } from "@/trpc/utils/errors";
import { objectHasOnlyID } from "@/trpc/utils/validation";

export const readB2B = {
  action: loggedInProcedure
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

  meeting: loggedInProcedure
    .input(objectHasOnlyID())
    .query(async (opts) => {
      const theMeeting = await opts.ctx.prisma.b2BMeeting.findFirst({
        where: { id: opts.input.id, ...meetingDataScopeWhere(opts.ctx.user) },
        include: {
          pipeline: {
            select: { id: true, company: { select: { id: true, name: true } } },
          },
          organizer: { select: { id: true, full_name: true, avatar: true } },
          created_by: { select: { id: true, full_name: true } },
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
          pipeline_name: theMeeting.pipeline.company.name,
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
          next_actions: theMeeting.next_actions,
          created_at: theMeeting.created_at,
          updated_at: theMeeting.updated_at,
        },
      };
    }),

  quotation: loggedInProcedure
    .input(objectHasOnlyID())
    .query(async (opts) => {
      const theQuotation = await opts.ctx.prisma.b2BQuotation.findFirst({
        where: { id: opts.input.id, ...quotationDataScopeWhere(opts.ctx.user) },
        include: {
          pipeline: {
            select: { id: true, company: { select: { id: true, name: true } } },
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
          pipeline_name: theQuotation.pipeline.company.name,
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
          // Omitted entirely for non-administrators, never just hidden client-side.
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
