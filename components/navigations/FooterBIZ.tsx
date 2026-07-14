import { LogoAilene } from "@/components/svg/LogoAilene";

const footerColumns = [
  {
    heading: "Belajar",
    links: ["Kurikulum", "Foundation", "Semua Kelas"],
  },
  {
    heading: "Ailene",
    links: ["Tentang", "Komunitas", "Event", "Blog"],
  },
  {
    heading: "Ikutin kami",
    links: ["Discord", "Instagram", "TikTok", "LinkedIn"],
  },
];

export default function FooterBIZ() {
  return (
    <footer className="bg-ink pb-8 pt-14 text-white">
      <div className="mx-auto max-w-280 px-7">
        <div className="mb-7 grid grid-cols-2 gap-10 border-b border-white/10 pb-10 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
          <div>
            <LogoAilene className="mb-2 h-6 w-auto" />
            <p className="text-[13px] leading-normal text-white/40">
              Mulai dari nol.
              <br />
              Bukan dari takut.
            </p>
          </div>

          {footerColumns.map((col) => (
            <div key={col.heading}>
              <p className="mb-3.5 text-[11.5px] font-bold uppercase tracking-wider text-white/40">
                {col.heading}
              </p>
              <div className="flex flex-col gap-2">
                {col.links.map((link) => (
                  <a
                    key={link}
                    className="cursor-pointer text-[13.5px] text-white/50 hover:text-white/90"
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap justify-between gap-2 text-[12.5px] text-white/30">
          <span>© 2026 Ailene. All rights reserved.</span>
          <div className="flex gap-4">
            <a className="cursor-pointer hover:text-white/60">Privacy Policy</a>
            <a className="cursor-pointer hover:text-white/60">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
