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
  'junior',
  'senior'
);

-- Pipeline stage, derived automatically from screening/certification
-- progress, never set directly by an admin.
CREATE TYPE trainer_stage_enum AS ENUM (
  'candidate',
  'qualified',
  'not_qualified',
  'certified',
  'not_eligible'
);

-- Simple on/off flag, independent of pipeline stage.
CREATE TYPE trainer_status_enum AS ENUM (
  'active',
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

CREATE TYPE trnsc_status_enum AS ENUM (
  'pending',
  'passed',
  'failed',
  'skipped'
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

-- Enumeration for the LMS tables (lms_*) — migrated from the Sevenpreneur
-- AI-LMS database's ail_* schema (docs/db/ailene-ddl.sql in that repo).

CREATE TYPE lms_role_enum AS ENUM (
  'student',
  'champion',
  'sponsor'
);

CREATE TYPE lms_use_case_frequency_enum AS ENUM (
  'daily',
  'weekly',
  'monthly',
  'occasionally'
);

CREATE TYPE lms_use_case_type_enum AS ENUM (
  'workflow_automation',
  'content_creation',
  'data_analysis',
  'research',
  'communication',
  'decision_support',
  'learning',
  'other'
);

CREATE TYPE lms_learning_type_enum AS ENUM (
  'quiz',
  'video',
  'material',
  'use_case',
  'prompt'
);

-- Pre-assessment single-choice enums (one per question)

CREATE TYPE lms_pa_ai_use_freq_enum AS ENUM (
  'never',
  'tried',
  'weekly',
  'daily',
  'intensive'
);

CREATE TYPE lms_pa_frequency_enum AS ENUM (
  'never',
  'rarely',
  'sometimes',
  'often',
  'always'
);

CREATE TYPE lms_pa_refine_scenario_enum AS ENUM (
  'targeted',
  'switch_tool',
  'manual',
  'restart'
);

CREATE TYPE lms_pa_output_review_enum AS ENUM (
  'no_check',
  'sometimes',
  'always',
  'cross_check',
  'no_use'
);

CREATE TYPE lms_pa_team_adoption_enum AS ENUM (
  'none',
  'personal',
  'pilot',
  'policy',
  'integrated'
);

CREATE TYPE lms_pa_prompt_skill_enum AS ENUM (
  'none',
  'basic',
  'decent',
  'structured',
  'expert'
);

CREATE TYPE lms_pa_attitude_enum AS ENUM (
  'too_risky',
  'cautious',
  'neutral',
  'supportive',
  'essential'
);

CREATE TYPE lms_pa_motivation_enum AS ENUM (
  'mandatory',
  'curious',
  'tentative',
  'ready',
  'eager'
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
  id                   UUID                 PRIMARY KEY  DEFAULT gen_random_uuid(),
  user_id              UUID                 NOT NULL     UNIQUE, -- identity (full_name/email/phone) lives on users
  source               trainer_source_enum           NULL,
  level                trainer_level_enum   NOT NULL     DEFAULT 'junior', -- junior or senior, that's it
  stage                trainer_stage_enum   NOT NULL     DEFAULT 'candidate', -- derived, not admin-set
  status               trainer_status_enum  NOT NULL     DEFAULT 'active', -- simple on/off flag
  referred_by          UUID                          NULL,
  notes                TEXT                          NULL,
  ai_experience_years  SMALLINT             NOT NULL     DEFAULT 0,
  created_at           TIMESTAMPTZ          NOT NULL     DEFAULT CURRENT_TIMESTAMP,
  updated_at           TIMESTAMPTZ          NOT NULL     DEFAULT CURRENT_TIMESTAMP,
  deleted_at           TIMESTAMPTZ                   NULL
);

CREATE TABLE trainer_specialization_map (
  trainer_id        UUID      NOT NULL,
  specialization_id SMALLINT  NOT NULL,
  PRIMARY KEY (trainer_id, specialization_id)
);

CREATE TABLE trainer_screenings (
  id                        SERIAL             PRIMARY KEY,
  trainer_id                UUID               NOT NULL     UNIQUE,
  application_review        trnsc_status_enum  NOT NULL     DEFAULT 'pending',
  interview                 trnsc_status_enum  NOT NULL     DEFAULT 'pending',
  teaching_demo             trnsc_status_enum  NOT NULL     DEFAULT 'pending',
  practical_test            trnsc_status_enum  NOT NULL     DEFAULT 'pending',
  reference_check           trnsc_status_enum  NOT NULL     DEFAULT 'pending',
  ai_hands_on_score         SMALLINT           NOT NULL     DEFAULT 0,
  facilitation_score        SMALLINT           NOT NULL     DEFAULT 0,
  domain_credibility_score  SMALLINT           NOT NULL     DEFAULT 0,
  communication_score       SMALLINT           NOT NULL     DEFAULT 0,
  reliability_score         SMALLINT           NOT NULL     DEFAULT 0,
  total_score               SMALLINT           NOT NULL     DEFAULT 0,
  scored_by                 UUID                        NULL,
  scored_at                 TIMESTAMPTZ                 NULL,
  created_at                TIMESTAMPTZ        NOT NULL     DEFAULT CURRENT_TIMESTAMP,
  updated_at                TIMESTAMPTZ        NOT NULL     DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE trainer_certifications (
  id                               SERIAL               PRIMARY KEY,
  trainer_id                       UUID                 NOT NULL     UNIQUE,
  orientation                      trncert_status_enum  NOT NULL     DEFAULT 'not_started',
  material_mastery                 trncert_status_enum  NOT NULL     DEFAULT 'not_started',
  shadowing                        trncert_status_enum  NOT NULL     DEFAULT 'not_started',
  co_training                      trncert_status_enum  NOT NULL     DEFAULT 'not_started',
  solo_observed_delivery           trncert_status_enum  NOT NULL     DEFAULT 'not_started',
  certification_decision           trncert_status_enum  NOT NULL     DEFAULT 'not_started',
  created_at                       TIMESTAMPTZ          NOT NULL     DEFAULT CURRENT_TIMESTAMP,
  updated_at                       TIMESTAMPTZ          NOT NULL     DEFAULT CURRENT_TIMESTAMP
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

-- LMS (Ailene AI Learning Platform) — migrated from Sevenpreneur's ail_*
-- schema. Only the pure content-catalog tables carry migrated data; the
-- member/progress/submission tables below are created empty (see the
-- migration note at the end of this section).

-- Lookup tables

CREATE TABLE lms_categories (
  id    SMALLSERIAL  PRIMARY KEY,
  name  VARCHAR      NOT NULL  UNIQUE
);

-- Organizational access related

CREATE TABLE lms_members (
  id                SERIAL           PRIMARY KEY,
  user_id           UUID             NOT NULL  UNIQUE,  -- a Sevenpreneur or ailene-os users.id, unconstrained (two possible identity spaces)
  role              lms_role_enum    NOT NULL,
  job_title         VARCHAR          NOT NULL,
  group_id          INTEGER              NULL,
  current_level_id  INTEGER          NOT NULL  DEFAULT 0,
  level_history     JSON             NOT NULL  DEFAULT '[]',
  last_active_at    TIMESTAMPTZ          NULL,
  created_at        TIMESTAMPTZ      NOT NULL  DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE lms_projects (
  id          SERIAL       PRIMARY KEY,
  name        VARCHAR      NOT NULL,
  company_id  INTEGER          NULL,
  created_at  TIMESTAMPTZ  NOT NULL  DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMPTZ  NOT NULL  DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE lms_groups (
  id           SERIAL       PRIMARY KEY,
  name         VARCHAR      NOT NULL,
  project_id   INTEGER      NOT NULL,
  champion_id  INTEGER      NOT NULL,
  created_at   TIMESTAMPTZ  NOT NULL  DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMPTZ  NOT NULL  DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE lms_coaching_notes (
  id           SERIAL       PRIMARY KEY,
  member_id    INTEGER      NOT NULL,  -- member the note is about
  champion_id  INTEGER      NOT NULL,  -- champion who wrote it
  text         TEXT         NOT NULL,
  created_at   TIMESTAMPTZ  NOT NULL  DEFAULT CURRENT_TIMESTAMP
);

-- Learning related

CREATE TABLE lms_levels (
  id            SERIAL       PRIMARY KEY,
  level_number  SMALLINT     NOT NULL  UNIQUE,
  name          VARCHAR      NOT NULL,
  icon          VARCHAR          NULL,
  min_xp        INTEGER      NOT NULL  DEFAULT 0,
  status        status_enum  NOT NULL  DEFAULT 'active',
  created_at    TIMESTAMPTZ  NOT NULL  DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMPTZ  NOT NULL  DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE lms_chapters (
  id            SERIAL       PRIMARY KEY,
  level_id      INTEGER      NOT NULL,
  name          VARCHAR      NOT NULL,
  description   TEXT             NULL,
  session_date  TIMESTAMPTZ  NOT NULL,
  status        status_enum  NOT NULL  DEFAULT 'active',
  created_at    TIMESTAMPTZ  NOT NULL  DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMPTZ  NOT NULL  DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE lms_quizzes (
  id           VARCHAR      PRIMARY KEY  DEFAULT encode(gen_random_bytes(12), 'hex'),
  chapter_id   INTEGER      NOT NULL,
  name         VARCHAR      NOT NULL,
  description  TEXT             NULL,
  order_index  SMALLINT     NOT NULL  DEFAULT 0,
  status       status_enum  NOT NULL  DEFAULT 'active',
  created_at   TIMESTAMPTZ  NOT NULL  DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMPTZ  NOT NULL  DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE lms_quiz_questions (
  id           SERIAL       PRIMARY KEY,
  quiz_id      VARCHAR      NOT NULL,
  question     TEXT         NOT NULL,
  explanation  TEXT             NULL,
  order_index  SMALLINT     NOT NULL  DEFAULT 0,
  xp_reward    SMALLINT     NOT NULL  DEFAULT 0,
  created_at   TIMESTAMPTZ  NOT NULL  DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMPTZ  NOT NULL  DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE lms_quiz_options (
  id           SERIAL   PRIMARY KEY,
  question_id  INTEGER  NOT NULL,
  option_code  VARCHAR  NOT NULL,
  text         VARCHAR  NOT NULL,
  is_correct   BOOLEAN  NOT NULL  DEFAULT FALSE
);

CREATE TABLE lms_videos (
  id           SERIAL       PRIMARY KEY,
  chapter_id   INTEGER      NOT NULL,
  title        VARCHAR      NOT NULL,
  description  TEXT             NULL,
  video_url    TEXT         NOT NULL,
  xp_reward    SMALLINT     NOT NULL  DEFAULT 0,
  order_index  SMALLINT     NOT NULL  DEFAULT 0,
  status       status_enum  NOT NULL  DEFAULT 'active',
  created_at   TIMESTAMPTZ  NOT NULL  DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMPTZ  NOT NULL  DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE lms_materials (
  id           VARCHAR      PRIMARY KEY  DEFAULT encode(gen_random_bytes(12), 'hex'),
  chapter_id   INTEGER      NOT NULL,
  title        VARCHAR      NOT NULL,
  description  TEXT             NULL,
  content      TEXT             NULL,
  file_url     TEXT             NULL,
  image_url    TEXT             NULL,
  xp_reward    SMALLINT     NOT NULL  DEFAULT 0,
  order_index  SMALLINT     NOT NULL  DEFAULT 0,
  status       status_enum  NOT NULL  DEFAULT 'active',
  created_at   TIMESTAMPTZ  NOT NULL  DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMPTZ  NOT NULL  DEFAULT CURRENT_TIMESTAMP,
  CHECK (content IS NOT NULL OR file_url IS NOT NULL)
);

CREATE TABLE lms_prompts (
  id               SERIAL       PRIMARY KEY,
  level_id         INTEGER      NOT NULL,
  name             VARCHAR      NOT NULL,
  scenario         TEXT         NOT NULL,
  expected_output  TEXT         NOT NULL,
  xp_reward        SMALLINT     NOT NULL  DEFAULT 70,
  status           status_enum  NOT NULL  DEFAULT 'active',
  is_self_created  BOOLEAN      NOT NULL  DEFAULT FALSE,
  created_at       TIMESTAMPTZ  NOT NULL  DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMPTZ  NOT NULL  DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE lms_prompt_submissions (
  id                  SERIAL                  PRIMARY KEY,
  member_id           INTEGER                 NOT NULL,
  prompt_id           INTEGER                 NOT NULL,
  assigned_by_id      INTEGER                     NULL,  -- champion who assigned; NULL = self-driven
  deadline            TIMESTAMPTZ                 NULL,
  message             TEXT                        NULL,  -- champion's assignment note
  input               TEXT                        NULL,  -- filled by student
  output              TEXT                        NULL,
  submitted_at        TIMESTAMPTZ                 NULL,  -- NULL = not yet submitted
  reviewed_by_id      INTEGER                     NULL,  -- champion who reviewed
  reviewed_at         TIMESTAMPTZ                 NULL,
  comment             TEXT                        NULL,  -- champion's review feedback
  is_accepted         BOOLEAN                 NOT NULL  DEFAULT FALSE,
  -- Prompting Quality rubric (filled by champion at review): 1-5 per dimension.
  rubric_specificity  SMALLINT                    NULL  CHECK (rubric_specificity BETWEEN 1 AND 5),
  rubric_context      SMALLINT                    NULL  CHECK (rubric_context     BETWEEN 1 AND 5),
  rubric_constraints  SMALLINT                    NULL  CHECK (rubric_constraints BETWEEN 1 AND 5),
  rubric_examples     SMALLINT                    NULL  CHECK (rubric_examples    BETWEEN 1 AND 5),
  rubric_iteration    SMALLINT                    NULL  CHECK (rubric_iteration   BETWEEN 1 AND 5),
  created_at          TIMESTAMPTZ             NOT NULL  DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMPTZ             NOT NULL  DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (member_id, prompt_id)
);

CREATE TABLE lms_use_cases (
  id               SERIAL       PRIMARY KEY,
  level_id         INTEGER      NOT NULL,
  name             VARCHAR      NOT NULL,
  description      TEXT         NOT NULL,
  xp_reward        SMALLINT     NOT NULL  DEFAULT 70,
  status           status_enum  NOT NULL  DEFAULT 'active',
  is_self_created  BOOLEAN      NOT NULL  DEFAULT FALSE,
  created_at       TIMESTAMPTZ  NOT NULL  DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMPTZ  NOT NULL  DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE lms_use_case_submissions (
  id                SERIAL                      PRIMARY KEY,
  member_id         INTEGER                     NOT NULL,
  use_case_id       INTEGER                     NOT NULL,
  assigned_by_id    INTEGER                         NULL,
  deadline          TIMESTAMPTZ                     NULL,
  message           TEXT                            NULL,
  outcome_proof     VARCHAR                         NULL,
  hours_with_ai     DECIMAL(6, 2)                   NULL,
  hours_without_ai  DECIMAL(6, 2)                   NULL,
  description       TEXT                            NULL,
  ai_tool           VARCHAR                         NULL,
  frequency         lms_use_case_frequency_enum     NULL,
  type              lms_use_case_type_enum          NULL,
  submitted_at      TIMESTAMPTZ                     NULL,
  reviewed_by_id    INTEGER                         NULL,
  reviewed_at       TIMESTAMPTZ                     NULL,
  comment           TEXT                            NULL,
  is_accepted       BOOLEAN                     NOT NULL  DEFAULT FALSE,
  created_at        TIMESTAMPTZ                 NOT NULL  DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMPTZ                 NOT NULL  DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (member_id, use_case_id)
);

-- Relation Tables --

CREATE TABLE lms_prompt_categories (
  prompt_id    INTEGER   NOT NULL,
  category_id  SMALLINT  NOT NULL,
  PRIMARY KEY (prompt_id, category_id)
);

CREATE TABLE lms_use_case_categories (
  use_case_id  INTEGER   NOT NULL,
  category_id  SMALLINT  NOT NULL,
  PRIMARY KEY (use_case_id, category_id)
);

CREATE TABLE lms_quiz_submissions (
  id              SERIAL       PRIMARY KEY,
  member_id       INTEGER      NOT NULL,
  quiz_id         VARCHAR      NOT NULL,
  attempt_number  SMALLINT     NOT NULL,
  answers         JSON         NOT NULL,
  score           SMALLINT     NOT NULL,
  is_completed    BOOLEAN      NOT NULL  DEFAULT FALSE,
  started_at      TIMESTAMPTZ  NOT NULL  DEFAULT CURRENT_TIMESTAMP,
  submitted_at    TIMESTAMPTZ  NOT NULL  DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (member_id, quiz_id, attempt_number)
);

CREATE TABLE lms_video_completions (
  member_id     INTEGER      NOT NULL,
  video_id      INTEGER      NOT NULL,
  completed_at  TIMESTAMPTZ  NOT NULL  DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (member_id, video_id)
);

CREATE TABLE lms_material_completions (
  member_id     INTEGER      NOT NULL,
  material_id   VARCHAR      NOT NULL,
  completed_at  TIMESTAMPTZ  NOT NULL  DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (member_id, material_id)
);

CREATE TABLE lms_xp_earnings (
  id             SERIAL              PRIMARY KEY,
  member_id      INTEGER             NOT NULL,
  learning_type  lms_learning_type_enum  NOT NULL,
  learning_id    VARCHAR             NOT NULL,
  xp_earned      SMALLINT            NOT NULL,
  earned_at      TIMESTAMPTZ         NOT NULL  DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (member_id, learning_type, learning_id)
);

CREATE TABLE lms_pre_assessments (
  id                     SERIAL                       PRIMARY KEY,
  member_id              INTEGER                      NOT NULL  UNIQUE,
  ai_use_frequency       lms_pa_ai_use_freq_enum      NOT NULL,
  ai_tools_used          TEXT[]                       NOT NULL  DEFAULT '{}',
  ai_limitations         TEXT[]                       NOT NULL  DEFAULT '{}',
  output_review          lms_pa_output_review_enum    NOT NULL,
  use_cases              TEXT[]                       NOT NULL  DEFAULT '{}',
  team_adoption          lms_pa_team_adoption_enum    NOT NULL,
  concrete_example       VARCHAR                          NULL,
  model_selection        lms_pa_frequency_enum        NOT NULL,
  multimodal_use         lms_pa_frequency_enum        NOT NULL,
  workflow_reuse         lms_pa_frequency_enum        NOT NULL,
  prompt_comfort         lms_pa_prompt_skill_enum     NOT NULL,
  prompt_iteration       lms_pa_frequency_enum        NOT NULL,
  refine_scenario        lms_pa_refine_scenario_enum  NOT NULL,
  professional_attitude  lms_pa_attitude_enum         NOT NULL,
  data_safety_check      lms_pa_frequency_enum        NOT NULL,
  publish_unchecked      lms_pa_frequency_enum        NOT NULL,
  biggest_challenge      TEXT                         NOT NULL,
  training_expectation   TEXT                         NOT NULL,
  motivation             lms_pa_motivation_enum       NOT NULL,
  created_at             TIMESTAMPTZ                  NOT NULL  DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE lms_pre_assessment_reports (
  id                 SERIAL       PRIMARY KEY,
  pre_assessment_id  INTEGER      NOT NULL  UNIQUE,
  status             VARCHAR      NOT NULL  DEFAULT 'pending',
  recommendations    JSON             NULL,
  error_message      TEXT             NULL,
  queued_at          TIMESTAMPTZ  NOT NULL  DEFAULT CURRENT_TIMESTAMP,
  generated_at       TIMESTAMPTZ      NULL,
  updated_at         TIMESTAMPTZ  NOT NULL  DEFAULT CURRENT_TIMESTAMP,
  CHECK (status IN ('pending', 'processing', 'completed', 'failed'))
);

-- Announcement

CREATE TABLE lms_announcement (
  id          INTEGER      PRIMARY KEY  DEFAULT 1,
  title       VARCHAR      NOT NULL,
  callout     VARCHAR          NULL,
  status      status_enum  NOT NULL,
  start_date  TIMESTAMPTZ  NOT NULL,
  end_date    TIMESTAMPTZ  NOT NULL,
  updated_at  TIMESTAMPTZ  NOT NULL  DEFAULT CURRENT_TIMESTAMP
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
  ADD FOREIGN KEY (user_id)     REFERENCES users (id),
  ADD FOREIGN KEY (referred_by) REFERENCES users (id);

ALTER TABLE trainer_specialization_map
  ADD FOREIGN KEY (trainer_id)        REFERENCES trainers (id)                ON DELETE CASCADE,
  ADD FOREIGN KEY (specialization_id) REFERENCES trainer_specializations (id) ON DELETE CASCADE;

ALTER TABLE trainer_screenings
  ADD FOREIGN KEY (trainer_id) REFERENCES trainers (id) ON DELETE CASCADE,
  ADD FOREIGN KEY (scored_by)  REFERENCES users (id);

ALTER TABLE trainer_certifications
  ADD FOREIGN KEY (trainer_id) REFERENCES trainers (id) ON DELETE CASCADE;

ALTER TABLE trainer_availabilities
  ADD FOREIGN KEY (trainer_id) REFERENCES trainers (id) ON DELETE CASCADE;

ALTER TABLE trainer_assignments
  ADD FOREIGN KEY (pipeline_id) REFERENCES b2b_pipeline (id) ON DELETE CASCADE,
  ADD FOREIGN KEY (trainer_id)  REFERENCES trainers (id);

-- LMS
-- Note: lms_members.user_id intentionally has no FK — it points at either a
-- Sevenpreneur user id or an ailene-os users.id, two different identity spaces.

ALTER TABLE lms_members
  ADD FOREIGN KEY (group_id)         REFERENCES lms_groups (id),
  ADD FOREIGN KEY (current_level_id) REFERENCES lms_levels (id);

ALTER TABLE lms_projects
  ADD FOREIGN KEY (company_id) REFERENCES b2b_company (id);

ALTER TABLE lms_groups
  ADD FOREIGN KEY (project_id)  REFERENCES lms_projects (id),
  ADD FOREIGN KEY (champion_id) REFERENCES lms_members (id);

ALTER TABLE lms_coaching_notes
  ADD FOREIGN KEY (member_id)   REFERENCES lms_members (id),
  ADD FOREIGN KEY (champion_id) REFERENCES lms_members (id);

ALTER TABLE lms_chapters
  ADD FOREIGN KEY (level_id) REFERENCES lms_levels (id);

ALTER TABLE lms_quizzes
  ADD FOREIGN KEY (chapter_id) REFERENCES lms_chapters (id);

ALTER TABLE lms_videos
  ADD FOREIGN KEY (chapter_id) REFERENCES lms_chapters (id);

ALTER TABLE lms_materials
  ADD FOREIGN KEY (chapter_id) REFERENCES lms_chapters (id);

ALTER TABLE lms_quiz_questions
  ADD FOREIGN KEY (quiz_id) REFERENCES lms_quizzes (id);

ALTER TABLE lms_quiz_options
  ADD FOREIGN KEY (question_id) REFERENCES lms_quiz_questions (id);

ALTER TABLE lms_quiz_submissions
  ADD FOREIGN KEY (member_id) REFERENCES lms_members (id),
  ADD FOREIGN KEY (quiz_id)   REFERENCES lms_quizzes (id);

ALTER TABLE lms_video_completions
  ADD FOREIGN KEY (member_id) REFERENCES lms_members (id),
  ADD FOREIGN KEY (video_id)  REFERENCES lms_videos (id);

ALTER TABLE lms_material_completions
  ADD FOREIGN KEY (member_id)   REFERENCES lms_members (id),
  ADD FOREIGN KEY (material_id) REFERENCES lms_materials (id);

ALTER TABLE lms_xp_earnings
  ADD FOREIGN KEY (member_id) REFERENCES lms_members (id);

ALTER TABLE lms_pre_assessments
  ADD FOREIGN KEY (member_id) REFERENCES lms_members (id);

ALTER TABLE lms_pre_assessment_reports
  ADD FOREIGN KEY (pre_assessment_id) REFERENCES lms_pre_assessments (id);

ALTER TABLE lms_prompts
  ADD FOREIGN KEY (level_id) REFERENCES lms_levels (id);

ALTER TABLE lms_prompt_categories
  ADD FOREIGN KEY (prompt_id)   REFERENCES lms_prompts (id),
  ADD FOREIGN KEY (category_id) REFERENCES lms_categories (id);

ALTER TABLE lms_prompt_submissions
  ADD FOREIGN KEY (member_id)      REFERENCES lms_members (id),
  ADD FOREIGN KEY (prompt_id)      REFERENCES lms_prompts (id),
  ADD FOREIGN KEY (assigned_by_id) REFERENCES lms_members (id),
  ADD FOREIGN KEY (reviewed_by_id) REFERENCES lms_members (id);

ALTER TABLE lms_use_cases
  ADD FOREIGN KEY (level_id) REFERENCES lms_levels (id);

ALTER TABLE lms_use_case_categories
  ADD FOREIGN KEY (use_case_id) REFERENCES lms_use_cases (id),
  ADD FOREIGN KEY (category_id) REFERENCES lms_categories (id);

ALTER TABLE lms_use_case_submissions
  ADD FOREIGN KEY (member_id)      REFERENCES lms_members (id),
  ADD FOREIGN KEY (use_case_id)    REFERENCES lms_use_cases (id),
  ADD FOREIGN KEY (assigned_by_id) REFERENCES lms_members (id),
  ADD FOREIGN KEY (reviewed_by_id) REFERENCES lms_members (id);

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

CREATE TRIGGER update_trainer_screenings_updated_at_trigger
  BEFORE UPDATE ON trainer_screenings
  FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_trainer_certifications_updated_at_trigger
  BEFORE UPDATE ON trainer_certifications
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

-- LMS

CREATE TRIGGER update_lms_projects_updated_at_trigger
  BEFORE UPDATE ON lms_projects
  FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_lms_groups_updated_at_trigger
  BEFORE UPDATE ON lms_groups
  FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_lms_levels_updated_at_trigger
  BEFORE UPDATE ON lms_levels
  FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_lms_chapters_updated_at_trigger
  BEFORE UPDATE ON lms_chapters
  FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_lms_quizzes_updated_at_trigger
  BEFORE UPDATE ON lms_quizzes
  FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_lms_videos_updated_at_trigger
  BEFORE UPDATE ON lms_videos
  FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_lms_materials_updated_at_trigger
  BEFORE UPDATE ON lms_materials
  FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_lms_quiz_questions_updated_at_trigger
  BEFORE UPDATE ON lms_quiz_questions
  FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_lms_prompts_updated_at_trigger
  BEFORE UPDATE ON lms_prompts
  FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_lms_use_cases_updated_at_trigger
  BEFORE UPDATE ON lms_use_cases
  FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_lms_prompt_submissions_updated_at_trigger
  BEFORE UPDATE ON lms_prompt_submissions
  FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_lms_use_case_submissions_updated_at_trigger
  BEFORE UPDATE ON lms_use_case_submissions
  FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_lms_pre_assessment_reports_updated_at_trigger
  BEFORE UPDATE ON lms_pre_assessment_reports
  FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_lms_announcement_updated_at_trigger
  BEFORE UPDATE ON lms_announcement
  FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-------------
-- Indices --
-------------

-- Coaching notes — lookup a member's notes for the dashboard.
CREATE INDEX lms_coaching_notes_member_id_idx ON lms_coaching_notes (member_id);

-- Announcement — enforce single-row table.
CREATE UNIQUE INDEX lms_announcement_one_row_only ON lms_announcement ((TRUE));
