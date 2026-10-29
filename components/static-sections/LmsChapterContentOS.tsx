"use client";

import type { LmsChapterAnalytics, LmsContent } from "@/apis/lms";
import AppButton from "@/components/buttons/AppButton";
import FileTypeIconOS, {
  fileTypeFromUrl,
} from "@/components/elements/FileTypeIconOS";
import LmsMaterialFormOS from "@/components/forms/LmsMaterialFormOS";
import LmsVideoFormOS from "@/components/forms/LmsVideoFormOS";
import LmsContentStatusLabel from "@/components/labels/LmsContentStatusLabel";
import { videoEmbed } from "@/lib/video-embed";
import {
  ArrowUpRight,
  ClipboardCheck,
  ClipboardList,
  ExternalLink,
  FileText,
  LockKeyhole,
  Pencil,
  PlayCircle,
  Plus,
} from "lucide-react";
import { useState, type ReactNode } from "react";

function VideoPlayer({ url, title }: { url: string; title: string }) {
  const embed = videoEmbed(url);
  if (embed?.kind === "iframe") {
    return (
      <iframe
        src={embed.src}
        title={title}
        className="aspect-video w-full rounded-xl border-0 bg-black"
        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
    );
  }
  if (embed?.kind === "file") {
    return (
      <video
        src={embed.src}
        controls
        className="aspect-video w-full rounded-xl bg-black"
      />
    );
  }
  return (
    <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-xl bg-gray-100 text-center dark:bg-zinc-800">
      <PlayCircle size={28} className="text-gray-400" />
      <p className="text-xs text-gray-500 dark:text-zinc-400">
        This link cannot be previewed here.
      </p>
      <AppButton variant="outline" size="sm" href={url}>
        <ExternalLink size={13} /> Open video
      </AppButton>
    </div>
  );
}

function MaterialFileRow({ material }: { material: LmsContent }) {
  const type = fileTypeFromUrl(material.file_url);
  return (
    <>
      <FileTypeIconOS type={type} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-gray-900 dark:text-zinc-100">
          {material.title}
        </span>
        <span className="text-xs text-gray-500 dark:text-zinc-400">
          {type === "TEXT"
            ? "Reading only"
            : type === "LINK"
              ? "Linked document"
              : `${type} document`}
        </span>
      </span>
    </>
  );
}

function SectionHeader({
  title,
  status,
  action,
}: {
  title: string;
  status?: LmsContent["status"];
  action: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2.5">
        <h2 className="truncate text-sm font-semibold text-gray-900 dark:text-zinc-100">
          {title}
        </h2>
        {status === "inactive" && <LmsContentStatusLabel status={status} />}
      </div>
      {action}
    </div>
  );
}

function TestGateway({
  href,
  label,
  icon: Icon,
  test,
  submitted,
  averageScore,
  members,
}: {
  href: string;
  label: string;
  icon: typeof FileText;
  test: LmsContent | undefined;
  submitted: number;
  averageScore: number | null;
  members: number;
}) {
  return (
    <AppButton
      variant="bare"
      size="bare"
      href={href}
      className="group flex-col items-stretch rounded-2xl border border-line bg-card-bg p-4 text-left transition-colors hover:border-claude sm:p-5"
    >
      <span className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-gray-50 text-gray-600 dark:bg-zinc-800 dark:text-zinc-300">
            <Icon size={16} />
          </span>
          <span className="text-sm font-semibold text-gray-900 dark:text-zinc-100">
            {label}
          </span>
        </span>
        <ArrowUpRight
          size={18}
          className="text-gray-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-gray-700 dark:group-hover:text-zinc-200"
        />
      </span>
      {test ? (
        <>
          <span className="mt-4 flex flex-wrap items-center gap-2">
            <span className="truncate text-xs text-gray-700 dark:text-zinc-300">
              {test.title}
            </span>
            {test.status === "inactive" && (
              <LmsContentStatusLabel status={test.status} />
            )}
            {test.is_locked && (
              <span className="flex items-center gap-1 text-xs text-merah">
                <LockKeyhole size={12} /> Locked
              </span>
            )}
          </span>
          <span className="mt-4 grid grid-cols-3 gap-3 border-t border-line-soft pt-4">
            <span>
              <span className="block font-heading text-xl tabular-nums text-gray-900 dark:text-zinc-100">
                {test.questions.length}
              </span>
              <span className="text-xs text-gray-500 dark:text-zinc-400">
                Questions
              </span>
            </span>
            <span>
              <span className="block font-heading text-xl tabular-nums text-gray-900 dark:text-zinc-100">
                {submitted}
                <span className="text-xs text-gray-400 dark:text-zinc-500">
                  /{members}
                </span>
              </span>
              <span className="text-xs text-gray-500 dark:text-zinc-400">
                Submitted
              </span>
            </span>
            <span>
              <span className="block font-heading text-xl tabular-nums text-gray-900 dark:text-zinc-100">
                {averageScore?.toFixed(1) ?? "—"}
              </span>
              <span className="text-xs text-gray-500 dark:text-zinc-400">
                Avg. score
              </span>
            </span>
          </span>
        </>
      ) : (
        <span className="mt-4 flex items-center gap-2 rounded-xl border border-dashed border-line px-4 py-6 text-xs text-gray-500 dark:text-zinc-400">
          <Plus size={14} /> Create the {label.toLowerCase()}
        </span>
      )}
    </AppButton>
  );
}

export default function LmsChapterContentOS({
  projectId,
  chapterId,
  contents,
  analytics,
  isPending,
  error,
  onRetry,
  onChanged,
}: {
  projectId: string;
  chapterId: number;
  contents: LmsContent[];
  analytics: LmsChapterAnalytics | undefined;
  isPending: boolean;
  error: Error | null;
  onRetry: () => void;
  onChanged: () => Promise<void>;
}) {
  const [sheet, setSheet] = useState<"video" | "material" | null>(null);
  const find = (kind: LmsContent["kind"]) =>
    contents.find((item) => item.kind === kind);
  const video = find("video");
  const material = find("material");
  const testsHref = `/lms/${projectId}/chapters/${chapterId}/tests`;
  const members = analytics?.member_count ?? 0;

  if (isPending) {
    return (
      <p className="rounded-2xl border border-line bg-card-bg px-4 py-12 text-center text-xs text-gray-500 dark:text-zinc-400 sm:px-5">
        Loading content...
      </p>
    );
  }
  if (error) {
    return (
      <div className="rounded-2xl border border-line bg-card-bg px-4 py-10 text-center sm:px-5">
        <p className="text-xs text-merah">{error.message}</p>
        <AppButton
          variant="outline"
          size="sm"
          className="mt-3"
          onClick={onRetry}
        >
          Try again
        </AppButton>
      </div>
    );
  }

  return (
    <>
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <section className="flex flex-col gap-4 rounded-2xl border border-line bg-card-bg p-4 sm:p-5">
          <SectionHeader
            title="Video"
            status={video?.status}
            action={
              <AppButton
                variant="outline"
                size="sm"
                onClick={() => setSheet("video")}
              >
                {video ? <Pencil size={13} /> : <Plus size={13} />}
                {video ? "Edit" : "Add video"}
              </AppButton>
            }
          />
          {video?.video_url ? (
            <>
              <VideoPlayer url={video.video_url} title={video.title} />
              {video.timestamps.length > 0 && (
                <ul className="flex flex-wrap gap-1.5">
                  {video.timestamps.map((marker) => (
                    <li
                      key={marker.start_seconds}
                      className="rounded-full border border-line px-2.5 py-1 text-xs text-gray-600 dark:text-zinc-300"
                    >
                      <span className="tabular-nums text-gray-400 dark:text-zinc-500">
                        {Math.floor(marker.start_seconds / 60)}:
                        {String(marker.start_seconds % 60).padStart(2, "0")}
                      </span>{" "}
                      {marker.title}
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <AppButton
              variant="bare"
              size="bare"
              onClick={() => setSheet("video")}
              className="aspect-video w-full flex-col justify-center gap-2 rounded-xl border border-dashed border-line text-xs text-gray-500 hover:border-claude dark:text-zinc-400"
            >
              <PlayCircle size={28} className="text-gray-400" />
              Add the lesson video
            </AppButton>
          )}
        </section>

        <div className="flex min-w-0 flex-col gap-5">
          <section className="flex flex-col gap-4 rounded-2xl border border-line bg-card-bg p-4 sm:p-5">
            <SectionHeader
              title="Material"
              status={material?.status}
              action={
                <AppButton
                  variant="outline"
                  size="sm"
                  onClick={() => setSheet("material")}
                >
                  {material ? <Pencil size={13} /> : <Plus size={13} />}
                  {material ? "Edit" : "Add material"}
                </AppButton>
              }
            />
            {material ? (
              <div className="flex flex-col gap-3">
                {material.file_url ? (
                  <AppButton
                    variant="bare"
                    size="bare"
                    href={material.file_url}
                    className="w-full gap-3 rounded-xl bg-gray-50 p-2 pr-4 text-left transition-colors hover:bg-gray-100 dark:bg-zinc-800/50 dark:hover:bg-zinc-800"
                  >
                    <MaterialFileRow material={material} />
                    <ExternalLink size={15} className="shrink-0 text-gray-400" />
                  </AppButton>
                ) : (
                  <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-2 pr-4 dark:bg-zinc-800/50">
                    <MaterialFileRow material={material} />
                  </div>
                )}
              </div>
            ) : (
              <AppButton
                variant="bare"
                size="bare"
                onClick={() => setSheet("material")}
                className="w-full justify-start rounded-xl border border-dashed border-line px-4 py-8 text-xs text-gray-500 hover:border-claude dark:text-zinc-400"
              >
                Write the chapter reading
              </AppButton>
            )}
          </section>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-1">
            <TestGateway
              href={`${testsHref}/pre-test`}
              label="Pre-test"
              icon={ClipboardList}
              test={find("pre_test")}
              submitted={analytics?.pre_test.submitted ?? 0}
              averageScore={analytics?.pre_test.average_score ?? null}
              members={members}
            />
            <TestGateway
              href={`${testsHref}/post-test`}
              label="Post-test"
              icon={ClipboardCheck}
              test={find("post_test")}
              submitted={analytics?.post_test.submitted ?? 0}
              averageScore={analytics?.post_test.average_score ?? null}
              members={members}
            />
          </div>
        </div>
      </div>

      {sheet === "video" && (
        <LmsVideoFormOS
          projectId={projectId}
          chapterId={chapterId}
          video={video ?? null}
          onClose={() => setSheet(null)}
          onSaved={onChanged}
        />
      )}
      {sheet === "material" && (
        <LmsMaterialFormOS
          projectId={projectId}
          chapterId={chapterId}
          material={material ?? null}
          onClose={() => setSheet(null)}
          onSaved={onChanged}
        />
      )}
    </>
  );
}
