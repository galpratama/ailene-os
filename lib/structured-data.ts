import { curriculumModules, faqs, programs } from "@/lib/biz-content";
import { SITE_URL, WHATSAPP_URL, siteProfile } from "@/lib/site";

const ORGANIZATION_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;

export function organizationSchema() {
  return {
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: siteProfile.name,
    url: `${SITE_URL}/`,
    logo: siteProfile.logo,
    image: siteProfile.ogImage,
    description: siteProfile.description,
    telephone: siteProfile.phone,
    areaServed: siteProfile.areaServed,
    knowsLanguage: ["id", "en"],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "sales",
      telephone: siteProfile.phone,
      url: WHATSAPP_URL,
      areaServed: siteProfile.areaServed,
      availableLanguage: ["Indonesian", "English"],
    },
  };
}

export function websiteSchema() {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: `${SITE_URL}/`,
    name: siteProfile.name,
    description: siteProfile.description,
    inLanguage: "id-ID",
    publisher: { "@id": ORGANIZATION_ID },
  };
}

// One Course per program, each carrying the shared six-module syllabus.
export function courseSchemas() {
  const syllabus = curriculumModules.map((module, index) => ({
    "@type": "Syllabus",
    position: index + 1,
    name: module.title,
    description: module.copy,
  }));

  return programs.map((program) => ({
    "@type": "Course",
    "@id": `${SITE_URL}/#program-${program.id}`,
    name: `${program.name} — AI Adoption Training`,
    description: `${program.fit}. Format ${program.format}, durasi ${program.duration}, ${program.participants}. Output: ${program.output}.`,
    url: `${SITE_URL}/#programs`,
    inLanguage: "id-ID",
    provider: { "@id": ORGANIZATION_ID },
    teaches: curriculumModules.map((module) => module.title),
    syllabusSections: syllabus,
    audience: {
      "@type": "EducationalAudience",
      educationalRole: "professional",
      audienceType: program.fit,
    },
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: program.format.toLowerCase().includes("offline")
        ? "onsite"
        : "blended",
      courseWorkload: program.duration,
      inLanguage: "id-ID",
      location: { "@type": "Country", name: "Indonesia" },
    },
  }));
}

// Quoted per engagement, so Service without a price beats Product with a fake one.
export function serviceSchemas() {
  return programs.map((program) => ({
    "@type": "Service",
    "@id": `${SITE_URL}/#service-${program.id}`,
    name: program.name,
    serviceType: "AI adoption training",
    description: `${program.fit}. ${program.duration} · ${program.format} · ${program.participants}.`,
    provider: { "@id": ORGANIZATION_ID },
    areaServed: siteProfile.areaServed,
    audience: { "@type": "BusinessAudience", name: "Organizations and teams" },
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
      url: WHATSAPP_URL,
      seller: { "@id": ORGANIZATION_ID },
    },
  }));
}

export function faqSchema() {
  return {
    "@type": "FAQPage",
    "@id": `${SITE_URL}/#faq`,
    mainEntity: faqs.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  };
}

export function breadcrumbSchema(trail: Array<{ name: string; path: string }>) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: `${SITE_URL}${crumb.path}`,
    })),
  };
}

export function homePageGraph() {
  return [
    organizationSchema(),
    websiteSchema(),
    ...courseSchemas(),
    ...serviceSchemas(),
    faqSchema(),
    breadcrumbSchema([{ name: "Home", path: "/" }]),
  ];
}

export function trainerPageGraph() {
  return [
    organizationSchema(),
    websiteSchema(),
    {
      "@type": "WebPage",
      "@id": `${SITE_URL}/join-trainer#webpage`,
      url: `${SITE_URL}/join-trainer`,
      name: "Join Trainer Pool",
      description:
        "Pendaftaran trainer pool Ailene untuk membawakan program AI adoption training di organisasi klien.",
      inLanguage: "id-ID",
      isPartOf: { "@id": WEBSITE_ID },
      about: { "@id": ORGANIZATION_ID },
    },
    breadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Join Trainer Pool", path: "/join-trainer" },
    ]),
  ];
}

export function articlesIndexGraph() {
  return [
    organizationSchema(),
    websiteSchema(),
    {
      "@type": "CollectionPage",
      "@id": `${SITE_URL}/articles#webpage`,
      url: `${SITE_URL}/articles`,
      name: "Artikel Ailene",
      inLanguage: "id-ID",
      isPartOf: { "@id": WEBSITE_ID },
      about: { "@id": ORGANIZATION_ID },
    },
    breadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Artikel", path: "/articles" },
    ]),
  ];
}

export function articlePageGraph(article: {
  id: number;
  title: string;
  insight: string;
  image_url: string;
  keywords: string;
  slug_url: string;
  published_at: string;
  updated_at: string;
  author: { full_name: string };
  category: { name: string };
}) {
  const path = `/articles/${article.slug_url}/${article.id}`;
  return [
    organizationSchema(),
    websiteSchema(),
    {
      "@type": "BlogPosting",
      "@id": `${SITE_URL}${path}#article`,
      mainEntityOfPage: `${SITE_URL}${path}`,
      headline: article.title,
      description: article.insight,
      image: article.image_url,
      keywords: article.keywords,
      articleSection: article.category.name,
      datePublished: article.published_at,
      dateModified: article.updated_at,
      inLanguage: "id-ID",
      author: { "@type": "Person", name: article.author.full_name },
      publisher: { "@id": ORGANIZATION_ID },
      isPartOf: { "@id": WEBSITE_ID },
    },
    breadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Artikel", path: "/articles" },
      { name: article.title, path },
    ]),
  ];
}
