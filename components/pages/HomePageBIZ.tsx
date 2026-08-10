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

export default function HomePageBIZ() {
  return (
    <div id="top" className="bg-biz-paper text-biz-ink">
      <HeaderHomeBIZ />
      <main>
        <HeroHomeBIZ />
        <CompaniesHomeBIZ />
        <OutcomesHomeBIZ />
        <ToolsHomeBIZ />
        <div className="bg-[linear-gradient(180deg,var(--color-biz-forest)_0%,var(--color-biz-forest-mid)_52%,var(--color-biz-forest-light)_100%)] text-white">
          <AdoptionProofHomeBIZ />
          <LMSHomeBIZ />
        </div>
        <CurriculumHomeBIZ />
        <ProgramsHomeBIZ />
        <TrainersHomeBIZ />
        <FAQHomeBIZ />
        <LeadFormHomeBIZ />
        <CTAHomeBIZ />
      </main>
      <FooterHomeBIZ />
    </div>
  );
}
