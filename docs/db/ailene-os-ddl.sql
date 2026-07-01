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
