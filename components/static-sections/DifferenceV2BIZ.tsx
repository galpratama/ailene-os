import { V2_H2, V2_LEAD, V2_SECTION, V2_WRAP } from "@/lib/biz-home-v2";

export default function DifferenceV2BIZ() {
  const steps = [
    "Pilih pekerjaan dengan dampak terbesar",
    "Latih tim tepat pada use case pekerjaan itu",
    "Lacak pemakaian, use case, dan jam yang dihemat",
    "Tunjukkan dampaknya ke pimpinan, setiap kuartal",
  ];
  return (
    <section aria-labelledby="v2-diff" className={`${V2_SECTION} bg-v2-paper`}>
      <div className={V2_WRAP}>
        <div className="max-w-190">
          <h2 id="v2-diff" className={V2_H2}>
            Kami latih untuk dampak bisnis. Lalu kami lacak.
          </h2>
          <p className={`${V2_LEAD} mt-5`}>Ini yang membuat program kami tidak berhenti di workshop.</p>
        </div>
        <ol className="mt-[clamp(28px,4vw,48px)] grid gap-3 min-[420px]:grid-cols-2 min-[900px]:grid-cols-4">
          {steps.map((step, index) => {
            const tracked = index >= 2;
            return (
              <li
                key={step}
                className={`rounded-2xl border px-5 pt-5 pb-5.5 text-[clamp(1.02rem,1.4vw,1.2rem)] leading-[1.3] font-bold tracking-[-0.015em] min-[900px]:min-h-37.5 ${
                  tracked ? "border-v2-forest bg-v2-forest text-v2-on-forest" : "border-v2-rule bg-v2-paper-2 text-v2-forest"
                }`}
              >
                <span
                  className={`mb-5.5 grid size-7.5 place-items-center rounded-full border text-[0.82rem] text-v2-forest ${
                    tracked ? "border-v2-lime bg-v2-lime" : "border-v2-rule bg-white"
                  }`}
                >
                  {index + 1}
                </span>
                {step}
              </li>
            );
          })}
        </ol>
        <div className="mt-[clamp(24px,3vw,36px)] grid gap-[clamp(20px,3vw,40px)] min-[900px]:grid-cols-2">
          {[
            ["01 · Pelatihan berbasis dampak", "Bukan kelas AI umum. Pelatihan pada pekerjaan yang menggerakkan bisnis Anda."],
            ["02 · Platform pelacak dampak", "LMS dengan identitas perusahaan Anda. Setiap orang, tim, dan use case terukur."],
          ].map(([title, body]) => (
            <div key={title} className="border-t-2 border-v2-forest pt-3.5">
              <p className="mb-1.5 text-[0.86rem] font-extrabold text-v2-forest">{title}</p>
              <p className="leading-normal text-v2-ink-2">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
