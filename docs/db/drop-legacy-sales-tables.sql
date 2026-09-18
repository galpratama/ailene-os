-- Drop the retired B2B master-data tables and their contact bridge.
-- The dependent b2b_meeting_attendees table is also retired: it only stored
-- contact IDs from the contacts table and currently contains no rows.
-- Run against the direct Neon connection (not the pooled URL).

BEGIN;

LOCK TABLE
  b2b_meeting_attendees,
  contact_organization_relationships,
  contacts,
  b2b_pipeline_stage_history,
  b2b_pipeline,
  b2b_company
IN ACCESS EXCLUSIVE MODE;

DROP TABLE b2b_meeting_attendees;
DROP TABLE contact_organization_relationships;
DROP TABLE contacts;
DROP TABLE b2b_pipeline_stage_history;
DROP TABLE b2b_pipeline;
DROP TABLE b2b_company;

COMMIT;
