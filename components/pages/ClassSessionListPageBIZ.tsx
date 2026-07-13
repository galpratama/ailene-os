"use client";

import FooterBIZ from "@/components/navigations/FooterBIZ";
import HeaderBIZ from "@/components/navigations/HeaderBIZ";
import SessionDifficultyLabel from "@/components/labels/SessionDifficultyLabel";
import { trpc } from "@/trpc/client";
import { ArrowRight, CalendarClock } from "lucide-react";
import Link from "next/link";

export default function ClassSessionListPageBIZ() {
  const { data, isLoading } = trpc.list.b2bClass.openSessions.useQuery({
    page: 1,
    page_size: 50,
  });

  return (
    <div className="min-h-screen bg-off text-ink">
      <HeaderBIZ />
      <main>
        <section className="border-b border-ink-line bg-kuning-t">
          <div className="mx-auto max-w-280 px-7 py-14">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-ink-line bg-white px-3 py-1.5 text-xs font-bold">
              <CalendarClock size={14} className="text-oranye" />
              Sesi Kelas B2B Terbuka
            </div>
            <h1 className="max-w-160 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
              Sesi kelas yang sedang menerima aplikasi trainer.
            </h1>
            <p className="mt-4 max-w-150 text-ink-soft">
              Sudah terdaftar di Ailene Trainer Pool? Pilih sesi yang sesuai
              level dan spesialisasimu, lalu apply.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-200 px-7 py-14">
          {isLoading && (
            <p className="py-10 text-center text-sm text-ink-soft">
              Memuat sesi...
            </p>
          )}
          {data && (
            <div className="flex flex-col gap-4">
              {data.list.map((session) => (
                <Link
                  key={session.id}
                  href={`/class-sessions/${session.id}`}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-ink-line bg-white p-5 transition-colors hover:border-oranye/60"
                >
                  <div>
                    <p className="text-xs font-bold text-oranye">
                      {session.class_name}
                    </p>
                    <h2 className="mt-1 text-lg font-extrabold">
                      {session.name}
                    </h2>
                    <div className="mt-2 flex items-center gap-2">
                      <SessionDifficultyLabel difficulty={session.difficulty} />
                      {session.session_date && (
                        <span className="text-xs text-ink-soft">
                          {new Date(session.session_date).toLocaleDateString(
                            "id-ID"
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                  <ArrowRight size={18} className="shrink-0 text-ink-soft" />
                </Link>
              ))}
              {data.list.length === 0 && (
                <p className="rounded-2xl border border-dashed border-ink-line py-14 text-center text-sm text-ink-soft">
                  Belum ada sesi yang terbuka saat ini. Cek lagi nanti ya.
                </p>
              )}
            </div>
          )}
        </section>
      </main>
      <FooterBIZ />
    </div>
  );
}
