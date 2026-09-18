-- Rename quotation child tables to the canonical, domain-neutral names.
-- Run against the direct Neon connection (not the pooled URL).

BEGIN;

LOCK TABLE b2b_quotation_line_items, b2b_quotation_approvals IN ACCESS EXCLUSIVE MODE;

ALTER TABLE b2b_quotation_line_items RENAME TO quotation_line_items;
ALTER TABLE b2b_quotation_approvals RENAME TO quotation_approvals;

ALTER INDEX IF EXISTS b2b_quotation_line_items_pkey
  RENAME TO quotation_line_items_pkey;
ALTER INDEX IF EXISTS b2b_quotation_approvals_pkey
  RENAME TO quotation_approvals_pkey;
ALTER INDEX IF EXISTS b2b_quotation_approvals_quotation_id_idx
  RENAME TO quotation_approvals_quotation_id_idx;

COMMIT;
