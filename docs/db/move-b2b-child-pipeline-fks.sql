-- Run once against the live database after backing up b2b_actions, b2b_meetings,
-- and b2b_quotations. The canonical Sales API pipeline is determined by the
-- matching company_id; `pipelines.company_id` is unique by contract.
BEGIN;

LOCK TABLE b2b_actions, b2b_meetings, b2b_quotations, b2b_pipeline, pipelines
  IN SHARE ROW EXCLUSIVE MODE;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM (
      SELECT child.pipeline_id, COUNT(sales.id) AS sales_pipeline_count
      FROM (
        SELECT pipeline_id FROM b2b_actions
        UNION
        SELECT pipeline_id FROM b2b_meetings
        UNION
        SELECT pipeline_id FROM b2b_quotations
      ) AS child
      LEFT JOIN b2b_pipeline AS legacy ON legacy.id = child.pipeline_id
      LEFT JOIN pipelines AS sales ON sales.company_id = legacy.company_id
      GROUP BY child.pipeline_id
    ) AS mappings
    WHERE sales_pipeline_count <> 1
  ) THEN
    RAISE EXCEPTION 'Every operational pipeline_id must map to exactly one Sales API pipeline';
  END IF;
END $$;

UPDATE b2b_actions AS child
SET pipeline_id = sales.id
FROM b2b_pipeline AS legacy
JOIN pipelines AS sales ON sales.company_id = legacy.company_id
WHERE child.pipeline_id = legacy.id
  AND child.pipeline_id <> sales.id;

UPDATE b2b_meetings AS child
SET pipeline_id = sales.id
FROM b2b_pipeline AS legacy
JOIN pipelines AS sales ON sales.company_id = legacy.company_id
WHERE child.pipeline_id = legacy.id
  AND child.pipeline_id <> sales.id;

UPDATE b2b_quotations AS child
SET pipeline_id = sales.id
FROM b2b_pipeline AS legacy
JOIN pipelines AS sales ON sales.company_id = legacy.company_id
WHERE child.pipeline_id = legacy.id
  AND child.pipeline_id <> sales.id;

ALTER TABLE b2b_actions
  DROP CONSTRAINT b2b_actions_pipeline_id_fkey,
  ADD CONSTRAINT b2b_actions_pipeline_id_fkey
    FOREIGN KEY (pipeline_id) REFERENCES pipelines (id)
    ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE b2b_meetings
  DROP CONSTRAINT b2b_meetings_pipeline_id_fkey,
  ADD CONSTRAINT b2b_meetings_pipeline_id_fkey
    FOREIGN KEY (pipeline_id) REFERENCES pipelines (id)
    ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE b2b_quotations
  DROP CONSTRAINT b2b_quotations_pipeline_id_fkey,
  ADD CONSTRAINT b2b_quotations_pipeline_id_fkey
    FOREIGN KEY (pipeline_id) REFERENCES pipelines (id)
    ON UPDATE CASCADE ON DELETE CASCADE;

COMMIT;
