-- CreateEnum
CREATE TYPE "status_enum" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "occupation_enum" AS ENUM ('employee', 'entrepreneur', 'student', 'freelance', 'military', 'unemployed');

-- CreateEnum
CREATE TYPE "b2b_stage_enum" AS ENUM ('lead_identified', 'contacted', 'negotiation', 'verbal_commit', 'closed_won', 'closed_lost', 'on_hold');

-- CreateEnum
CREATE TYPE "b2b_probability_status_enum" AS ENUM ('cold', 'warm', 'hot');

-- CreateEnum
CREATE TYPE "b2ba_status_enum" AS ENUM ('to_do', 'in_progress', 'review', 'done');

-- CreateEnum
CREATE TYPE "b2ba_priority_enum" AS ENUM ('low', 'medium', 'high', 'urgent');

-- CreateEnum
CREATE TYPE "trainer_level_enum" AS ENUM ('junior', 'senior');

-- CreateEnum
CREATE TYPE "trainer_stage_enum" AS ENUM ('candidate', 'qualified', 'not_qualified', 'certified', 'not_eligible');

-- CreateEnum
CREATE TYPE "trainer_status_enum" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "trainer_source_enum" AS ENUM ('ai_community', 'top_alumni', 'domain_practitioner', 'trainer_network', 'corporate_practitioner', 'internal_referral');

-- CreateEnum
CREATE TYPE "trnsc_step_enum" AS ENUM ('application_review', 'interview', 'teaching_demo', 'practical_test', 'reference_check');

-- CreateEnum
CREATE TYPE "trnsc_status_enum" AS ENUM ('pending', 'passed', 'failed', 'skipped');

-- CreateEnum
CREATE TYPE "trncert_step_enum" AS ENUM ('orientation', 'material_mastery', 'shadowing', 'co_training', 'solo_observed_delivery', 'certification_decision');

-- CreateEnum
CREATE TYPE "trncert_status_enum" AS ENUM ('not_started', 'in_progress', 'passed', 'failed');

-- CreateEnum
CREATE TYPE "trainer_availability_status_enum" AS ENUM ('available', 'limited', 'unavailable');

-- CreateEnum
CREATE TYPE "trna_role_enum" AS ENUM ('lead', 'assistant', 'co_trainer', 'specialist');

-- CreateEnum
CREATE TYPE "lms_role_enum" AS ENUM ('student', 'champion', 'sponsor');

-- CreateEnum
CREATE TYPE "lms_use_case_frequency_enum" AS ENUM ('daily', 'weekly', 'monthly', 'occasionally');

-- CreateEnum
CREATE TYPE "lms_use_case_type_enum" AS ENUM ('workflow_automation', 'content_creation', 'data_analysis', 'research', 'communication', 'decision_support', 'learning', 'other');

-- CreateEnum
CREATE TYPE "lms_learning_type_enum" AS ENUM ('quiz', 'video', 'material', 'use_case', 'prompt');

-- CreateEnum
CREATE TYPE "lms_pa_ai_use_freq_enum" AS ENUM ('never', 'tried', 'weekly', 'daily', 'intensive');

-- CreateEnum
CREATE TYPE "lms_pa_frequency_enum" AS ENUM ('never', 'rarely', 'sometimes', 'often', 'always');

-- CreateEnum
CREATE TYPE "lms_pa_refine_scenario_enum" AS ENUM ('targeted', 'switch_tool', 'manual', 'restart');

-- CreateEnum
CREATE TYPE "lms_pa_output_review_enum" AS ENUM ('no_check', 'sometimes', 'always', 'cross_check', 'no_use');

-- CreateEnum
CREATE TYPE "lms_pa_team_adoption_enum" AS ENUM ('none', 'personal', 'pilot', 'policy', 'integrated');

-- CreateEnum
CREATE TYPE "lms_pa_prompt_skill_enum" AS ENUM ('none', 'basic', 'decent', 'structured', 'expert');

-- CreateEnum
CREATE TYPE "lms_pa_attitude_enum" AS ENUM ('too_risky', 'cautious', 'neutral', 'supportive', 'essential');

-- CreateEnum
CREATE TYPE "lms_pa_motivation_enum" AS ENUM ('mandatory', 'curious', 'tentative', 'ready', 'eager');

-- CreateTable
CREATE TABLE "industries" (
    "id" SMALLSERIAL NOT NULL,
    "industry_name" VARCHAR NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "industries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" SMALLSERIAL NOT NULL,
    "name" VARCHAR NOT NULL,
    "permission" SMALLINT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phone_country_codes" (
    "id" SMALLSERIAL NOT NULL,
    "country_name" VARCHAR NOT NULL,
    "phone_code" VARCHAR NOT NULL,
    "emoji" VARCHAR NOT NULL,
    "icon" VARCHAR,

    CONSTRAINT "phone_country_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trainer_specializations" (
    "id" SMALLSERIAL NOT NULL,
    "specialization_name" VARCHAR NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trainer_specializations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "full_name" VARCHAR NOT NULL,
    "email" VARCHAR NOT NULL,
    "phone_country_id" SMALLINT,
    "phone_number" VARCHAR,
    "avatar" VARCHAR,
    "role_id" SMALLINT NOT NULL DEFAULT 3,
    "status" "status_enum" NOT NULL DEFAULT 'active',
    "date_of_birth" DATE,
    "occupation" "occupation_enum",
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_login" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tokens" (
    "id" SERIAL NOT NULL,
    "user_id" UUID NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "token" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "b2b_company" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR NOT NULL,
    "industry_id" SMALLINT NOT NULL,
    "pic_name" VARCHAR,
    "pic_job_title" VARCHAR,
    "pic_wa" VARCHAR,
    "pic_email" VARCHAR,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "b2b_company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "b2b_pipeline" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR NOT NULL,
    "company_id" INTEGER NOT NULL,
    "stage" "b2b_stage_enum" NOT NULL DEFAULT 'lead_identified',
    "probability" SMALLINT NOT NULL DEFAULT 0,
    "probability_status" "b2b_probability_status_enum" NOT NULL DEFAULT 'cold',
    "project_value" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "project_start_month" DATE,
    "project_end_month" DATE,
    "owner_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "b2b_pipeline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "b2b_actions" (
    "id" SERIAL NOT NULL,
    "pipeline_id" INTEGER NOT NULL,
    "name" VARCHAR NOT NULL,
    "summary" TEXT,
    "status" "b2ba_status_enum" NOT NULL DEFAULT 'to_do',
    "priority" "b2ba_priority_enum" NOT NULL DEFAULT 'medium',
    "due_date" DATE,
    "assignee_id" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "b2b_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trainers" (
    "id" UUID NOT NULL,
    "source" "trainer_source_enum",
    "level" "trainer_level_enum" NOT NULL DEFAULT 'junior',
    "stage" "trainer_stage_enum" NOT NULL DEFAULT 'candidate',
    "status" "trainer_status_enum" NOT NULL DEFAULT 'active',
    "user_id" UUID NOT NULL,
    "referred_by" UUID,
    "notes" TEXT,
    "ai_experience_years" SMALLINT NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "trainers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trainer_specialization_map" (
    "trainer_id" UUID NOT NULL,
    "specialization_id" SMALLINT NOT NULL,

    CONSTRAINT "trainer_specialization_map_pkey" PRIMARY KEY ("trainer_id","specialization_id")
);

-- CreateTable
CREATE TABLE "trainer_screening_steps" (
    "id" SERIAL NOT NULL,
    "trainer_id" UUID NOT NULL,
    "step" "trnsc_step_enum" NOT NULL,
    "status" "trnsc_status_enum" NOT NULL DEFAULT 'pending',
    "notes" TEXT,
    "completed_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trainer_screening_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trainer_screening_scores" (
    "id" SERIAL NOT NULL,
    "trainer_id" UUID NOT NULL,
    "ai_hands_on_score" SMALLINT NOT NULL DEFAULT 0,
    "facilitation_score" SMALLINT NOT NULL DEFAULT 0,
    "domain_credibility_score" SMALLINT NOT NULL DEFAULT 0,
    "communication_score" SMALLINT NOT NULL DEFAULT 0,
    "reliability_score" SMALLINT NOT NULL DEFAULT 0,
    "total_score" SMALLINT NOT NULL DEFAULT 0,
    "scored_by" UUID,
    "scored_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trainer_screening_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trainer_certification_steps" (
    "id" SERIAL NOT NULL,
    "trainer_id" UUID NOT NULL,
    "step" "trncert_step_enum" NOT NULL,
    "status" "trncert_status_enum" NOT NULL DEFAULT 'not_started',
    "sessions_required" SMALLINT NOT NULL DEFAULT 1,
    "sessions_completed" SMALLINT NOT NULL DEFAULT 0,
    "evaluator_id" UUID,
    "notes" TEXT,
    "completed_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trainer_certification_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trainer_availabilities" (
    "id" SERIAL NOT NULL,
    "trainer_id" UUID NOT NULL,
    "period" DATE NOT NULL,
    "status" "trainer_availability_status_enum" NOT NULL DEFAULT 'available',
    "notes" VARCHAR,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trainer_availabilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trainer_assignments" (
    "id" SERIAL NOT NULL,
    "pipeline_id" INTEGER NOT NULL,
    "trainer_id" UUID NOT NULL,
    "role" "trna_role_enum" NOT NULL DEFAULT 'lead',
    "session_date" DATE,
    "participant_count" SMALLINT,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trainer_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lms_categories" (
    "id" SMALLSERIAL NOT NULL,
    "name" VARCHAR NOT NULL,

    CONSTRAINT "lms_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lms_members" (
    "id" SERIAL NOT NULL,
    "user_id" UUID NOT NULL,
    "role" "lms_role_enum" NOT NULL,
    "job_title" VARCHAR NOT NULL,
    "group_id" INTEGER,
    "current_level_id" INTEGER NOT NULL DEFAULT 0,
    "level_history" JSONB NOT NULL DEFAULT '[]',
    "last_active_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lms_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lms_groups" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR NOT NULL,
    "project_id" INTEGER NOT NULL,
    "champion_id" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lms_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lms_projects" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR NOT NULL,
    "company_id" INTEGER,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lms_projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lms_coaching_notes" (
    "id" SERIAL NOT NULL,
    "member_id" INTEGER NOT NULL,
    "champion_id" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lms_coaching_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lms_levels" (
    "id" SERIAL NOT NULL,
    "level_number" SMALLINT NOT NULL,
    "name" VARCHAR NOT NULL,
    "icon" VARCHAR,
    "min_xp" INTEGER NOT NULL DEFAULT 0,
    "status" "status_enum" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lms_levels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lms_chapters" (
    "id" SERIAL NOT NULL,
    "level_id" INTEGER NOT NULL,
    "name" VARCHAR NOT NULL,
    "description" TEXT,
    "session_date" TIMESTAMPTZ NOT NULL,
    "status" "status_enum" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lms_chapters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lms_quizzes" (
    "id" VARCHAR NOT NULL DEFAULT encode(gen_random_bytes(12), 'hex'),
    "chapter_id" INTEGER NOT NULL,
    "name" VARCHAR NOT NULL,
    "description" TEXT,
    "order_index" SMALLINT NOT NULL DEFAULT 0,
    "status" "status_enum" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lms_quizzes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lms_quiz_questions" (
    "id" SERIAL NOT NULL,
    "quiz_id" VARCHAR NOT NULL,
    "question" TEXT NOT NULL,
    "explanation" TEXT,
    "order_index" SMALLINT NOT NULL DEFAULT 0,
    "xp_reward" SMALLINT NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lms_quiz_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lms_quiz_options" (
    "id" SERIAL NOT NULL,
    "question_id" INTEGER NOT NULL,
    "option_code" VARCHAR NOT NULL,
    "text" VARCHAR NOT NULL,
    "is_correct" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "lms_quiz_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lms_videos" (
    "id" SERIAL NOT NULL,
    "chapter_id" INTEGER NOT NULL,
    "title" VARCHAR NOT NULL,
    "description" TEXT,
    "video_url" TEXT NOT NULL,
    "xp_reward" SMALLINT NOT NULL DEFAULT 0,
    "order_index" SMALLINT NOT NULL DEFAULT 0,
    "status" "status_enum" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lms_videos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lms_materials" (
    "id" VARCHAR NOT NULL DEFAULT encode(gen_random_bytes(12), 'hex'),
    "chapter_id" INTEGER NOT NULL,
    "title" VARCHAR NOT NULL,
    "description" TEXT,
    "content" TEXT,
    "file_url" TEXT,
    "image_url" TEXT,
    "xp_reward" SMALLINT NOT NULL DEFAULT 0,
    "order_index" SMALLINT NOT NULL DEFAULT 0,
    "status" "status_enum" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lms_materials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lms_prompts" (
    "id" SERIAL NOT NULL,
    "level_id" INTEGER NOT NULL,
    "name" VARCHAR NOT NULL,
    "scenario" TEXT NOT NULL,
    "expected_output" TEXT NOT NULL,
    "xp_reward" SMALLINT NOT NULL DEFAULT 70,
    "status" "status_enum" NOT NULL DEFAULT 'active',
    "is_self_created" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lms_prompts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lms_prompt_submissions" (
    "id" SERIAL NOT NULL,
    "member_id" INTEGER NOT NULL,
    "prompt_id" INTEGER NOT NULL,
    "assigned_by_id" INTEGER,
    "deadline" TIMESTAMPTZ,
    "message" TEXT,
    "input" TEXT,
    "output" TEXT,
    "submitted_at" TIMESTAMPTZ,
    "reviewed_by_id" INTEGER,
    "reviewed_at" TIMESTAMPTZ,
    "comment" TEXT,
    "is_accepted" BOOLEAN NOT NULL DEFAULT false,
    "rubric_specificity" SMALLINT,
    "rubric_context" SMALLINT,
    "rubric_constraints" SMALLINT,
    "rubric_examples" SMALLINT,
    "rubric_iteration" SMALLINT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lms_prompt_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lms_use_cases" (
    "id" SERIAL NOT NULL,
    "level_id" INTEGER NOT NULL,
    "name" VARCHAR NOT NULL,
    "description" TEXT NOT NULL,
    "xp_reward" SMALLINT NOT NULL DEFAULT 70,
    "status" "status_enum" NOT NULL DEFAULT 'active',
    "is_self_created" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lms_use_cases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lms_use_case_submissions" (
    "id" SERIAL NOT NULL,
    "member_id" INTEGER NOT NULL,
    "use_case_id" INTEGER NOT NULL,
    "assigned_by_id" INTEGER,
    "deadline" TIMESTAMPTZ,
    "message" TEXT,
    "outcome_proof" VARCHAR,
    "hours_with_ai" DECIMAL(6,2),
    "hours_without_ai" DECIMAL(6,2),
    "description" TEXT,
    "ai_tool" VARCHAR,
    "frequency" "lms_use_case_frequency_enum",
    "type" "lms_use_case_type_enum",
    "submitted_at" TIMESTAMPTZ,
    "reviewed_by_id" INTEGER,
    "reviewed_at" TIMESTAMPTZ,
    "comment" TEXT,
    "is_accepted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lms_use_case_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lms_prompt_categories" (
    "prompt_id" INTEGER NOT NULL,
    "category_id" SMALLINT NOT NULL,

    CONSTRAINT "lms_prompt_categories_pkey" PRIMARY KEY ("prompt_id","category_id")
);

-- CreateTable
CREATE TABLE "lms_use_case_categories" (
    "use_case_id" INTEGER NOT NULL,
    "category_id" SMALLINT NOT NULL,

    CONSTRAINT "lms_use_case_categories_pkey" PRIMARY KEY ("use_case_id","category_id")
);

-- CreateTable
CREATE TABLE "lms_quiz_submissions" (
    "id" SERIAL NOT NULL,
    "member_id" INTEGER NOT NULL,
    "quiz_id" VARCHAR NOT NULL,
    "attempt_number" SMALLINT NOT NULL,
    "answers" JSONB NOT NULL,
    "score" SMALLINT NOT NULL,
    "is_completed" BOOLEAN NOT NULL DEFAULT false,
    "started_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submitted_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lms_quiz_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lms_video_completions" (
    "member_id" INTEGER NOT NULL,
    "video_id" INTEGER NOT NULL,
    "completed_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lms_video_completions_pkey" PRIMARY KEY ("member_id","video_id")
);

-- CreateTable
CREATE TABLE "lms_material_completions" (
    "member_id" INTEGER NOT NULL,
    "material_id" VARCHAR NOT NULL,
    "completed_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lms_material_completions_pkey" PRIMARY KEY ("member_id","material_id")
);

-- CreateTable
CREATE TABLE "lms_xp_earnings" (
    "id" SERIAL NOT NULL,
    "member_id" INTEGER NOT NULL,
    "learning_type" "lms_learning_type_enum" NOT NULL,
    "learning_id" VARCHAR NOT NULL,
    "xp_earned" SMALLINT NOT NULL,
    "earned_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lms_xp_earnings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lms_pre_assessments" (
    "id" SERIAL NOT NULL,
    "member_id" INTEGER NOT NULL,
    "ai_use_frequency" "lms_pa_ai_use_freq_enum" NOT NULL,
    "ai_tools_used" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "ai_limitations" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "output_review" "lms_pa_output_review_enum" NOT NULL,
    "use_cases" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "team_adoption" "lms_pa_team_adoption_enum" NOT NULL,
    "concrete_example" VARCHAR,
    "model_selection" "lms_pa_frequency_enum" NOT NULL,
    "multimodal_use" "lms_pa_frequency_enum" NOT NULL,
    "workflow_reuse" "lms_pa_frequency_enum" NOT NULL,
    "prompt_comfort" "lms_pa_prompt_skill_enum" NOT NULL,
    "prompt_iteration" "lms_pa_frequency_enum" NOT NULL,
    "refine_scenario" "lms_pa_refine_scenario_enum" NOT NULL,
    "professional_attitude" "lms_pa_attitude_enum" NOT NULL,
    "data_safety_check" "lms_pa_frequency_enum" NOT NULL,
    "publish_unchecked" "lms_pa_frequency_enum" NOT NULL,
    "biggest_challenge" TEXT NOT NULL,
    "training_expectation" TEXT NOT NULL,
    "motivation" "lms_pa_motivation_enum" NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lms_pre_assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lms_pre_assessment_reports" (
    "id" SERIAL NOT NULL,
    "pre_assessment_id" INTEGER NOT NULL,
    "status" VARCHAR NOT NULL DEFAULT 'pending',
    "recommendations" JSONB,
    "error_message" TEXT,
    "queued_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "generated_at" TIMESTAMPTZ,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lms_pre_assessment_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lms_announcement" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "title" VARCHAR NOT NULL,
    "callout" VARCHAR,
    "status" "status_enum" NOT NULL,
    "start_date" TIMESTAMPTZ NOT NULL,
    "end_date" TIMESTAMPTZ NOT NULL,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lms_announcement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "industries_industry_name_key" ON "industries"("industry_name");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "phone_country_codes_phone_code_key" ON "phone_country_codes"("phone_code");

-- CreateIndex
CREATE UNIQUE INDEX "trainer_specializations_specialization_name_key" ON "trainer_specializations"("specialization_name");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "tokens_token_key" ON "tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "trainers_user_id_key" ON "trainers"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "trainer_screening_steps_trainer_id_step_key" ON "trainer_screening_steps"("trainer_id", "step");

-- CreateIndex
CREATE UNIQUE INDEX "trainer_screening_scores_trainer_id_key" ON "trainer_screening_scores"("trainer_id");

-- CreateIndex
CREATE UNIQUE INDEX "trainer_certification_steps_trainer_id_step_key" ON "trainer_certification_steps"("trainer_id", "step");

-- CreateIndex
CREATE UNIQUE INDEX "trainer_availabilities_trainer_id_period_key" ON "trainer_availabilities"("trainer_id", "period");

-- CreateIndex
CREATE UNIQUE INDEX "lms_categories_name_key" ON "lms_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "lms_members_user_id_key" ON "lms_members"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "lms_levels_level_number_key" ON "lms_levels"("level_number");

-- CreateIndex
CREATE UNIQUE INDEX "lms_prompt_submissions_member_id_prompt_id_key" ON "lms_prompt_submissions"("member_id", "prompt_id");

-- CreateIndex
CREATE UNIQUE INDEX "lms_use_case_submissions_member_id_use_case_id_key" ON "lms_use_case_submissions"("member_id", "use_case_id");

-- CreateIndex
CREATE UNIQUE INDEX "lms_quiz_submissions_member_id_quiz_id_attempt_number_key" ON "lms_quiz_submissions"("member_id", "quiz_id", "attempt_number");

-- CreateIndex
CREATE UNIQUE INDEX "lms_xp_earnings_member_id_learning_type_learning_id_key" ON "lms_xp_earnings"("member_id", "learning_type", "learning_id");

-- CreateIndex
CREATE UNIQUE INDEX "lms_pre_assessments_member_id_key" ON "lms_pre_assessments"("member_id");

-- CreateIndex
CREATE UNIQUE INDEX "lms_pre_assessment_reports_pre_assessment_id_key" ON "lms_pre_assessment_reports"("pre_assessment_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_phone_country_id_fkey" FOREIGN KEY ("phone_country_id") REFERENCES "phone_country_codes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tokens" ADD CONSTRAINT "tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "b2b_company" ADD CONSTRAINT "b2b_company_industry_id_fkey" FOREIGN KEY ("industry_id") REFERENCES "industries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "b2b_pipeline" ADD CONSTRAINT "b2b_pipeline_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "b2b_company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "b2b_pipeline" ADD CONSTRAINT "b2b_pipeline_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "b2b_actions" ADD CONSTRAINT "b2b_actions_pipeline_id_fkey" FOREIGN KEY ("pipeline_id") REFERENCES "b2b_pipeline"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "b2b_actions" ADD CONSTRAINT "b2b_actions_assignee_id_fkey" FOREIGN KEY ("assignee_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trainers" ADD CONSTRAINT "trainers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trainers" ADD CONSTRAINT "trainers_referred_by_fkey" FOREIGN KEY ("referred_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trainer_specialization_map" ADD CONSTRAINT "trainer_specialization_map_trainer_id_fkey" FOREIGN KEY ("trainer_id") REFERENCES "trainers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trainer_specialization_map" ADD CONSTRAINT "trainer_specialization_map_specialization_id_fkey" FOREIGN KEY ("specialization_id") REFERENCES "trainer_specializations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trainer_screening_steps" ADD CONSTRAINT "trainer_screening_steps_trainer_id_fkey" FOREIGN KEY ("trainer_id") REFERENCES "trainers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trainer_screening_scores" ADD CONSTRAINT "trainer_screening_scores_trainer_id_fkey" FOREIGN KEY ("trainer_id") REFERENCES "trainers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trainer_screening_scores" ADD CONSTRAINT "trainer_screening_scores_scored_by_fkey" FOREIGN KEY ("scored_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trainer_certification_steps" ADD CONSTRAINT "trainer_certification_steps_trainer_id_fkey" FOREIGN KEY ("trainer_id") REFERENCES "trainers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trainer_certification_steps" ADD CONSTRAINT "trainer_certification_steps_evaluator_id_fkey" FOREIGN KEY ("evaluator_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trainer_availabilities" ADD CONSTRAINT "trainer_availabilities_trainer_id_fkey" FOREIGN KEY ("trainer_id") REFERENCES "trainers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trainer_assignments" ADD CONSTRAINT "trainer_assignments_pipeline_id_fkey" FOREIGN KEY ("pipeline_id") REFERENCES "b2b_pipeline"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trainer_assignments" ADD CONSTRAINT "trainer_assignments_trainer_id_fkey" FOREIGN KEY ("trainer_id") REFERENCES "trainers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lms_members" ADD CONSTRAINT "lms_members_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "lms_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lms_members" ADD CONSTRAINT "lms_members_current_level_id_fkey" FOREIGN KEY ("current_level_id") REFERENCES "lms_levels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lms_groups" ADD CONSTRAINT "lms_groups_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "lms_projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lms_groups" ADD CONSTRAINT "lms_groups_champion_id_fkey" FOREIGN KEY ("champion_id") REFERENCES "lms_members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lms_projects" ADD CONSTRAINT "lms_projects_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "b2b_company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lms_coaching_notes" ADD CONSTRAINT "lms_coaching_notes_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "lms_members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lms_coaching_notes" ADD CONSTRAINT "lms_coaching_notes_champion_id_fkey" FOREIGN KEY ("champion_id") REFERENCES "lms_members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lms_chapters" ADD CONSTRAINT "lms_chapters_level_id_fkey" FOREIGN KEY ("level_id") REFERENCES "lms_levels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lms_quizzes" ADD CONSTRAINT "lms_quizzes_chapter_id_fkey" FOREIGN KEY ("chapter_id") REFERENCES "lms_chapters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lms_quiz_questions" ADD CONSTRAINT "lms_quiz_questions_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "lms_quizzes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lms_quiz_options" ADD CONSTRAINT "lms_quiz_options_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "lms_quiz_questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lms_videos" ADD CONSTRAINT "lms_videos_chapter_id_fkey" FOREIGN KEY ("chapter_id") REFERENCES "lms_chapters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lms_materials" ADD CONSTRAINT "lms_materials_chapter_id_fkey" FOREIGN KEY ("chapter_id") REFERENCES "lms_chapters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lms_prompts" ADD CONSTRAINT "lms_prompts_level_id_fkey" FOREIGN KEY ("level_id") REFERENCES "lms_levels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lms_prompt_submissions" ADD CONSTRAINT "lms_prompt_submissions_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "lms_members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lms_prompt_submissions" ADD CONSTRAINT "lms_prompt_submissions_prompt_id_fkey" FOREIGN KEY ("prompt_id") REFERENCES "lms_prompts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lms_prompt_submissions" ADD CONSTRAINT "lms_prompt_submissions_assigned_by_id_fkey" FOREIGN KEY ("assigned_by_id") REFERENCES "lms_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lms_prompt_submissions" ADD CONSTRAINT "lms_prompt_submissions_reviewed_by_id_fkey" FOREIGN KEY ("reviewed_by_id") REFERENCES "lms_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lms_use_cases" ADD CONSTRAINT "lms_use_cases_level_id_fkey" FOREIGN KEY ("level_id") REFERENCES "lms_levels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lms_use_case_submissions" ADD CONSTRAINT "lms_use_case_submissions_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "lms_members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lms_use_case_submissions" ADD CONSTRAINT "lms_use_case_submissions_use_case_id_fkey" FOREIGN KEY ("use_case_id") REFERENCES "lms_use_cases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lms_use_case_submissions" ADD CONSTRAINT "lms_use_case_submissions_assigned_by_id_fkey" FOREIGN KEY ("assigned_by_id") REFERENCES "lms_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lms_use_case_submissions" ADD CONSTRAINT "lms_use_case_submissions_reviewed_by_id_fkey" FOREIGN KEY ("reviewed_by_id") REFERENCES "lms_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lms_prompt_categories" ADD CONSTRAINT "lms_prompt_categories_prompt_id_fkey" FOREIGN KEY ("prompt_id") REFERENCES "lms_prompts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lms_prompt_categories" ADD CONSTRAINT "lms_prompt_categories_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "lms_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lms_use_case_categories" ADD CONSTRAINT "lms_use_case_categories_use_case_id_fkey" FOREIGN KEY ("use_case_id") REFERENCES "lms_use_cases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lms_use_case_categories" ADD CONSTRAINT "lms_use_case_categories_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "lms_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lms_quiz_submissions" ADD CONSTRAINT "lms_quiz_submissions_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "lms_members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lms_quiz_submissions" ADD CONSTRAINT "lms_quiz_submissions_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "lms_quizzes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lms_video_completions" ADD CONSTRAINT "lms_video_completions_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "lms_members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lms_video_completions" ADD CONSTRAINT "lms_video_completions_video_id_fkey" FOREIGN KEY ("video_id") REFERENCES "lms_videos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lms_material_completions" ADD CONSTRAINT "lms_material_completions_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "lms_members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lms_material_completions" ADD CONSTRAINT "lms_material_completions_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "lms_materials"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lms_xp_earnings" ADD CONSTRAINT "lms_xp_earnings_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "lms_members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lms_pre_assessments" ADD CONSTRAINT "lms_pre_assessments_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "lms_members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lms_pre_assessment_reports" ADD CONSTRAINT "lms_pre_assessment_reports_pre_assessment_id_fkey" FOREIGN KEY ("pre_assessment_id") REFERENCES "lms_pre_assessments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
