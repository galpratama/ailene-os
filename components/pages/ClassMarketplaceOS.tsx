"use client";

import AppButton from "@/components/buttons/AppButton";
import PageHeaderOS from "@/components/navigations/PageHeaderOS";
import { setSessionToken, trpc } from "@/trpc/client";
import dayjs from "dayjs";
import "dayjs/locale/id";
import { Building2, Calendar, Check, Loader2, MapPin, Users } from "lucide-react";
import { useEffect, useState } from "react";

dayjs.locale("id");

const methodLabel: Record<"ONLINE" | "OFFLINE", string> = {
  ONLINE: "Online",
  OFFLINE: "Offline",
};

export default function ClassMarketplaceOS({
  sessionToken,
}: {
  sessionToken: string;
}) {
  useEffect(() => {
    if (sessionToken) setSessionToken(sessionToken);
  }, [sessionToken]);

  const { data, isLoading, isError } = trpc.list.lms.marketplaceChapters.useQuery(
    { page: 1, page_size: 100 },
    { enabled: !!sessionToken }
  );

  const [applyingId, setApplyingId] = useState<number | null>(null);
  const [submittedId, setSubmittedId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const utils = trpc.useUtils();
  const apply = trpc.create.lms.chapterTrainerRequest.useMutation({
    onSuccess: (_result, variables) => {
      setSubmittedId(variables.chapter_id);
      setApplyingId(null);
      setError(null);
      utils.list.lms.marketplaceChapters.invalidate();
    },
    onError: (mutationError) => {
      setApplyingId(null);
      setError(mutationError.message);
    },
  });

  function handleApply(chapterId: number) {
    setApplyingId(chapterId);
    setError(null);
    apply.mutate({ chapter_id: chapterId });
  }

  return (
    <div className="flex flex-col gap-5 px-4 py-6 sm:px-8">
      <PageHeaderOS
        title="Class Marketplace"
        description="Kelas aktif dari semua project LMS yang belum punya trainer — ajukan diri sebagai trainer untuk kelas yang sesuai."
      />

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-950/40 dark:text-red-400">
          {error}
        </p>
      )}

      {isLoading && (
        <p className="py-8 text-center text-sm text-gray-400">
          Loading classes...
        </p>
      )}
      {isError && (
        <p className="py-8 text-center text-sm text-red-500">
          Failed to load classes.
        </p>
      )}
      {data && !isLoading && !isError && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {data.list.map((chapter) => (
            <div
              key={chapter.id}
              className="flex h-full flex-col rounded-xl border border-gray-300 bg-card-bg p-5 dark:border-zinc-700"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-claude">
                  Level {chapter.level_number} · {chapter.level_name}
                </span>
                {chapter.session_number != null && (
                  <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-500 dark:bg-zinc-800 dark:text-zinc-400">
                    Sesi ke-{chapter.session_number}
                  </span>
                )}
              </div>
              <h3 className="mt-1 font-bold text-gray-900 dark:text-zinc-100">
                {chapter.name}
              </h3>
              {chapter.company_name && (
                <p className="mt-2 flex items-center gap-1.5 text-xs text-gray-500">
                  <Building2 size={13} />
                  {chapter.company_name}
                </p>
              )}
              <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
                <Calendar size={13} />
                {dayjs(chapter.session_date).format("dddd, D MMMM YYYY")}
              </p>
              <a
                href={chapter.location_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 flex items-center gap-1.5 text-xs text-claude hover:underline"
              >
                <MapPin size={13} />
                {methodLabel[chapter.method]} - {chapter.location_name}
              </a>
              {chapter.attendee_pax != null && (
                <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
                  <Users size={13} />
                  {chapter.attendee_pax} attendees
                </p>
              )}
              {chapter.description && (
                <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-gray-500">
                  {chapter.description}
                </p>
              )}
              <div className="mt-auto pt-4">
                {chapter.trainer_name ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-300 bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                    <Check size={13} /> Trainer: {chapter.trainer_name}
                  </span>
                ) : submittedId === chapter.id ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-hijau/40 bg-hijau-t px-3 py-1.5 text-xs font-semibold text-hijau dark:bg-green-950/40">
                    <Check size={13} /> Pengajuan terkirim
                  </span>
                ) : (
                  <AppButton
                    size="sm"
                    className="w-full justify-center"
                    onClick={() => handleApply(chapter.id)}
                    disabled={applyingId === chapter.id}
                  >
                    {applyingId === chapter.id && (
                      <Loader2 size={14} className="animate-spin" />
                    )}
                    Ajukan diri
                  </AppButton>
                )}
              </div>
            </div>
          ))}
          {data.list.length === 0 && (
            <p className="py-10 text-center text-sm text-gray-400 sm:col-span-2 xl:col-span-3">
              Belum ada kelas aktif yang tersedia.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
