import { hutamaKaryaCase } from "@/lib/biz-case-studies";

export default function CaseStudyTimelineBIZ() {
  return (
    <ol className="overflow-hidden rounded-2xl border border-white/12">
      {hutamaKaryaCase.sessions.map((session) => {
        const measured = "measured" in session && session.measured;
        return (
          <li
            key={session.label}
            className={`grid grid-cols-[72px_minmax(0,1fr)] items-center gap-x-4 gap-y-1.5 border-b border-white/10 px-4 py-4 last:border-b-0 sm:grid-cols-[92px_88px_minmax(0,1fr)_auto] sm:px-6 ${
              measured ? "bg-white/8" : ""
            }`}
          >
            <span className="text-sm font-semibold text-biz-lime">{session.label}</span>
            <span className="text-sm text-white/60 tabular-nums sm:order-none">{session.date}</span>
            <span className="col-span-2 text-[15px] font-medium text-white sm:col-span-1">
              {session.focus}
              <span className="ml-2 text-[13px] font-normal text-white/50">{session.tool}</span>
            </span>
            <span className="col-span-2 flex flex-wrap gap-1.5 sm:col-span-1 sm:justify-end">
              {measured && (
                <span className="rounded-full bg-biz-lime px-2.5 py-1 text-[11px] font-semibold text-biz-forest">Data tersedia</span>
              )}
              <span
                className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                  session.mode === "Luring" ? "border-biz-lime/50 text-biz-lime" : "border-white/20 text-white/70"
                }`}
              >
                {session.mode}
              </span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
