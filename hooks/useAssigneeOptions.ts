"use client";

import type { AppSelectOption } from "@/components/fields/AppSelect";
import { useSession } from "@/contexts/SessionContext";
import { useUserList } from "@/hooks/useUserList";
import { userSelectOption } from "@/lib/user-select-option";

// The API assigns an empty pick to the caller unless they are global-scoped, so name it accordingly.
export function useAssigneeOptions(enabled: boolean): AppSelectOption[] {
  const sessionUser = useSession();
  const userList = useUserList(enabled && sessionUser?.data_scope !== "OWN");
  const emptyLabel = sessionUser?.data_scope === "GLOBAL" ? "Unassigned" : "Me";
  const emptyOption: AppSelectOption =
    sessionUser?.data_scope === "GLOBAL"
      ? { value: "", label: emptyLabel }
      : {
          value: "",
          label: emptyLabel,
          avatar: sessionUser?.avatar ?? null,
          avatarName: sessionUser?.full_name,
        };
  return [
    emptyOption,
    ...userList.map(userSelectOption),
  ];
}
