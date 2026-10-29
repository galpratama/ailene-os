import type { LmsSurveyResponse } from "@/apis/lms";
import TaskAssigneeAvatarOS from "@/components/elements/TaskAssigneeAvatarOS";
import { MessageSquareText, Star } from "lucide-react";

const answers: { key: keyof LmsSurveyResponse; label: string }[] = [
  { key: "favorite_material", label: "Favorite part" },
  { key: "missing_topics", label: "Missing topics" },
  { key: "disliked_material", label: "Least liked" },
  { key: "improvement_suggestion", label: "Suggestion" },
];

function submittedDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  }).format(new Date(value));
}

export default function LmsChapterFeedbackOS({ responses }: { responses: LmsSurveyResponse[] }) {
  const written = responses.filter((response) => answers.some(({ key }) => response[key]));

  return (
    <section className="overflow-hidden rounded-2xl border border-line bg-card-bg">
      <div className="border-b border-line-soft px-5 py-4 sm:px-6">
        <h2 className="text-base font-semibold text-gray-900 dark:text-zinc-100">Written feedback</h2>
        <p className="mt-0.5 text-xs text-gray-500 dark:text-zinc-400">
          {written.length} of {responses.length} survey responses include comments, newest first.
        </p>
      </div>
      {written.length === 0 ? (
        <div className="px-6 py-10 text-center">
          <MessageSquareText size={22} className="mx-auto text-gray-400" />
          <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">No written feedback yet.</p>
        </div>
      ) : (
        <ul className="grid gap-3 p-4 sm:p-5 lg:grid-cols-2">
          {written.map((response) => (
            <li key={response.access_id} className="rounded-xl border border-line bg-gray-50 p-4 dark:bg-zinc-800/50">
              <div className="flex items-center gap-2.5">
                <TaskAssigneeAvatarOS name={response.full_name} avatar={response.avatar} size="base" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-gray-900 dark:text-zinc-100">{response.full_name}</p>
                  <p className="text-xs text-gray-500 dark:text-zinc-400">{submittedDate(response.submitted_at)} WIB</p>
                </div>
                <span className="flex shrink-0 items-center gap-1 rounded-full border border-line bg-card-bg px-2 py-0.5 text-xs font-semibold tabular-nums text-gray-900 dark:text-zinc-100">
                  <Star size={11} className="fill-oranye text-oranye" />
                  {response.average.toFixed(1)}
                </span>
              </div>
              <dl className="mt-3 flex flex-col gap-2.5">
                {answers.map(({ key, label }) =>
                  response[key] ? (
                    <div key={key}>
                      <dt className="text-xs font-medium text-gray-500 dark:text-zinc-400">{label}</dt>
                      <dd className="mt-0.5 whitespace-pre-line text-sm text-gray-800 dark:text-zinc-200">{response[key]}</dd>
                    </div>
                  ) : null,
                )}
              </dl>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
