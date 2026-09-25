"use client";

import type { AppSelectOption } from "@/components/fields/AppSelect";
import { useSession } from "@/contexts/SessionContext";
import { useUserList } from "@/hooks/useUserList";

// The API assigns an empty pick to the caller unless they are global-scoped, so name it accordingly.
export function useAssigneeOptions(enabled: boolean): AppSelectOption[] {
  const sessionUser = useSession();
  const userList = useUserList(enabled && sessionUser?.data_scope !== "OWN");
  const emptyLabel = sessionUser?.data_scope === "GLOBAL" ? "Unassigned" : "Me";
  return [
    { value: "", label: emptyLabel },
    ...userList.map((u) => ({ value: u.id, label: u.full_name })),
  ];
}
