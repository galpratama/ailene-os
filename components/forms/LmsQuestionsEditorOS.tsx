"use client";

import type { LmsQuestion } from "@/apis/lms";
import AppButton from "@/components/buttons/AppButton";
import AppInput from "@/components/fields/AppInput";
import AppSelect from "@/components/fields/AppSelect";
import AppTextarea from "@/components/fields/AppTextArea";
import { lmsQuestionError, newLmsQuestion } from "@/lib/lms-curriculum";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";

export default function LmsQuestionsEditorOS({
  value,
  onChange,
  quiz,
  showErrors,
}: {
  value: LmsQuestion[];
  onChange: (questions: LmsQuestion[]) => void;
  quiz: boolean;
  showErrors: boolean;
}) {
  function update(index: number, question: LmsQuestion) {
    onChange(value.map((item, i) => (i === index ? question : item)));
  }
  function move(index: number, step: number) {
    const next = [...value];
    [next[index], next[index + step]] = [next[index + step], next[index]];
    onChange(next);
  }
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold">Questions ({value.length})</h3>
        <span className="text-xs text-gray-500 dark:text-zinc-400">
          {quiz ? "Multiple choice" : "Multiple choice or essay"}
        </span>
      </div>
      {value.length === 0 && (
        <p className="rounded-xl border border-dashed border-line px-5 py-8 text-center text-sm text-gray-500 dark:text-zinc-400">
          Add the first question to get started.
        </p>
      )}
      {showErrors && value.length === 0 && (
        <p className="text-xs text-merah" role="alert">
          Add at least one question.
        </p>
      )}
      {value.map((question, index) => {
        const prefix = `lms-question-${index}`;
        const error = showErrors ? lmsQuestionError(question) : null;
        return (
          <fieldset
            key={index}
            className="min-w-0 rounded-xl border border-line p-4 sm:p-5"
          >
            <legend className="px-1 text-xs font-semibold text-gray-500 dark:text-zinc-400">
              Question {index + 1}
            </legend>
            <div className="mb-4 flex items-center justify-between gap-2">
              {!quiz ? (
                <AppSelect
                  selectId={`${prefix}-type`}
                  className="max-w-48"
                  placeholder="Question type"
                  value={question.type}
                  options={[
                    { value: "multiple_choice", label: "Multiple choice" },
                    { value: "essay", label: "Essay" },
                  ]}
                  onChange={(type) =>
                    update(index, {
                      ...question,
                      type: type as LmsQuestion["type"],
                      options: type === "essay" ? [] : newLmsQuestion().options,
                    })
                  }
                />
              ) : (
                <span className="text-xs text-gray-500 dark:text-zinc-400">
                  Choose one correct answer
                </span>
              )}
              <div className="flex gap-1">
                <AppButton
                  type="button"
                  variant="secondary"
                  size="iconSm"
                  aria-label={`Move question ${index + 1} up`}
                  disabled={index === 0}
                  onClick={() => move(index, -1)}
                >
                  <ArrowUp size={14} />
                </AppButton>
                <AppButton
                  type="button"
                  variant="secondary"
                  size="iconSm"
                  aria-label={`Move question ${index + 1} down`}
                  disabled={index === value.length - 1}
                  onClick={() => move(index, 1)}
                >
                  <ArrowDown size={14} />
                </AppButton>
                <AppButton
                  type="button"
                  variant="dangerGhost"
                  size="iconSm"
                  aria-label={`Remove question ${index + 1}`}
                  onClick={() => onChange(value.filter((_, i) => i !== index))}
                >
                  <Trash2 size={14} />
                </AppButton>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <AppTextarea
                textAreaId={`${prefix}-text`}
                label="Question"
                placeholder="What would you like to ask?"
                required
                rows={3}
                characterLength={20000}
                value={question.question}
                onChange={(event) =>
                  update(index, { ...question, question: event.target.value })
                }
              />
              {question.type === "multiple_choice" && (
                <div className="flex flex-col gap-2">
                  <p className="text-xs text-gray-500 dark:text-zinc-400">
                    Select the circle next to the correct answer.
                  </p>
                  {question.options.map((option, optionIndex) => (
                    <div
                      key={option.option_code}
                      className="flex items-center gap-2"
                    >
                      <input
                        type="radio"
                        className="size-4 shrink-0 accent-claude"
                        name={`${prefix}-correct`}
                        aria-label={`Mark answer ${option.option_code} correct`}
                        checked={option.is_correct}
                        onChange={() =>
                          update(index, {
                            ...question,
                            options: question.options.map((item, i) => ({
                              ...item,
                              is_correct: i === optionIndex,
                            })),
                          })
                        }
                      />
                      <span className="w-4 text-xs text-gray-500 dark:text-zinc-400">
                        {option.option_code}
                      </span>
                      <AppInput
                        inputId={`${prefix}-option-${optionIndex}`}
                        containerClassName="flex-1"
                        aria-label={`Answer ${option.option_code}`}
                        required
                        maxLength={10000}
                        placeholder={`Answer ${option.option_code}`}
                        value={option.text}
                        onChange={(event) =>
                          update(index, {
                            ...question,
                            options: question.options.map((item, i) =>
                              i === optionIndex
                                ? { ...item, text: event.target.value }
                                : item,
                            ),
                          })
                        }
                      />
                      <AppButton
                        type="button"
                        size="iconSm"
                        variant="secondary"
                        disabled={question.options.length <= 2}
                        aria-label={`Remove answer ${option.option_code}`}
                        onClick={() =>
                          update(index, {
                            ...question,
                            options: question.options
                              .filter((_, i) => i !== optionIndex)
                              .map((item, i) => ({
                                ...item,
                                option_code: String.fromCharCode(65 + i),
                              })),
                          })
                        }
                      >
                        <Trash2 size={13} />
                      </AppButton>
                    </div>
                  ))}
                  <AppButton
                    type="button"
                    variant="textLink"
                    size="textLink"
                    className="self-start"
                    disabled={question.options.length >= 26}
                    onClick={() =>
                      update(index, {
                        ...question,
                        options: [
                          ...question.options,
                          {
                            option_code: String.fromCharCode(
                              65 + question.options.length,
                            ),
                            text: "",
                            is_correct: false,
                          },
                        ],
                      })
                    }
                  >
                    <Plus size={13} />
                    Add answer option
                  </AppButton>
                </div>
              )}
              <AppTextarea
                textAreaId={`${prefix}-explanation`}
                label="Explanation (optional)"
                rows={2}
                characterLength={20000}
                placeholder="Explain the answer or add guidance for review."
                value={question.explanation ?? ""}
                onChange={(event) =>
                  update(index, {
                    ...question,
                    explanation: event.target.value,
                  })
                }
              />
              {quiz && (
                <AppInput
                  inputId={`${prefix}-xp`}
                  label="XP for a correct answer"
                  type="number"
                  min={0}
                  max={32767}
                  required
                  value={question.xp_reward}
                  onChange={(event) =>
                    update(index, {
                      ...question,
                      xp_reward: Number(event.target.value),
                    })
                  }
                />
              )}
              {error && (
                <p className="text-xs text-merah" role="alert">
                  {error}
                </p>
              )}
            </div>
          </fieldset>
        );
      })}
      <AppButton
        type="button"
        variant="outlineDashed"
        size="dashed"
        disabled={value.length >= 200}
        onClick={() => onChange([...value, newLmsQuestion()])}
      >
        <Plus size={14} />
        Add question
      </AppButton>
    </section>
  );
}
