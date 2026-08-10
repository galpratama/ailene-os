import { UserAccountStatusEnum } from "@prisma/client";

// Account lifecycle: Invited->Active->Suspended->Active/Deactivated->Archived (Invited->Deactivated also allowed).
const ALLOWED_STATUS_TRANSITIONS: Record<
  UserAccountStatusEnum,
  UserAccountStatusEnum[]
> = {
  INVITED: ["ACTIVE", "DEACTIVATED"],
  ACTIVE: ["SUSPENDED", "DEACTIVATED"],
  SUSPENDED: ["ACTIVE", "DEACTIVATED"],
  DEACTIVATED: ["ARCHIVED"],
  ARCHIVED: [],
};

export function isValidStatusTransition(
  from: UserAccountStatusEnum,
  to: UserAccountStatusEnum
): boolean {
  return ALLOWED_STATUS_TRANSITIONS[from].includes(to);
}
