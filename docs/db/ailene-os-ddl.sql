-- PostgreSQL Database for ailene-os

------------------
-- Enumerations --
------------------

CREATE TYPE status_enum AS ENUM (
  'active',
  'inactive'
);

-- Enumeration for the users table

CREATE TYPE occupation_enum AS ENUM (
  'employee',
  'entrepreneur',
  'student',
  'freelance',
  'military',
  'unemployed'
);

-- Enumeration for the b2b_pipeline table (b2b_*)

CREATE TYPE b2b_product_enum AS ENUM (
  'sponsorship',
  'corporate_training',
  'corporate_ai_training'
);

CREATE TYPE b2b_source_enum AS ENUM (
  'social_media',
  'founder_network',
  'event_conference',
  'referral_partner',
  'referral_client',
  'website'
);

CREATE TYPE b2b_stage_enum AS ENUM (
  'lead_identified',
  'contacted',
  'negotiation',
  'verbal_commit',
  'closed_won',
  'closed_lost',
  'on_hold'
);

CREATE TYPE b2b_probability_status_enum AS ENUM (
  'cold',
  'warm',
  'hot'
);

-- Enumeration for the b2b_actions table (b2ba_*)

CREATE TYPE b2ba_status_enum AS ENUM (
  'to_do',
  'in_progress',
  'review',
  'done'
);

CREATE TYPE b2ba_priority_enum AS ENUM (
  'low',
  'medium',
  'high',
  'urgent'
);

-- Enumeration for the Trainer Pool tables

CREATE TYPE trainer_level_enum AS ENUM (
  'apprentice',
  'certified',
  'senior',
  'lead'
);

CREATE TYPE trainer_status_enum AS ENUM (
  'candidate',
  'certified',
  'active',
  'remedial',
  'inactive'
);

CREATE TYPE trainer_source_enum AS ENUM (
  'ai_community',
  'top_alumni',
  'domain_practitioner',
  'trainer_network',
  'corporate_practitioner',
  'internal_referral'
);

CREATE TYPE trnsc_step_enum AS ENUM (
  'application_review',
  'interview',
  'teaching_demo',
  'practical_test',
  'reference_check'
);

CREATE TYPE trnsc_status_enum AS ENUM (
  'pending',
  'passed',
  'failed',
  'skipped'
);

CREATE TYPE trncert_step_enum AS ENUM (
  'orientation',
  'material_mastery',
  'shadowing',
  'co_training',
  'solo_observed_delivery',
  'certification_decision'
);

CREATE TYPE trncert_status_enum AS ENUM (
  'not_started',
  'in_progress',
  'passed',
  'failed'
);

CREATE TYPE trainer_availability_status_enum AS ENUM (
  'available',
  'limited',
  'unavailable'
);

CREATE TYPE trna_role_enum AS ENUM (
  'lead',
  'assistant',
  'co_trainer',
  'specialist'
);

------------
-- Tables --
------------

-- Lookup tables

CREATE TABLE industries (
  id             SMALLSERIAL  PRIMARY KEY,
  industry_name  VARCHAR      NOT NULL  UNIQUE,
  created_at     TIMESTAMPTZ  NOT NULL  DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE roles (
  id          SMALLSERIAL  PRIMARY KEY,
  name        VARCHAR      NOT NULL  UNIQUE,
  permission  SMALLINT     NOT NULL,
  created_at  TIMESTAMPTZ  NOT NULL  DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMPTZ  NOT NULL  DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE phone_country_codes (
  id            SMALLINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  country_name  VARCHAR  NOT NULL,
  phone_code    VARCHAR  NOT NULL  UNIQUE,
  emoji         VARCHAR  NOT NULL,
  icon          VARCHAR      NULL
);

CREATE TABLE trainer_specializations (
  id                   SMALLSERIAL  PRIMARY KEY,
  specialization_name  VARCHAR      NOT NULL  UNIQUE,
  created_at           TIMESTAMPTZ  NOT NULL  DEFAULT CURRENT_TIMESTAMP
);

-- User data

CREATE TABLE users (
  id                     UUID               PRIMARY KEY  DEFAULT gen_random_uuid(),
  full_name              VARCHAR            NOT NULL,
  email                  VARCHAR            NOT NULL     UNIQUE,
  phone_country_id       SMALLINT               NULL,
  phone_number           VARCHAR                NULL,
  avatar                 VARCHAR                NULL,
  role_id                SMALLINT           NOT NULL     DEFAULT 3, -- General User
  status                 status_enum        NOT NULL     DEFAULT 'active',
  date_of_birth          DATE                   NULL,
  occupation             occupation_enum        NULL,
  created_at             TIMESTAMPTZ        NOT NULL     DEFAULT CURRENT_TIMESTAMP,
  updated_at             TIMESTAMPTZ        NOT NULL     DEFAULT CURRENT_TIMESTAMP,
  last_login             TIMESTAMPTZ        NOT NULL     DEFAULT CURRENT_TIMESTAMP,
  deleted_at             TIMESTAMPTZ            NULL
);

CREATE TABLE tokens (
  id          SERIAL       PRIMARY KEY,
  user_id     UUID         NOT NULL,
  is_active   BOOLEAN      NOT NULL  DEFAULT FALSE,
  token       TEXT         NOT NULL  UNIQUE,
  created_at  TIMESTAMPTZ  NOT NULL  DEFAULT CURRENT_TIMESTAMP
);

-- B2B Sales Pipeline

CREATE TABLE b2b_company (
  id             SERIAL       PRIMARY KEY,
  name           VARCHAR      NOT NULL,
  industry_id    SMALLINT     NOT NULL,
  pic_name       VARCHAR          NULL,
  pic_job_title  VARCHAR          NULL,
  pic_wa         VARCHAR          NULL,
  pic_email      VARCHAR          NULL,
  created_at     TIMESTAMPTZ  NOT NULL  DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMPTZ  NOT NULL  DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE b2b_pipeline (
  id                   SERIAL                        PRIMARY KEY,
  name                 VARCHAR                       NOT NULL,
  company_id           INTEGER                       NOT NULL,
  product              b2b_product_enum              NOT NULL,
  source               b2b_source_enum                   NULL,
  stage                b2b_stage_enum                NOT NULL  DEFAULT 'lead_identified',
  probability          SMALLINT                      NOT NULL  DEFAULT 0,
  probability_status   b2b_probability_status_enum   NOT NULL  DEFAULT 'cold',
  project_value        DECIMAL(15, 2)                NOT NULL  DEFAULT 0,
  project_start_month  DATE                              NULL,
  project_end_month    DATE                              NULL,
  owner_id             UUID                          NOT NULL,
  created_at           TIMESTAMPTZ                   NOT NULL  DEFAULT CURRENT_TIMESTAMP,
  updated_at           TIMESTAMPTZ                   NOT NULL  DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE b2b_actions (
  id           SERIAL              PRIMARY KEY,
  pipeline_id  INTEGER             NOT NULL,
  name         VARCHAR             NOT NULL,
  summary      TEXT                    NULL,
  status       b2ba_status_enum    NOT NULL  DEFAULT 'to_do',
  priority     b2ba_priority_enum  NOT NULL  DEFAULT 'medium',
  due_date     DATE                    NULL,
  assignee_id  UUID                    NULL,
  created_at   TIMESTAMPTZ         NOT NULL  DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMPTZ         NOT NULL  DEFAULT CURRENT_TIMESTAMP
);

-- Trainer Pool

CREATE TABLE trainers (
  id                UUID                  PRIMARY KEY  DEFAULT gen_random_uuid(),
  full_name         VARCHAR               NOT NULL,
  email             VARCHAR               NOT NULL     UNIQUE,
  phone_country_id  SMALLINT                  NULL,
  phone_number      VARCHAR                   NULL,
  source            trainer_source_enum       NULL,
  level             trainer_level_enum    NOT NULL     DEFAULT 'apprentice',
  status            trainer_status_enum   NOT NULL     DEFAULT 'candidate',
  user_id           UUID                      NULL,
  referred_by       UUID                      NULL,
  notes             TEXT                      NULL,
  created_at        TIMESTAMPTZ           NOT NULL     DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMPTZ           NOT NULL     DEFAULT CURRENT_TIMESTAMP,
  deleted_at        TIMESTAMPTZ               NULL
);

CREATE TABLE trainer_specialization_map (
  trainer_id        UUID      NOT NULL,
  specialization_id SMALLINT  NOT NULL,
  PRIMARY KEY (trainer_id, specialization_id)
);

CREATE TABLE trainer_screening_steps (
  id            SERIAL              PRIMARY KEY,
  trainer_id    UUID                NOT NULL,
  step          trnsc_step_enum     NOT NULL,
  status        trnsc_status_enum   NOT NULL  DEFAULT 'pending',
  notes         TEXT                    NULL,
  completed_at  TIMESTAMPTZ             NULL,
  created_at    TIMESTAMPTZ         NOT NULL  DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMPTZ         NOT NULL  DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (trainer_id, step)
);

CREATE TABLE trainer_screening_scores (
  id                        SERIAL       PRIMARY KEY,
  trainer_id                UUID         NOT NULL  UNIQUE,
  ai_hands_on_score         SMALLINT     NOT NULL  DEFAULT 0,
  facilitation_score        SMALLINT     NOT NULL  DEFAULT 0,
  domain_credibility_score  SMALLINT     NOT NULL  DEFAULT 0,
  communication_score       SMALLINT     NOT NULL  DEFAULT 0,
  reliability_score         SMALLINT     NOT NULL  DEFAULT 0,
  total_score               SMALLINT     NOT NULL  DEFAULT 0,
  scored_by                 UUID             NULL,
  scored_at                 TIMESTAMPTZ      NULL,
  created_at                TIMESTAMPTZ  NOT NULL  DEFAULT CURRENT_TIMESTAMP,
  updated_at                TIMESTAMPTZ  NOT NULL  DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE trainer_certification_steps (
  id                  SERIAL               PRIMARY KEY,
  trainer_id          UUID                 NOT NULL,
  step                trncert_step_enum    NOT NULL,
  status              trncert_status_enum  NOT NULL  DEFAULT 'not_started',
  sessions_required   SMALLINT             NOT NULL  DEFAULT 1,
  sessions_completed  SMALLINT             NOT NULL  DEFAULT 0,
  evaluator_id        UUID                     NULL,
  notes               TEXT                     NULL,
  completed_at        TIMESTAMPTZ              NULL,
  created_at          TIMESTAMPTZ          NOT NULL  DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMPTZ          NOT NULL  DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (trainer_id, step)
);

CREATE TABLE trainer_availabilities (
  id          SERIAL                            PRIMARY KEY,
  trainer_id  UUID                              NOT NULL,
  period      DATE                              NOT NULL,
  status      trainer_availability_status_enum  NOT NULL  DEFAULT 'available',
  notes       VARCHAR                               NULL,
  created_at  TIMESTAMPTZ                       NOT NULL  DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMPTZ                       NOT NULL  DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (trainer_id, period)
);

CREATE TABLE trainer_assignments (
  id                 SERIAL          PRIMARY KEY,
  pipeline_id        INTEGER         NOT NULL,
  trainer_id         UUID            NOT NULL,
  role               trna_role_enum  NOT NULL  DEFAULT 'lead',
  session_date       DATE                NULL,
  participant_count  SMALLINT            NULL,
  notes              TEXT                NULL,
  created_at         TIMESTAMPTZ     NOT NULL  DEFAULT CURRENT_TIMESTAMP,
  updated_at         TIMESTAMPTZ     NOT NULL  DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE trainer_evaluations (
  id                      SERIAL        PRIMARY KEY,
  assignment_id           INTEGER           NULL,
  trainer_id              UUID          NOT NULL,
  participant_rating_avg  DECIMAL(2,1)      NULL,
  self_report_submitted   BOOLEAN       NOT NULL  DEFAULT FALSE,
  reviewed_by             UUID              NULL,
  review_notes            TEXT              NULL,
  evaluation_date         DATE              NULL,
  created_at              TIMESTAMPTZ   NOT NULL  DEFAULT CURRENT_TIMESTAMP
);

----------------
-- References --
----------------

-- User data

ALTER TABLE users
  ADD FOREIGN KEY (phone_country_id) REFERENCES phone_country_codes (id),
  ADD FOREIGN KEY (role_id)          REFERENCES roles (id);

ALTER TABLE tokens
  ADD FOREIGN KEY (user_id) REFERENCES users (id);

-- B2B Sales Pipeline

ALTER TABLE b2b_company
  ADD FOREIGN KEY (industry_id) REFERENCES industries (id);

ALTER TABLE b2b_pipeline
  ADD FOREIGN KEY (owner_id)   REFERENCES users (id),
  ADD FOREIGN KEY (company_id) REFERENCES b2b_company (id);

ALTER TABLE b2b_actions
  ADD FOREIGN KEY (pipeline_id) REFERENCES b2b_pipeline (id) ON DELETE CASCADE,
  ADD FOREIGN KEY (assignee_id) REFERENCES users (id)         ON DELETE SET NULL;

-- Trainer Pool

ALTER TABLE trainers
  ADD FOREIGN KEY (phone_country_id) REFERENCES phone_country_codes (id),
  ADD FOREIGN KEY (user_id)          REFERENCES users (id),
  ADD FOREIGN KEY (referred_by)      REFERENCES users (id);

ALTER TABLE trainer_specialization_map
  ADD FOREIGN KEY (trainer_id)        REFERENCES trainers (id)                ON DELETE CASCADE,
  ADD FOREIGN KEY (specialization_id) REFERENCES trainer_specializations (id) ON DELETE CASCADE;

ALTER TABLE trainer_screening_steps
  ADD FOREIGN KEY (trainer_id) REFERENCES trainers (id) ON DELETE CASCADE;

ALTER TABLE trainer_screening_scores
  ADD FOREIGN KEY (trainer_id) REFERENCES trainers (id) ON DELETE CASCADE,
  ADD FOREIGN KEY (scored_by)  REFERENCES users (id);

ALTER TABLE trainer_certification_steps
  ADD FOREIGN KEY (trainer_id)   REFERENCES trainers (id) ON DELETE CASCADE,
  ADD FOREIGN KEY (evaluator_id) REFERENCES users (id);

ALTER TABLE trainer_availabilities
  ADD FOREIGN KEY (trainer_id) REFERENCES trainers (id) ON DELETE CASCADE;

ALTER TABLE trainer_assignments
  ADD FOREIGN KEY (pipeline_id) REFERENCES b2b_pipeline (id) ON DELETE CASCADE,
  ADD FOREIGN KEY (trainer_id)  REFERENCES trainers (id);

ALTER TABLE trainer_evaluations
  ADD FOREIGN KEY (assignment_id) REFERENCES trainer_assignments (id) ON DELETE SET NULL,
  ADD FOREIGN KEY (trainer_id)    REFERENCES trainers (id),
  ADD FOREIGN KEY (reviewed_by)   REFERENCES users (id);

---------------
-- Functions --
---------------

CREATE OR REPLACE FUNCTION update_updated_at()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at := CURRENT_TIMESTAMP;
    RETURN NEW;
  END;
$$ LANGUAGE plpgsql;

--------------
-- Triggers --
--------------

-- Lookup tables

CREATE TRIGGER update_roles_updated_at_trigger
  BEFORE UPDATE ON roles
  FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- User data

CREATE TRIGGER update_users_updated_at_trigger
  BEFORE UPDATE ON users
  FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- B2B Sales Pipeline

CREATE TRIGGER update_b2b_company_updated_at_trigger
  BEFORE UPDATE ON b2b_company
  FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_b2b_pipeline_updated_at_trigger
  BEFORE UPDATE ON b2b_pipeline
  FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_b2b_actions_updated_at_trigger
  BEFORE UPDATE ON b2b_actions
  FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Trainer Pool

CREATE TRIGGER update_trainers_updated_at_trigger
  BEFORE UPDATE ON trainers
  FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_trainer_screening_steps_updated_at_trigger
  BEFORE UPDATE ON trainer_screening_steps
  FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_trainer_screening_scores_updated_at_trigger
  BEFORE UPDATE ON trainer_screening_scores
  FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_trainer_certification_steps_updated_at_trigger
  BEFORE UPDATE ON trainer_certification_steps
  FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_trainer_availabilities_updated_at_trigger
  BEFORE UPDATE ON trainer_availabilities
  FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_trainer_assignments_updated_at_trigger
  BEFORE UPDATE ON trainer_assignments
  FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();
