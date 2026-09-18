-- LMS projects now link to the canonical Sales API companies/pipelines tables.
-- The scalar IDs and existing data are preserved; only the legacy FK targets change.
-- Run against the direct Neon connection (not the pooled URL).

BEGIN;

LOCK TABLE lms_projects IN ACCESS EXCLUSIVE MODE;

ALTER TABLE lms_projects
  DROP CONSTRAINT IF EXISTS lms_projects_company_id_fkey,
  DROP CONSTRAINT IF EXISTS lms_projects_pipeline_id_fkey;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM lms_projects lp
    LEFT JOIN companies c ON c.id = lp.company_id
    WHERE lp.company_id IS NOT NULL AND c.id IS NULL
  ) THEN
    RAISE EXCEPTION 'Cannot retarget lms_projects.company_id: orphaned company_id values exist';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM lms_projects lp
    LEFT JOIN pipelines p ON p.id = lp.pipeline_id
    WHERE p.id IS NULL
  ) THEN
    RAISE EXCEPTION 'Cannot retarget lms_projects.pipeline_id: orphaned pipeline_id values exist';
  END IF;
END $$;

ALTER TABLE lms_projects
  ADD CONSTRAINT lms_projects_company_id_fkey
    FOREIGN KEY (company_id) REFERENCES companies (id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  ADD CONSTRAINT lms_projects_pipeline_id_fkey
    FOREIGN KEY (pipeline_id) REFERENCES pipelines (id)
    ON UPDATE CASCADE ON DELETE RESTRICT;

COMMIT;
