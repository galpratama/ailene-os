import { Prisma } from "@prisma/client";

type PicFields = {
  pic_name?: string | null;
  pic_job_title?: string | null;
  pic_wa?: string | null;
  pic_email?: string | null;
};

// Keeps the organization's flat pic_* fields as the source of truth while also maintaining a reusable primary Contact record linked to it.
export async function upsertPrimaryContact(
  prisma: Prisma.TransactionClient,
  organizationId: number,
  pic: PicFields
) {
  if (!pic.pic_name) return;

  const existing = await prisma.contactOrganizationRelationship.findFirst({
    where: { organization_id: organizationId, is_primary: true },
    select: { contact_id: true },
  });

  if (existing) {
    await prisma.contact.update({
      where: { id: existing.contact_id },
      data: {
        full_name: pic.pic_name,
        job_title: pic.pic_job_title ?? null,
        phone: pic.pic_wa ?? null,
        email: pic.pic_email ?? null,
      },
    });
    return;
  }

  const contact = await prisma.contact.create({
    data: {
      full_name: pic.pic_name,
      job_title: pic.pic_job_title ?? null,
      phone: pic.pic_wa ?? null,
      email: pic.pic_email ?? null,
    },
  });
  await prisma.contactOrganizationRelationship.create({
    data: {
      contact_id: contact.id,
      organization_id: organizationId,
      is_primary: true,
    },
  });
}
