"use client";

import type { ListTasksOptions, TaskPriority, TaskStatus } from "@/apis/tasks";
import type { FilterField, FilterValues } from "@/components/fields/AppFilterMenu";
import { editStatusOptions, priorityOptions, statusOptions } from "@/components/forms/CreateTaskFormOS";
import { useSession } from "@/contexts/SessionContext";
import { useUserList } from "@/hooks/useUserList";
import { userSelectOption } from "@/lib/user-select-option";
import { useState } from "react";

// Calendar and table include archived tasks; the kanban only offers active statuses.
export function useTaskFilters({ includeArchived }: { includeArchived: boolean }) {
  const sessionUser = useSession();
  const isOwnScoped = sessionUser?.data_scope === "own";

  // Open on your own tasks; own-scoped users are already limited by the API and have no PIC filter.
  const [values, setValues] = useState<FilterValues>(() =>
    sessionUser && !isOwnScoped ? { assignee_id: sessionUser.id } : ({} as FilterValues)
  );

  // Tasks can stay with people who have since left, so every user is a PIC option.
  const userList = useUserList(!isOwnScoped);

  const fields: FilterField[] = [
    {
      kind: "select",
      key: "status",
      label: "Status",
      placeholder: "All Statuses",
      options: [{ value: "", label: "All Statuses" }, ...(includeArchived ? editStatusOptions : statusOptions)],
    },
    {
      kind: "select",
      key: "priority",
      label: "Priority",
      placeholder: "All Priorities",
      options: [{ value: "", label: "All Priorities" }, ...priorityOptions],
    },
    ...(isOwnScoped
      ? []
      : [
          {
            kind: "select" as const,
            key: "assignee_id",
            label: "PIC",
            placeholder: "All PICs",
            options: [
              { value: "", label: "All PICs" },
              ...userList.map(userSelectOption),
            ],
          },
        ]),
    { kind: "date-range", key: "end", label: "End Date", fromKey: "end_from", toKey: "end_to" },
  ];

  const apiFilters: Omit<ListTasksOptions, "keyword" | "page" | "page_size"> = {
    status: (values.status || undefined) as TaskStatus | undefined,
    priority: (values.priority || undefined) as TaskPriority | undefined,
    assignee_id: isOwnScoped ? undefined : values.assignee_id || undefined,
    end_from: values.end_from || undefined,
    end_to: values.end_to || undefined,
  };

  return { fields, values, setValues, apiFilters };
}
