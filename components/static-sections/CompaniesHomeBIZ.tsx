import Image from "next/image";
import PageMargin from "@/components/layouts/PageMargin";

const companies = [
  { name: "Hypernet by XL", src: "/biz/logos/hypernet-by-xl.webp" },
  { name: "Pertamina", src: "/biz/logos/pertamina.svg" },
  { name: "Bank SMBC Indonesia", src: "/biz/logos/bank-smbc-indonesia.webp" },
  { name: "DANA", src: "/biz/logos/dana.svg" },
];

export default function CompaniesHomeBIZ() {
  const repeatedCompanies = [...companies, ...companies];

  return (
    <section
      aria-label="Dipercaya lebih dari 100 perusahaan"
      className="bg-white py-8 text-biz-ink sm:py-10"
    >
      <PageMargin className="flex flex-col items-center gap-6 lg:flex-row lg:gap-12">
        <p className="shrink-0 text-center text-lg leading-snug font-medium lg:text-left">
          Dipercaya 100+
          <br className="hidden lg:block" /> perusahaan
        </p>
        <div className="w-full min-w-0 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
          <div className="biz-marquee flex w-max [animation:biz-marquee_42s_linear_infinite] hover:[animation-play-state:paused]">
            {repeatedCompanies.map((company, index) => (
              <span
                key={`${company.name}-${index}`}
                aria-hidden={index >= companies.length}
                className="flex min-w-45 items-center justify-center px-5 sm:min-w-55 sm:px-7"
              >
                <span className="relative block h-10 w-37.5 sm:w-42.5">
                  <Image
                    fill
                    src={company.src}
                    alt={`Logo ${company.name}`}
                    sizes="(min-width: 640px) 170px, 150px"
                    className="object-contain"
                  />
                </span>
              </span>
            ))}
          </div>
        </div>
      </PageMargin>
    </section>
  );
}
