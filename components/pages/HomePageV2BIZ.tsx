import ShellV2BIZ from "../elements/ShellV2BIZ";
import HeroV2BIZ from "../heroes/HeroV2BIZ";
import RevealOnScroll from "../motion/RevealOnScroll";
import AcademyV2BIZ from "../static-sections/AcademyV2BIZ";
import CloseV2BIZ from "../static-sections/CloseV2BIZ";
import DifferenceV2BIZ from "../static-sections/DifferenceV2BIZ";
import FactsV2BIZ from "../static-sections/FactsV2BIZ";
import LeadFormV2BIZ from "../static-sections/LeadFormV2BIZ";
import ProblemV2BIZ from "../static-sections/ProblemV2BIZ";
import RaporBoardV2BIZ from "../static-sections/RaporBoardV2BIZ";
import RaporV2BIZ from "../static-sections/RaporV2BIZ";
import ServicesV2BIZ from "../static-sections/ServicesV2BIZ";
import SprintV2BIZ from "../static-sections/SprintV2BIZ";
import StatementV2BIZ from "../static-sections/StatementV2BIZ";
import TrustV2BIZ from "../static-sections/TrustV2BIZ";
import TwoCompaniesV2BIZ from "../static-sections/TwoCompaniesV2BIZ";
import WhyFailsV2BIZ from "../static-sections/WhyFailsV2BIZ";

// Variant "b" of the home A/B test ("Make AI stick."); variant "a" is HomePageBIZ.
export default function HomePageV2BIZ() {
  return (
    <ShellV2BIZ page="home">
        <HeroV2BIZ />
        <StatementV2BIZ />
        <RaporBoardV2BIZ />
        <ProblemV2BIZ />
        <FactsV2BIZ />
        <RevealOnScroll viewBlock="outcomes">
          <TwoCompaniesV2BIZ />
        </RevealOnScroll>
        <RevealOnScroll>
          <WhyFailsV2BIZ />
        </RevealOnScroll>
        <RevealOnScroll viewBlock="solution">
          <DifferenceV2BIZ />
        </RevealOnScroll>
        <ServicesV2BIZ />
        <RevealOnScroll viewBlock="lms">
          <AcademyV2BIZ />
        </RevealOnScroll>
        <RevealOnScroll viewBlock="programs">
          <SprintV2BIZ />
        </RevealOnScroll>
        <RevealOnScroll viewBlock="curriculum">
          <RaporV2BIZ />
        </RevealOnScroll>
        <RevealOnScroll viewBlock="companies">
          <TrustV2BIZ />
        </RevealOnScroll>
        <RevealOnScroll viewBlock="final_cta">
          <CloseV2BIZ />
        </RevealOnScroll>
        <RevealOnScroll viewBlock="lead_form">
          <LeadFormV2BIZ />
        </RevealOnScroll>
    </ShellV2BIZ>
  );
}
