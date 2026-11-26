// Shared upper-right glow from the secondary-page hero, including /lms.
export default function HeroGlowV2BIZ() {
  return (
    <div
      aria-hidden="true"
      className="absolute -top-[40%] -right-[12%] -z-10 aspect-square w-[min(56vw,760px)] rounded-full bg-[radial-gradient(circle_at_58%_42%,color-mix(in_srgb,var(--v2-leaf)_55%,transparent),transparent_58%),radial-gradient(circle_at_38%_62%,color-mix(in_srgb,var(--v2-forest)_38%,transparent),transparent_52%),radial-gradient(circle_at_66%_66%,color-mix(in_srgb,var(--v2-lime)_42%,transparent),transparent_38%)] blur-[44px]"
    />
  );
}
