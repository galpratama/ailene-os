import type { LmsContentKind, LmsContentStatus, LmsQuestion } from "@/apis/lms";

export const lmsContentKinds: {
  kind: LmsContentKind;
  label: string;
  description: string;
}[] = [
  {
    kind: "pre_test",
    label: "Pre-test",
    description: "Measure participants' knowledge before the session.",
  },
  {
    kind: "material",
    label: "Material",
    description: "Write learning material and attach a supporting document.",
  },
  {
    kind: "video",
    label: "Video",
    description: "Add a lesson video and chapter markers.",
  },
  {
    kind: "quiz",
    label: "Quiz",
    description: "Reinforce learning with multiple-choice questions.",
  },
  {
    kind: "post_test",
    label: "Post-test",
    description: "Measure what participants learned after the session.",
  },
];

export const lmsStatusOptions: { value: LmsContentStatus; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

export function newLmsQuestion(): LmsQuestion {
  return {
    type: "multiple_choice",
    question: "",
    explanation: "",
    xp_reward: 0,
    options: [
      { option_code: "A", text: "", is_correct: true },
      { option_code: "B", text: "", is_correct: false },
    ],
  };
}

export function lmsQuestionError(question: LmsQuestion): string | null {
  if (!question.question.trim()) return "Enter the question.";
  if (question.type === "essay") return null;
  if (question.options.length < 2) return "Add at least two answer options.";
  if (question.options.some((option) => !option.text.trim()))
    return "Fill in every answer option.";
  if (question.options.filter((option) => option.is_correct).length !== 1)
    return "Choose one correct answer.";
  return null;
}
