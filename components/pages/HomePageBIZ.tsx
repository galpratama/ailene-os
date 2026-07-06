import { Plus_Jakarta_Sans } from "next/font/google";
import HeaderBIZ from "../navigations/HeaderBIZ";
import FooterBIZ from "../navigations/FooterBIZ";
import HeroHomeBIZ from "../heroes/HeroHomeBIZ";
import PainHomeBIZ from "../static-sections/PainHomeBIZ";
import AboutHomeBIZ from "../static-sections/AboutHomeBIZ";
import ClassesHomeBIZ from "../static-sections/ClassesHomeBIZ";
import SkillTreeHomeBIZ from "../static-sections/SkillTreeHomeBIZ";
import PromptingHomeBIZ from "../static-sections/PromptingHomeBIZ";
import BenefitHomeBIZ from "../static-sections/BenefitHomeBIZ";
import CommunityHomeBIZ from "../static-sections/CommunityHomeBIZ";
import TestimonialsHomeBIZ from "../static-sections/TestimonialsHomeBIZ";
import HackathonHomeBIZ from "../static-sections/HackathonHomeBIZ";
import CTAHomeBIZ from "../static-sections/CTAHomeBIZ";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export default function HomePageBIZ() {
  return (
    <div className={`${jakarta.variable} font-jakarta`}>
      <HeaderBIZ />
      <HeroHomeBIZ />
      <PainHomeBIZ />
      <AboutHomeBIZ />
      <ClassesHomeBIZ />
      <SkillTreeHomeBIZ />
      <PromptingHomeBIZ />
      <BenefitHomeBIZ />
      <CommunityHomeBIZ />
      <TestimonialsHomeBIZ />
      <HackathonHomeBIZ />
      <CTAHomeBIZ />
      <FooterBIZ />
    </div>
  );
}
