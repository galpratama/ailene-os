import HeaderHomeBIZ from "../navigations/HeaderHomeBIZ";
import FooterHomeBIZ from "../navigations/FooterHomeBIZ";
import HeroHomeBIZ from "../heroes/HeroHomeBIZ";
import CompaniesHomeBIZ from "../static-sections/CompaniesHomeBIZ";
import OutcomesHomeBIZ from "../static-sections/OutcomesHomeBIZ";
import CurriculumHomeBIZ from "../static-sections/CurriculumHomeBIZ";
import ProgramsHomeBIZ from "../static-sections/ProgramsHomeBIZ";
import TrainersHomeBIZ from "../static-sections/TrainersHomeBIZ";
import ProgramOverviewHomeBIZ from "../static-sections/ProgramOverviewHomeBIZ";
import ProcessHomeBIZ from "../static-sections/ProcessHomeBIZ";
import FAQHomeBIZ from "../static-sections/FAQHomeBIZ";
import LeadFormHomeBIZ from "../static-sections/LeadFormHomeBIZ";
import CTAHomeBIZ from "../static-sections/CTAHomeBIZ";
import FloatingLeadButtonBIZ from "../buttons/FloatingLeadButtonBIZ";
import ScrollLeadModalBIZ from "../modals/ScrollLeadModalBIZ";
import RevealOnScroll from "../motion/RevealOnScroll";
import type { HeroAudience, HeroDisplay } from "@/lib/biz-content";

export default function HomePageBIZ({
  audience,
  display,
}: {
  audience: HeroAudience;
  display: HeroDisplay;
}) {
  return (
    <div id="top" className="bg-biz-paper text-biz-ink [&_[id]]:scroll-mt-17.5">
      <HeaderHomeBIZ />
      <main>
        <HeroHomeBIZ audience={audience} display={display} />
        <RevealOnScroll viewBlock="companies">
          <CompaniesHomeBIZ />
        </RevealOnScroll>
        <RevealOnScroll viewBlock="program_overview">
          <ProgramOverviewHomeBIZ />
        </RevealOnScroll>
        <RevealOnScroll>
          <ProcessHomeBIZ />
        </RevealOnScroll>
        <RevealOnScroll viewBlock="outcomes">
          <OutcomesHomeBIZ />
        </RevealOnScroll>
        <RevealOnScroll viewBlock="curriculum">
          <CurriculumHomeBIZ />
        </RevealOnScroll>
        <RevealOnScroll viewBlock="trainers">
          <TrainersHomeBIZ />
        </RevealOnScroll>
        <RevealOnScroll viewBlock="programs">
          <ProgramsHomeBIZ />
        </RevealOnScroll>
        <RevealOnScroll viewBlock="faq">
          <FAQHomeBIZ />
        </RevealOnScroll>
        <RevealOnScroll viewBlock="lead_form">
          <LeadFormHomeBIZ />
        </RevealOnScroll>
        <RevealOnScroll viewBlock="final_cta">
          <CTAHomeBIZ />
        </RevealOnScroll>
      </main>
      <FooterHomeBIZ />
      <ScrollLeadModalBIZ />
      <FloatingLeadButtonBIZ />
    </div>
  );
}
