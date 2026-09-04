// Public marketing host; the apex serves these same pages, so canonicals point here.
export const SITE_URL =
  process.env.NEXT_PUBLIC_DOMAIN_MODE === "local"
    ? "https://biz.example.com:3000"
    : "https://biz.ailene.id";

export const WHATSAPP_URL = "https://wa.me/6285110545698";

export const siteProfile = {
  name: "Ailene",
  tagline: "AI Adoption Training for Organizations",
  description:
    "Ailene membantu organisasi bergerak dari AI training menuju adopsi yang terlihat, terukur, dan berlanjut di pekerjaan sehari-hari.",
  phone: "+62-851-1054-5698",
  areaServed: "ID",
  locale: "id_ID",
  logo: `${SITE_URL}/android-chrome-512x512.png`,
  ogImage: `${SITE_URL}/biz/hero-training.jpg`,
} as const;

export function absoluteURL(path: string) {
  return new URL(path, SITE_URL).toString();
}
