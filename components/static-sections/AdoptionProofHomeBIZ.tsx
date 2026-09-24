import { Check } from "lucide-react";
import PageMargin from "@/components/layouts/PageMargin";
import AdoptionJourneyHomeBIZ from "./AdoptionJourneyHomeBIZ";

export default function AdoptionProofHomeBIZ() {
  return (
    <section id="adoption-gap" className="overflow-hidden py-18 sm:py-28">
      <PageMargin className="grid items-center gap-11 lg:grid-cols-[minmax(300px,0.8fr)_minmax(0,1.2fr)] lg:gap-20">
        <div>
          <p className="biz-topic-label !text-white before:!hidden after:!hidden">
            The adoption gap
          </p>
          <h2 className="mt-3.5 max-w-146 text-[36px] leading-[0.98] font-medium tracking-[-0.06em] text-white lg:text-[44px]">
            Training selesai. Adopsi belum tentu dimulai.
          </h2>
          <p className="mt-6 max-w-126 text-base leading-[1.7] text-white/68">
            Banyak tim selesai belajar, tetapi belum punya ritme untuk memakai
            AI di pekerjaan nyata.
          </p>
          <ul className="mt-7 grid max-w-120 gap-4">
            {[
              "Tim siap menerapkan AI pada workflow prioritas.",
              "Progres adopsi terjaga sampai berdampak pada bisnis.",
            ].map((point) => (
              <li
                key={point}
                className="grid grid-cols-[20px_1fr] items-start gap-3 text-sm leading-[1.5] text-white/70"
              >
                <Check size={19} className="mt-0.5 text-biz-lime" />
                <strong className="font-semibold text-white">{point}</strong>
              </li>
            ))}
          </ul>
        </div>

        <AdoptionJourneyHomeBIZ />
      </PageMargin>
    </section>
  );
}
