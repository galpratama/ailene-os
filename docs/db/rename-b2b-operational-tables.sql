-- Run once against the live database after backing up the three operational tables.
-- PostgreSQL preserves every row, ID, foreign-key relationship, and sequence when
-- a table is renamed; dependent foreign keys are retargeted automatically.
BEGIN;

LOCK TABLE b2b_actions, b2b_meetings, b2b_quotations IN ACCESS EXCLUSIVE MODE;

ALTER TABLE b2b_actions RENAME TO actions;
ALTER TABLE b2b_meetings RENAME TO meetings;
ALTER TABLE b2b_quotations RENAME TO quotations;

-- Keep explicitly named schema objects consistent with the new table names.
ALTER TRIGGER update_b2b_actions_updated_at_trigger ON actions
  RENAME TO update_actions_updated_at_trigger;
ALTER TRIGGER update_b2b_meetings_updated_at_trigger ON meetings
  RENAME TO update_meetings_updated_at_trigger;
ALTER TRIGGER update_b2b_quotations_updated_at_trigger ON quotations
  RENAME TO update_quotations_updated_at_trigger;

ALTER INDEX IF EXISTS b2b_meetings_pipeline_id_idx RENAME TO meetings_pipeline_id_idx;
ALTER INDEX IF EXISTS b2b_meetings_scheduled_at_idx RENAME TO meetings_scheduled_at_idx;
ALTER INDEX IF EXISTS b2b_quotations_pipeline_id_idx RENAME TO quotations_pipeline_id_idx;
ALTER INDEX IF EXISTS b2b_quotations_status_idx RENAME TO quotations_status_idx;

COMMIT;
