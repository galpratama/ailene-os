// Which access roles a given actor role is allowed to grant (invite or edit).
const GRANTABLE_ROLES: Record<string, string[]> = {
  "Super Admin": [
    "Super Admin",
    "Administrator",
    "Manager",
    "Staff",
    "Trainer",
    "Business Development",
  ],
  Administrator: ["Manager", "Staff", "Trainer", "Business Development"],
};

export function canGrantRole(
  actorRoleName: string,
  targetRoleName: string
): boolean {
  return GRANTABLE_ROLES[actorRoleName]?.includes(targetRoleName) ?? false;
}

export function grantableRoleNames(actorRoleName: string): string[] {
  return GRANTABLE_ROLES[actorRoleName] ?? [];
}
