-- Run once against the live database after backing up master_data_audit_log.
-- The Prisma schema and source DDL are updated in the same change.
BEGIN;

DROP TABLE organization_duplicate_reviews;
DROP TABLE master_data_audit_log;
DROP TYPE duplicate_review_status_enum;
DROP TYPE master_data_entity_type_enum;

COMMIT;
