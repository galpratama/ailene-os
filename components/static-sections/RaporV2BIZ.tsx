import RaporStatusLabelBIZ from "@/components/labels/RaporStatusLabelBIZ";
import { V2_H2, V2_LEAD, V2_SECTION, V2_WRAP, type RaporStatus } from "@/lib/biz-home-v2";

const rows: [string, string, string, string, RaporStatus, string][] = [
  ["Sales", "58 → 79", "74%", "410", "ok", "Draf tender kini selesai dalam sehari."],
  ["Finance", "41 → 72", "81%", "380", "ok", "Memo tutup buku bulanan jadi lab rujukan divisi lain."],
  ["Human Capital", "36 → 61", "68%", "190", "ok", "Shortlist kandidat dipercepat, champion aktif."],
  ["Operations", "29 → 44", "39%", "220", "warn", "Laporan shift otomatis. Shift malam belum ikut lab."],
  ["Legal", "22 → 40", "50%", "40", "risk", "Kebijakan kontrak belum disetujui. Sesi Direksi dijadwalkan."],
];

const rituals = [
  ["Awal", "Ailene Score", "Indeks kesiapan AI perusahaan, 0–100, dari assessment."],
  ["Selama program", "Champion", "Karyawan internal yang membimbing rekan di divisinya. Satu untuk setiap 15 orang, dengan pin dan sertifikat."],
  ["Minggu 10", "Demo Day", "Tim presentasi ke Direksi. Kesiapan diukur ulang."],
  ["Setiap kuartal", "Rapor AI", "Satu halaman per divisi, format yang sama."],
];

const cell = "border-b border-v2-paper-2 py-3.25 pr-2.5 align-top";

export default function RaporV2BIZ() {
  return (
    <section id="rapor" aria-labelledby="v2-rapor" className={`${V2_SECTION} bg-v2-paper-2`}>
      <div className={V2_WRAP}>
        <div className="max-w-190">
          <h2 id="v2-rapor" className={V2_H2}>
            Pastikan rapor AI perusahaan Anda hijau.
          </h2>
          <p className={`${V2_LEAD} mt-5`}>
            Setiap kuartal, setiap divisi menerima rapor satu halaman: hijau, kuning, atau merah. Format yang sama, setiap kali, supaya Direksi bisa membandingkan.
          </p>
        </div>
        <article
          aria-labelledby="v2-rapor-title"
          className="relative mt-[clamp(36px,5vw,64px)] rounded-md border border-v2-rule bg-white p-[clamp(20px,3vw,40px)] shadow-[0_24px_48px_-28px_rgb(10_32_22/0.45),0_2px_6px_-2px_rgb(10_32_22/0.12)]"
        >
          <div className="flex flex-wrap items-start justify-between gap-4 border-b-2 border-v2-ink pb-4.5">
            <div>
              <h3 id="v2-rapor-title" className="font-jakarta text-[clamp(1.5rem,2.6vw,2rem)] leading-tight font-extrabold tracking-[-0.035em]">
                Rapor AI
              </h3>
              <p className="mt-1 text-sm text-v2-ink-3">Kuartal IV · Contoh rapor, angka ilustrasi</p>
            </div>
            <dl className="grid grid-cols-[auto_auto] gap-x-4 gap-y-0.5 text-[0.84rem] text-v2-ink-2">
              <dt>Perusahaan</dt>
              <dd className="font-bold text-v2-ink">Perusahaan Anda</dd>
              <dt>Pemilik program</dt>
              <dd className="font-bold text-v2-ink">Head of HC</dd>
              <dt>Periode</dt>
              <dd className="font-bold text-v2-ink">Okt–Des</dd>
            </dl>
          </div>
          <div tabIndex={0} role="region" aria-label="Tabel rapor per divisi" className="overflow-x-auto">
            <table className="mt-1.5 w-full border-collapse text-[0.92rem] tabular-nums">
              <thead>
                <tr className="text-left text-[0.78rem] font-bold text-v2-ink-3">
                  <th scope="col" className="border-b border-v2-rule pt-3 pr-2.5 pb-2.5">Divisi</th>
                  <th scope="col" className="border-b border-v2-rule pt-3 pr-2.5 pb-2.5">Kesiapan</th>
                  <th scope="col" className="border-b border-v2-rule pt-3 pr-2.5 pb-2.5 max-[720px]:hidden">Aktif mingguan</th>
                  <th scope="col" className="border-b border-v2-rule pt-3 pr-2.5 pb-2.5 max-[720px]:hidden">Jam dihemat / bln</th>
                  <th scope="col" className="border-b border-v2-rule pt-3 pr-2.5 pb-2.5">Status</th>
                  <th scope="col" className="border-b border-v2-rule pt-3 pr-2.5 pb-2.5 max-[720px]:hidden">Catatan</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(([division, readiness, active, hours, status, note]) => (
                  <tr key={division}>
                    <th scope="row" className={`${cell} text-left text-[0.95rem] font-bold whitespace-nowrap`}>{division}</th>
                    <td className={`${cell} whitespace-nowrap`}>{readiness}</td>
                    <td className={`${cell} max-[720px]:hidden`}>{active}</td>
                    <td className={`${cell} font-extrabold max-[720px]:hidden`}>{hours}</td>
                    <td className={cell}>
                      <RaporStatusLabelBIZ status={status} />
                    </td>
                    <td className={`${cell} max-w-[34ch] text-[0.86rem] text-v2-ink-2 max-[720px]:hidden`}>{note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-7 flex flex-wrap items-end justify-between gap-6">
            <div className="flex items-center gap-4 rounded-[10px] bg-v2-lime px-4.5 py-3.5 text-v2-forest">
              <b className="font-jakarta text-[2rem] leading-none tracking-[-0.04em] tabular-nums">1.240</b>
              <small className="text-[0.8rem] leading-[1.35] text-v2-lime-ink">
                jam dihemat per bulan,
                <br />
                diverifikasi champion
              </small>
            </div>
            <p className="font-jakarta text-[clamp(2rem,4vw,3rem)] leading-none font-extrabold tracking-[-0.04em]">Ini angkanya.</p>
          </div>
          <div aria-hidden="true" className="mt-7 flex flex-wrap gap-x-7 gap-y-5 text-[0.78rem] text-v2-ink-3">
            {["Direksi", "Head of HC", "Ailene"].map((signer) => (
              <div key={signer} className="min-w-20 flex-[0_1_110px] border-t border-v2-ink-3 pt-1.5">
                {signer}
              </div>
            ))}
          </div>
        </article>
        <div tabIndex={0} role="region" aria-label="Yang terjadi selama program" className="mt-[clamp(40px,5vw,64px)] overflow-x-auto">
          <table className="w-full min-w-140 border-collapse">
            <caption className="sr-only">Yang terjadi selama program</caption>
            <thead>
              <tr className="text-left text-[0.78rem] font-bold text-v2-ink-3">
                <th scope="col" className="border-b-2 border-v2-ink py-4 pr-4">Kapan</th>
                <th scope="col" className="border-b-2 border-v2-ink py-4 pr-4">Yang terjadi</th>
                <th scope="col" className="border-b-2 border-v2-ink py-4 pr-4">Isi</th>
              </tr>
            </thead>
            <tbody>
              {rituals.map(([when, what, detail]) => (
                <tr key={what} className="align-baseline">
                  <td className="w-[18%] border-b border-v2-rule py-4 pr-4 font-bold whitespace-nowrap text-v2-green">{when}</td>
                  <th scope="row" className="w-[24%] border-b border-v2-rule py-4 pr-4 text-left font-jakarta text-[1.2rem] font-extrabold tracking-[-0.02em]">
                    {what}
                  </th>
                  <td className="border-b border-v2-rule py-4 pr-4 text-v2-ink-2">{detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
