"use client";

import AppButton from "@/components/buttons/AppButton";
import Label, { type LabelVariant } from "@/components/labels/Label";
import TrainerLevelLabel from "@/components/labels/TrainerLevelLabel";
import TrainerStageLabel from "@/components/labels/TrainerStageLabel";
import { trpc } from "@/trpc/client";
import type { LmsChapterTrainerRequestStatusEnum } from "@prisma/client";
import { CircleUserRound, X } from "lucide-react";
import Image from "next/image";
import { useEffect } from "react";

export type LmsChapterTrainerPoolTarget = { id: number; name: string } | null;

const statusConfig: Record<
  LmsChapterTrainerRequestStatusEnum,
  { label: string; variant: LabelVariant }
> = {
  PENDING: { label: "Pending", variant: "kuning" },
  SELECTED: { label: "Selected", variant: "hijau" },
  REJECTED: { label: "Rejected", variant: "merah" },
};

export default function LmsChapterTrainerPoolModalOS({
  chapter,
  onClose,
}: {
  chapter: LmsChapterTrainerPoolTarget;
  onClose: () => void;
}) {
  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.list.lms.chapterTrainerRequests.useQuery(
    { chapter_id: chapter?.id ?? 0, page: 1, page_size: 100 },
    { enabled: !!chapter }
  );
  const selectMutation = trpc.update.lms.selectChapterTrainer.useMutation({
    onSuccess: () => {
      utils.list.lms.chapterTrainerRequests.invalidate({
        chapter_id: chapter?.id,
      });
      utils.list.lms.chapters.invalidate();
    },
  });

  useEffect(() => {
    if (!chapter) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [chapter]);

  if (!chapter) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 py-6"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-gray-300 bg-card-bg shadow-xl dark:border-zinc-700"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-6 py-5 dark:border-zinc-800">
          <div className="min-w-0">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-claude">
              Trainer Pool
            </p>
            <h2 className="truncate text-lg font-bold text-gray-900 dark:text-zinc-100">
              {chapter.name}
            </h2>
          </div>
          <AppButton
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={16} />
          </AppButton>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {selectMutation.error && (
            <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-950/40 dark:text-red-400">
              {selectMutation.error.message}
            </p>
          )}
          {isLoading && (
            <p className="py-8 text-center text-sm text-gray-400">
              Loading applicants...
            </p>
          )}
          <div className="flex flex-col gap-3">
            {data?.list.map((entry) => (
              <div
                key={entry.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 p-3 dark:border-zinc-800"
              >
                <div className="flex min-w-0 items-center gap-3">
                  {entry.trainer_avatar ? (
                    <Image
                      src={entry.trainer_avatar}
                      alt={entry.trainer_name}
                      width={32}
                      height={32}
                      className="size-8 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-claude text-white">
                      <CircleUserRound size={18} fill="currentColor" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-gray-900 dark:text-zinc-100">
                      {entry.trainer_name}
                    </p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                      <TrainerLevelLabel level={entry.trainer_level} />
                      <TrainerStageLabel stage={entry.trainer_stage} />
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Label variant={statusConfig[entry.status].variant}>
                    {statusConfig[entry.status].label}
                  </Label>
                  {entry.status === "PENDING" && (
                    <AppButton
                      size="sm"
                      onClick={() =>
                        selectMutation.mutate({ request_id: entry.id })
                      }
                      disabled={selectMutation.isPending}
                    >
                      Select
                    </AppButton>
                  )}
                </div>
              </div>
            ))}
            {data && data.list.length === 0 && (
              <p className="py-8 text-center text-sm text-gray-400">
                No applicants yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
