import HeaderHomeBIZ from "../navigations/HeaderHomeBIZ";
import FooterHomeBIZ from "../navigations/FooterHomeBIZ";
import HeroHomeBIZ from "../heroes/HeroHomeBIZ";
import CompaniesHomeBIZ from "../static-sections/CompaniesHomeBIZ";
import OutcomesHomeBIZ from "../static-sections/OutcomesHomeBIZ";
import ToolsHomeBIZ from "../static-sections/ToolsHomeBIZ";
import AdoptionProofHomeBIZ from "../static-sections/AdoptionProofHomeBIZ";
import LMSHomeBIZ from "../static-sections/LMSHomeBIZ";
import CurriculumHomeBIZ from "../static-sections/CurriculumHomeBIZ";
import ProgramsHomeBIZ from "../static-sections/ProgramsHomeBIZ";
import TrainersHomeBIZ from "../static-sections/TrainersHomeBIZ";
import FAQHomeBIZ from "../static-sections/FAQHomeBIZ";
import LeadFormHomeBIZ from "../static-sections/LeadFormHomeBIZ";
import CTAHomeBIZ from "../static-sections/CTAHomeBIZ";
import RevealOnScroll from "../motion/RevealOnScroll";

export default function HomePageBIZ() {
  return (
    <div id="top" className="bg-biz-paper text-biz-ink">
      <HeaderHomeBIZ />
      <main>
        <HeroHomeBIZ />
        <RevealOnScroll viewBlock="companies">
          <CompaniesHomeBIZ />
        </RevealOnScroll>
        <RevealOnScroll viewBlock="outcomes">
          <OutcomesHomeBIZ />
        </RevealOnScroll>
        <RevealOnScroll viewBlock="tools">
          <ToolsHomeBIZ />
        </RevealOnScroll>
        <div className="bg-[linear-gradient(180deg,var(--color-biz-forest)_0%,var(--color-biz-forest-mid)_52%,var(--color-biz-forest-light)_100%)] text-white">
          <RevealOnScroll viewBlock="adoption_proof">
            <AdoptionProofHomeBIZ />
          </RevealOnScroll>
          <RevealOnScroll viewBlock="lms">
            <LMSHomeBIZ />
          </RevealOnScroll>
        </div>
        <RevealOnScroll viewBlock="curriculum">
          <CurriculumHomeBIZ />
        </RevealOnScroll>
        <RevealOnScroll viewBlock="programs">
          <ProgramsHomeBIZ />
        </RevealOnScroll>
        <RevealOnScroll viewBlock="trainers">
          <TrainersHomeBIZ />
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
    </div>
  );
}
