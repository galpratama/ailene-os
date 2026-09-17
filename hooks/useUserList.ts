"use client";

import type { UserEntry } from "@/apis/users";
import { listUsers } from "@/lib/actions";
import { useEffect, useState } from "react";

// Owner/assignee pickers want the whole roster in one go; the API caps a page at 100.
export function useUserList(enabled: boolean) {
  const [users, setUsers] = useState<UserEntry[]>([]);

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    listUsers({ page: 1, page_size: 100 }).then((result) => {
      if (active) setUsers(result.data?.list ?? []);
    });
    return () => {
      active = false;
    };
  }, [enabled]);

  return users;
}
