import "server-only";

import type { ApiEnvelope } from "@/apis/api";
import { appendSheetRows } from "@/apis/google-sheets";
import {
  STATUS_BAD_REQUEST,
  STATUS_INTERNAL_SERVER_ERROR,
  STATUS_OK,
} from "@/lib/status_code";
import {
  formatTrilogyAnswer,
  isTrilogyAnswerComplete,
  isValidEmail,
  normalizeTrilogyAnswers,
  TRILOGY_SURVEY_IDENTITY_MAX,
  TRILOGY_SURVEY_QUESTIONS,
  type TrilogySurveyAnswers,
  type TrilogySurveyIdentity,
} from "@/lib/trilogy-survey";

// Target spreadsheet, hardcoded on request. The ID is the part between /d/ and /edit in its URL.
const TRILOGY_SURVEY_SPREADSHEET_ID = "1QadMh1RtoYcvd_soCmwL0o1hjSlWHMGAS7fYBgL686s";
const TRILOGY_SURVEY_SHEET_NAME = "Sheet1";

// Proficiency check items and their correct option; kept server-side so the key never ships to the browser.
const PROFICIENCY_KEY: Record<string, string> = {
  refine_output: "iterate",
  best_prompt: "d",
  verify_facts: "verify",
  data_safety: "public",
  hallucination: "fabricate",
};

export type TrilogySurveyPayload = {
  identity: TrilogySurveyIdentity;
  answers: TrilogySurveyAnswers;
  // Honeypot: hidden from people, so a filled value means a bot.
  website?: string;
};

function readIdentity(raw: unknown): TrilogySurveyIdentity | null {
  if (!raw || typeof raw !== "object") return null;
  const { name, email, job_title } = raw as Record<string, unknown>;
  if (typeof name !== "string" || typeof email !== "string" || typeof job_title !== "string") {
    return null;
  }
  const identity = {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    job_title: job_title.trim(),
  };
  const fits = Object.values(identity).every(
    (value) => value.length > 0 && value.length <= TRILOGY_SURVEY_IDENTITY_MAX
  );
  return fits && isValidEmail(identity.email) ? identity : null;
}

function proficiencyBand(score: number): string {
  if (score >= 5) return "Mahir";
  if (score >= 3) return "Menengah";
  return "Pemula";
}

function jakartaTimestamp() {
  // "sv-SE" renders as YYYY-MM-DD HH:mm:ss, which Sheets sorts correctly.
  return new Date().toLocaleString("sv-SE", { timeZone: "Asia/Jakarta" });
}

// Public form with no session, so every field is re-checked here before it reaches the sheet.
export async function submitTrilogySurvey(
  payload: TrilogySurveyPayload
): Promise<ApiEnvelope<{ submitted: true }>> {
  if (payload?.website) {
    return { status: STATUS_OK, data: { submitted: true } };
  }

  const identity = readIdentity(payload?.identity);
  if (!identity) {
    return {
      status: STATUS_BAD_REQUEST,
      message: "Nama, email yang valid, dan job title wajib diisi.",
    };
  }
  const answers = normalizeTrilogyAnswers(payload?.answers);
  const complete = TRILOGY_SURVEY_QUESTIONS.every((question) =>
    isTrilogyAnswerComplete(question, answers[question.id])
  );
  if (!complete) {
    return {
      status: STATUS_BAD_REQUEST,
      message: "Masih ada pertanyaan wajib yang belum dijawab.",
    };
  }

  const score = Object.entries(PROFICIENCY_KEY).filter(
    ([id, correct]) => answers[id]?.choices[0] === correct
  ).length;
  const maxScore = Object.keys(PROFICIENCY_KEY).length;

  const header = [
    "Timestamp (WIB)",
    "Nama",
    "Email",
    "Job Title",
    ...TRILOGY_SURVEY_QUESTIONS.map((question, idx) => `${idx + 1}. ${question.title}`),
    `Skor Proficiency (0-${maxScore})`,
    "Band Proficiency",
  ];
  const row = [
    jakartaTimestamp(),
    identity.name,
    identity.email,
    identity.job_title,
    ...TRILOGY_SURVEY_QUESTIONS.map((question) =>
      formatTrilogyAnswer(question, answers[question.id])
    ),
    String(score),
    proficiencyBand(score),
  ];

  const saved = await appendSheetRows(
    TRILOGY_SURVEY_SPREADSHEET_ID,
    TRILOGY_SURVEY_SHEET_NAME,
    [row],
    header
  );
  if (!saved) {
    return {
      status: STATUS_INTERNAL_SERVER_ERROR,
      message: "Jawaban gagal disimpan. Coba kirim lagi sebentar lagi.",
    };
  }
  return { status: STATUS_OK, data: { submitted: true } };
}
