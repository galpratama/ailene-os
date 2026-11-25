import ShellV2BIZ from "@/components/elements/ShellV2BIZ";
import PageHeroV2BIZ from "@/components/heroes/PageHeroV2BIZ";
import RaporStatusLabelBIZ from "@/components/labels/RaporStatusLabelBIZ";
import RevealOnScroll from "@/components/motion/RevealOnScroll";
import LeadFormV2BIZ from "@/components/static-sections/LeadFormV2BIZ";
import NextStepV2BIZ from "@/components/static-sections/NextStepV2BIZ";
import { V2_H3, V2_SECTION, V2_SOURCE, V2_WRAP, type RaporStatus } from "@/lib/biz-home-v2";
import { IconFileCheck, IconKey, IconLock, IconMask, type Icon } from "@tabler/icons-react";

const commitments: { icon: Icon; title: string; body: string }[] = [
  { icon: IconFileCheck, title: "Kebijakan penggunaan AI selaras UU PDP", body: "Disusun bersama tim Anda di tahap Consult, lalu dipakai di setiap lab." },
  { icon: IconKey, title: "Bekerja dengan AI yang sudah Anda bayar", body: "Akun perusahaan Anda, di tenant perusahaan Anda." },
  { icon: IconMask, title: "Data disamarkan di setiap lab", body: "Latihan memakai data yang sudah disamarkan, bukan data pelanggan asli." },
  { icon: IconLock, title: "NDA dan DPA sebelum hari pertama", body: "Ditandatangani sebelum ada data yang berpindah tangan." },
];

const policy: [string, RaporStatus, string][] = [
  ["Copilot dengan akun perusahaan", "ok", "Boleh"],
  ["Memo internal dibuat dengan AI", "ok", "Boleh"],
  ["Bahan rapat Direksi dibuat dengan AI", "warn", "Perlu review"],
  ["Data pelanggan di AI publik", "risk", "Tidak boleh"],
  ["Kontrak di luar tenant perusahaan", "risk", "Tidak boleh"],
];

export default function GovernancePageV2BIZ() {
  return (
    <ShellV2BIZ page="governance">
      <PageHeroV2BIZ
        id="v2-gov-hero"
        title="Aman untuk enterprise. Dibangun untuk Indonesia."
        lead="Tim IT dan Legal Anda akan bertanya. Ini jawabannya, sebelum mereka bertanya."
      />
      <section aria-labelledby="v2-gov-commitments" className={`${V2_SECTION} bg-v2-paper pt-0`}>
        <RevealOnScroll className={`${V2_WRAP} grid items-center gap-[clamp(32px,5vw,72px)] min-[900px]:grid-cols-2`}>
          <div>
            <h2 id="v2-gov-commitments" className={V2_H3}>
              Empat komitmen di setiap program.
            </h2>
            <ul className="mt-6">
              {commitments.map(({ icon: CommitmentIcon, title, body }) => (
                <li key={title} className="grid grid-cols-[28px_1fr] gap-3.5 border-b border-v2-rule py-4.5">
                  <CommitmentIcon size={24} stroke={1.8} aria-hidden="true" className="mt-0.5 text-v2-green" />
                  <div>
                    <b className="block text-[1.08rem]">{title}</b>
                    <span className="text-[0.95rem] text-v2-ink-2">{body}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <table className="w-full overflow-hidden rounded-2xl bg-white shadow-[0_24px_48px_-28px_rgb(10_32_22/0.45),0_2px_6px_-2px_rgb(10_32_22/0.12)]">
              <caption className="sr-only">Contoh aturan kebijakan penggunaan AI</caption>
              <thead>
                <tr className="bg-v2-paper-2 text-[0.76rem] text-v2-ink-3">
                  <th scope="col" className="px-4.5 py-3.75 text-left font-bold">
                    Aturan
                  </th>
                  <th scope="col" className="px-4.5 py-3.75 text-right font-bold">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {policy.map(([rule, status, label]) => (
                  <tr key={rule} className="border-t border-v2-paper-2">
                    <td className="px-4.5 py-3.75">{rule}</td>
                    <td className="px-4.5 py-3.75 text-right">
                      <RaporStatusLabelBIZ status={status} label={label} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className={`${V2_SOURCE} mt-3`}>Contoh format. Isi kebijakan disusun untuk perusahaan Anda.</p>
          </div>
        </RevealOnScroll>
      </section>
      <NextStepV2BIZ
        id="v2-gov-next"
        title="Khawatir data sudah bocor ke AI publik?"
        body="Mulai dari kebijakan yang benar-benar diikuti tim. Kita bahas di konsultasi 20 menit."
        preselect={{ moment: "pdp" }}
      />
      <LeadFormV2BIZ />
    </ShellV2BIZ>
  );
}
