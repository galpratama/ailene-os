import Image from "next/image";

const companies = [
  { name: "Sinar Mas", src: "/biz/logos/sinarmas.png" },
  { name: "XL Axiata", src: "/biz/logos/xl-axiata.svg" },
  { name: "Pertamina", src: "/biz/logos/pertamina.svg" },
  { name: "Bank Mandiri", src: "/biz/logos/bank-mandiri.svg" },
  {
    name: "Telkom Indonesia",
    src: "/biz/logos/telkom-indonesia.png",
  },
  { name: "Astra", src: "/biz/logos/astra-international.svg" },
];

export default function CompaniesHomeBIZ() {
  const repeatedCompanies = [...companies, ...companies];

  return (
    <section
      aria-label="Dipercaya lebih dari 100 perusahaan"
      className="overflow-hidden border-b border-white/15 bg-[linear-gradient(180deg,var(--color-biz-forest-light)_0%,var(--color-biz-forest-mid)_55%,var(--color-biz-forest)_100%)] py-6 text-white sm:py-7"
    >
      <div className="mx-auto w-full max-w-315 px-4.5 sm:px-7.5">
        <p className="text-center text-[12px] font-medium tracking-[0.08em] text-biz-lime uppercase">
          Dipercaya 100+ Perusahaan
        </p>
        <div className="mt-5 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
          <div className="biz-marquee flex w-max [animation:biz-marquee_42s_linear_infinite] hover:[animation-play-state:paused]">
            {repeatedCompanies.map((company, index) => (
              <span
                key={`${company.name}-${index}`}
                aria-hidden={index >= companies.length}
                className="flex min-w-45 items-center justify-center px-5 sm:min-w-55 sm:px-7"
              >
                <span className="relative block h-9 w-37.5 sm:w-42.5">
                  <Image
                    fill
                    src={company.src}
                    alt={company.name}
                    sizes="(min-width: 640px) 170px, 150px"
                    className="object-contain opacity-75 [filter:grayscale(1)_brightness(0)_invert(.72)] transition-[filter,opacity] hover:opacity-100 hover:[filter:grayscale(1)_brightness(0)_invert(.88)]"
                  />
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
