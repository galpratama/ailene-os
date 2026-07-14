import HeaderHomeBIZ from "../navigations/HeaderHomeBIZ";
import FooterHomeBIZ from "../navigations/FooterHomeBIZ";
import HeroHomeBIZ from "../heroes/HeroHomeBIZ";
import StatsBandHomeBIZ from "../static-sections/StatsBandHomeBIZ";
import PackagesHomeBIZ from "../static-sections/PackagesHomeBIZ";
import CompareProgramsHomeBIZ from "../static-sections/CompareProgramsHomeBIZ";
import ProcessHomeBIZ from "../static-sections/ProcessHomeBIZ";
import TrainersHomeBIZ from "../static-sections/TrainersHomeBIZ";
import NotesHomeBIZ from "../static-sections/NotesHomeBIZ";
import CTAHomeBIZ from "../static-sections/CTAHomeBIZ";

export default function HomePageBIZ() {
  return (
    <div id="top">
      <HeaderHomeBIZ />
      <HeroHomeBIZ />
      <StatsBandHomeBIZ />
      <PackagesHomeBIZ />
      <CompareProgramsHomeBIZ />
      <ProcessHomeBIZ />
      <TrainersHomeBIZ />
      <NotesHomeBIZ />
      <CTAHomeBIZ />
      <FooterHomeBIZ />
    </div>
  );
}
