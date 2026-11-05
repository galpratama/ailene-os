"use client";

import type { LmsChapterSessionsEntry, LmsProjectEntry } from "@/apis/lms";
import AppButton from "@/components/buttons/AppButton";
import AppSelect from "@/components/fields/AppSelect";
import LmsContentFormOS from "@/components/forms/LmsContentFormOS";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LmsProjectTestCreateOS({
  project,
  chapters,
}: {
  project: LmsProjectEntry;
  chapters: LmsChapterSessionsEntry[];
}) {
  const router = useRouter();
  const client = useQueryClient();
  const [kind, setKind] = useState<"pre_test" | "post_test">("pre_test");
  const [dirty, setDirty] = useState(false);
  const backHref = `/lms/${project.id}?tab=test`;

  return (
    <div className="flex flex-col gap-5 px-4 py-6 sm:px-8">
      <div><AppButton variant="secondary" size="sm" href={backHref}><ArrowLeft size={14} /> All tests</AppButton></div>
      <header className="rounded-2xl bg-zinc-900 px-5 py-6 text-white dark:bg-zinc-800 sm:px-7">
        <p className="text-xs text-white/55">{project.name}</p>
        <h1 className="mt-1 text-xl font-bold sm:text-2xl">Add test</h1>
      </header>
      <section className="overflow-hidden rounded-2xl border border-line bg-card-bg">
        <div className="border-b border-line-soft px-5 py-5 sm:px-7">
          <AppSelect
            selectId="lms-project-test-kind"
            label="Test type"
            placeholder="Select test type"
            value={kind}
            disabled={dirty}
            onChange={(value) => setKind(value === "post_test" ? "post_test" : "pre_test")}
            options={[{ value: "pre_test", label: "Pre-test" }, { value: "post_test", label: "Post-test" }]}
          />
        </div>
        <LmsContentFormOS
          key={kind}
          projectId={project.id}
          chapterId={null}
          chapters={chapters}
          kind={kind}
          onDirtyChange={setDirty}
          onDelete={() => {}}
          onSaved={async (chapterId) => {
            await Promise.all([
              client.invalidateQueries({ queryKey: ["lms-project-content", project.id] }),
              client.invalidateQueries({ queryKey: ["lms-chapter-contents", chapterId] }),
              client.invalidateQueries({ queryKey: ["lms-chapter-analytics", project.id, chapterId] }),
              client.invalidateQueries({ queryKey: ["lms-chapter-sessions", project.id] }),
            ]);
            router.replace(backHref);
          }}
        />
      </section>
    </div>
  );
}
