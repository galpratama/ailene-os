import HeaderHomeBIZ from "../navigations/HeaderHomeBIZ";
import FooterHomeBIZ from "../navigations/FooterHomeBIZ";
import HeroHomeBIZ from "../heroes/HeroHomeBIZ";
import CompaniesHomeBIZ from "../static-sections/CompaniesHomeBIZ";
import SolutionHomeBIZ from "../static-sections/SolutionHomeBIZ";
import OutcomesHomeBIZ from "../static-sections/OutcomesHomeBIZ";
import ToolsHomeBIZ from "../static-sections/ToolsHomeBIZ";
import AdoptionProofHomeBIZ from "../static-sections/AdoptionProofHomeBIZ";
import CurriculumHomeBIZ from "../static-sections/CurriculumHomeBIZ";
import ProgramsHomeBIZ from "../static-sections/ProgramsHomeBIZ";
import TrainersHomeBIZ from "../static-sections/TrainersHomeBIZ";
import FAQHomeBIZ from "../static-sections/FAQHomeBIZ";
import LeadFormHomeBIZ from "../static-sections/LeadFormHomeBIZ";
import CTAHomeBIZ from "../static-sections/CTAHomeBIZ";
import ScrollLeadModalBIZ from "../modals/ScrollLeadModalBIZ";
import RevealOnScroll from "../motion/RevealOnScroll";
import type { IndustryEntry } from "@/apis/lookup";

export default function HomePageBIZ({
  industries,
}: {
  industries: IndustryEntry[];
}) {
  return (
    <div id="top" className="bg-biz-paper text-biz-ink [&_[id]]:scroll-mt-17.5">
      <HeaderHomeBIZ />
      <main>
        <HeroHomeBIZ />
        <RevealOnScroll viewBlock="companies">
          <CompaniesHomeBIZ />
        </RevealOnScroll>
        <RevealOnScroll viewBlock="solution">
          <SolutionHomeBIZ />
        </RevealOnScroll>
        <RevealOnScroll viewBlock="outcomes">
          <OutcomesHomeBIZ />
        </RevealOnScroll>
        <RevealOnScroll viewBlock="tools">
          <ToolsHomeBIZ />
        </RevealOnScroll>
        <div className="bg-black text-white">
          <RevealOnScroll viewBlock="adoption_proof">
            <AdoptionProofHomeBIZ />
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
          <LeadFormHomeBIZ industries={industries} />
        </RevealOnScroll>
        <RevealOnScroll viewBlock="final_cta">
          <CTAHomeBIZ />
        </RevealOnScroll>
      </main>
      <FooterHomeBIZ />
      <ScrollLeadModalBIZ industries={industries} />
    </div>
  );
}
