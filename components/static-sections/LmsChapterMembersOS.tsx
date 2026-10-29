import type { LmsChapterAnalytics } from "@/apis/lms";
import InfoTooltipOS from "@/components/elements/InfoTooltipOS";
import TaskAssigneeAvatarOS from "@/components/elements/TaskAssigneeAvatarOS";
import LmsMemberRoleLabel from "@/components/labels/LmsMemberRoleLabel";
import { Check, Minus, Star } from "lucide-react";

function Score({
  submitted,
  score,
}: {
  submitted: boolean;
  score: number | null;
}) {
  if (!submitted)
    return <span className="text-gray-400 dark:text-zinc-500">—</span>;
  return (
    <span className="font-semibold tabular-nums text-gray-900 dark:text-zinc-100">
      {score === null ? "Sent" : score}
    </span>
  );
}

function Done({ done, label }: { done: boolean; label: string }) {
  return done ? (
    <Check
      size={15}
      className="mx-auto text-hijau"
      aria-label={`${label} done`}
    />
  ) : (
    <Minus
      size={15}
      className="mx-auto text-gray-300 dark:text-zinc-600"
      aria-label={`${label} not done`}
    />
  );
}

export default function LmsChapterMembersOS({
  analytics,
}: {
  analytics: LmsChapterAnalytics;
}) {
  const { members } = analytics;

  return (
    <section className="overflow-hidden rounded-2xl border border-line bg-card-bg">
      <div className="border-b border-line-soft px-5 py-4 sm:px-6">
        <h2 className="flex items-center gap-1 text-sm font-semibold text-gray-900 dark:text-zinc-100">
          Participant progress
          <InfoTooltipOS
            label="Participant progress"
            explanation="Every non-sponsor member with a session for this chapter, with their test scores, completed content, tasks, and feedback."
          />
        </h2>
      </div>
      {members.length === 0 ? (
        <p className="px-6 py-10 text-center text-xs text-gray-500 dark:text-zinc-400">
          Nobody is scheduled yet. Add a session for a group to bring its
          members in.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-200 text-left text-xs">
            <thead>
              <tr className="border-b border-line-soft text-xs font-medium text-gray-400 dark:text-zinc-500">
                <th className="px-5 py-3 sm:px-6">Participant</th>
                <th className="px-3 py-3">Group</th>
                <th className="px-3 py-3 text-center">Pre-test</th>
                <th className="px-3 py-3 text-center">Post-test</th>
                <th className="px-3 py-3 text-center">Uplift</th>
                {analytics.video.exists && (
                  <th className="px-3 py-3 text-center">Video</th>
                )}
                {analytics.material.exists && (
                  <th className="px-3 py-3 text-center">Material</th>
                )}
                {analytics.tasks.total > 0 && (
                  <th className="px-3 py-3 text-center">Tasks</th>
                )}
                <th className="px-5 py-3 text-center sm:px-6">Feedback</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line-soft">
              {members.map((member) => {
                const uplift =
                  member.pre_test_score !== null &&
                  member.post_test_score !== null
                    ? member.post_test_score - member.pre_test_score
                    : null;
                return (
                  <tr
                    key={member.access_id}
                    className="hover:bg-gray-50/70 dark:hover:bg-zinc-800/40"
                  >
                    <td className="px-5 py-3 sm:px-6">
                      <div className="flex min-w-0 items-center gap-3">
                        <TaskAssigneeAvatarOS
                          name={member.full_name}
                          avatar={member.avatar}
                          size="base"
                        />
                        <div className="min-w-0">
                          <p className="flex items-center gap-2 truncate font-semibold text-gray-900 dark:text-zinc-100">
                            {member.full_name}
                            {member.role === "champion" && (
                              <LmsMemberRoleLabel role={member.role} />
                            )}
                          </p>
                          <p className="truncate text-xs text-gray-500 dark:text-zinc-400">
                            {member.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-xs text-gray-600 dark:text-zinc-300">
                      {member.group_name}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <Score
                        submitted={member.pre_test_submitted}
                        score={member.pre_test_score}
                      />
                    </td>
                    <td className="px-3 py-3 text-center">
                      <Score
                        submitted={member.post_test_submitted}
                        score={member.post_test_score}
                      />
                    </td>
                    <td className="px-3 py-3 text-center tabular-nums">
                      {uplift === null ? (
                        <span className="text-gray-400 dark:text-zinc-500">
                          —
                        </span>
                      ) : (
                        <span
                          className={`font-semibold ${uplift >= 0 ? "text-hijau" : "text-merah"}`}
                        >
                          {uplift >= 0 ? "+" : ""}
                          {uplift}
                        </span>
                      )}
                    </td>
                    {analytics.video.exists && (
                      <td className="px-3 py-3">
                        <Done done={member.video_completed} label="Video" />
                      </td>
                    )}
                    {analytics.material.exists && (
                      <td className="px-3 py-3">
                        <Done
                          done={member.material_completed}
                          label="Material"
                        />
                      </td>
                    )}
                    {analytics.tasks.total > 0 && (
                      <td className="px-3 py-3 text-center text-xs tabular-nums text-gray-600 dark:text-zinc-300">
                        {member.tasks_approved}/{analytics.tasks.total}
                      </td>
                    )}
                    <td className="px-5 py-3 text-center sm:px-6">
                      {member.survey_average === null ? (
                        <span className="text-gray-400 dark:text-zinc-500">
                          —
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-semibold tabular-nums text-gray-900 dark:text-zinc-100">
                          <Star size={12} className="fill-rating text-rating" />
                          {member.survey_average.toFixed(1)}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
