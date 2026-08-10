import { Prisma } from "@prisma/client";

const LEGAL_SUFFIXES = [
  "pt",
  "cv",
  "tbk",
  "persero",
  "ud",
  "firma",
  "perseroan terbatas",
];

// Lowercase, strip common Indonesian legal suffixes/punctuation, collapse whitespace.
export function normalizeOrgName(name: string): string {
  const words = name
    .toLowerCase()
    .replace(/[.,]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .filter((word) => !LEGAL_SUFFIXES.includes(word));
  return words.join(" ").trim();
}

export function emailDomain(email: string | null | undefined): string | null {
  if (!email) return null;
  const at = email.lastIndexOf("@");
  if (at === -1) return null;
  return email.slice(at + 1).toLowerCase();
}

const CLOSED_STAGES = new Set(["CLOSED_WON", "CLOSED_LOST"]);

export type OrganizationDuplicateCandidate = {
  id: number;
  name: string;
  status: string;
  matched_reasons: string[];
  owner_name: string | null;
  owner_avatar: string | null;
  active_pipeline_count: number;
};

export async function findOrganizationDuplicates(
  prisma: Prisma.TransactionClient,
  input: { name: string; aliases?: string[]; email?: string | null; phone?: string | null }
): Promise<OrganizationDuplicateCandidate[]> {
  const normalized = normalizeOrgName(input.name);
  const normalizedAliases = (input.aliases ?? []).map(normalizeOrgName);
  const domain = emailDomain(input.email);

  const orConditions: Prisma.B2BCompanyWhereInput[] = [
    { normalized_name: normalized },
    { aliases: { has: normalized } },
  ];
  for (const alias of normalizedAliases) {
    orConditions.push({ normalized_name: alias }, { aliases: { has: alias } });
  }
  if (input.phone) {
    orConditions.push({ pic_wa: input.phone });
  }
  if (domain) {
    orConditions.push({
      pic_email: { endsWith: `@${domain}`, mode: "insensitive" },
    });
  }

  const candidates = await prisma.b2BCompany.findMany({
    where: { OR: orConditions },
    include: {
      pipelines: {
        orderBy: { created_at: "desc" },
        select: {
          stage: true,
          owner: { select: { full_name: true, avatar: true } },
        },
      },
    },
  });

  return candidates.map((candidate) => {
    const matched_reasons: string[] = [];
    if (candidate.normalized_name === normalized || candidate.aliases.includes(normalized)) {
      matched_reasons.push("name");
    }
    if (
      normalizedAliases.some(
        (alias) => candidate.normalized_name === alias || candidate.aliases.includes(alias)
      )
    ) {
      matched_reasons.push("alias");
    }
    if (input.phone && candidate.pic_wa === input.phone) {
      matched_reasons.push("phone");
    }
    if (domain && emailDomain(candidate.pic_email) === domain) {
      matched_reasons.push("email_domain");
    }

    return {
      id: candidate.id,
      name: candidate.name,
      status: candidate.status,
      matched_reasons,
      owner_name: candidate.pipelines[0]?.owner.full_name ?? null,
      owner_avatar: candidate.pipelines[0]?.owner.avatar ?? null,
      active_pipeline_count: candidate.pipelines.filter(
        (p) => !CLOSED_STAGES.has(p.stage)
      ).length,
    };
  });
}
