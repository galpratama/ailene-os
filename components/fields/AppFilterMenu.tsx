"use client";

import AppButton from "@/components/buttons/AppButton";
import AppDateRangeFilter from "@/components/fields/AppDateRangeFilter";
import AppSelect, { type AppSelectOption } from "@/components/fields/AppSelect";
import { formatDayRange } from "@/lib/date-range";
import { ListFilter, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

// Keyed by the API field name, so a page holds one state object for all filters.
export type FilterValues = Record<string, string>;

export type FilterField =
  | {
      kind: "select";
      key: string;
      label: string;
      placeholder: string;
      options: AppSelectOption[];
    }
  | {
      // `key` only identifies the chip; the two bounds live under their own keys.
      kind: "date-range";
      key: string;
      label: string;
      fromKey: string;
      toKey: string;
    };

type FilterChip = {
  key: string;
  label: string;
  text: string;
  clears: string[];
};

// A date range counts as one filter, so the badge matches the chips on screen.
function activeChips(fields: FilterField[], values: FilterValues): FilterChip[] {
  const chips: FilterChip[] = [];
  for (const field of fields) {
    if (field.kind === "select") {
      const value = values[field.key];
      if (!value) continue;
      const option = field.options.find((entry) => entry.value === value);
      chips.push({
        key: field.key,
        label: field.label,
        text: option?.label ?? value,
        clears: [field.key],
      });
      continue;
    }
    const from = values[field.fromKey] ?? "";
    const to = values[field.toKey] ?? "";
    if (!from && !to) continue;
    chips.push({
      key: field.key,
      label: field.label,
      text: formatDayRange(from, to),
      clears: [field.fromKey, field.toKey],
    });
  }
  return chips;
}

function cleared(values: FilterValues, keys: string[]) {
  return { ...values, ...Object.fromEntries(keys.map((key) => [key, ""])) };
}

// Every filter in one dropdown; it shows how many are on, `AppFilterChips` which.
export default function AppFilterMenu({
  menuId,
  fields,
  values,
  onChange,
  className,
}: {
  menuId: string;
  fields: FilterField[];
  values: FilterValues;
  onChange: (next: FilterValues) => void;
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const chips = activeChips(fields, values);

  return (
    <div className={`relative shrink-0 ${className ?? ""}`} ref={containerRef}>
      <AppButton
        variant="outline"
        size="md"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-controls={menuId}
      >
        <ListFilter size={14} />
        Filters
        {chips.length > 0 && (
          <span className="flex size-5 items-center justify-center rounded-full bg-claude text-[11px] font-bold text-white">
            {chips.length}
          </span>
        )}
      </AppButton>

      {isOpen && (
        <div
          id={menuId}
          className="absolute left-0 top-full z-30 mt-2 w-80 rounded-xl border border-gray-300 bg-card-bg p-4 shadow-md dark:border-zinc-700"
        >
          <div className="flex flex-col gap-3">
            {fields.map((field) =>
              field.kind === "select" ? (
                <AppSelect
                  key={field.key}
                  selectId={`${menuId}-${field.key}`}
                  label={field.label}
                  placeholder={field.placeholder}
                  value={values[field.key] ?? ""}
                  options={field.options}
                  onChange={(value) => onChange({ ...values, [field.key]: (value as string) ?? "" })}
                />
              ) : (
                <AppDateRangeFilter
                  key={field.key}
                  fieldId={`${menuId}-${field.key}`}
                  label={field.label}
                  from={values[field.fromKey] ?? ""}
                  to={values[field.toKey] ?? ""}
                  onChange={(range) =>
                    onChange({ ...values, [field.fromKey]: range.from, [field.toKey]: range.to })
                  }
                />
              )
            )}
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-3 dark:border-zinc-800">
            <span className="text-xs text-gray-500">
              {chips.length === 0
                ? "No filters applied"
                : `${chips.length} filter${chips.length > 1 ? "s" : ""} applied`}
            </span>
            <AppButton
              variant="ghost"
              size="sm"
              disabled={chips.length === 0}
              onClick={() => onChange(cleared(values, chips.flatMap((chip) => chip.clears)))}
            >
              Reset
            </AppButton>
          </div>
        </div>
      )}
    </div>
  );
}

// Applied filters on their own row, so the toolbar height never shifts.
export function AppFilterChips({
  fields,
  values,
  onChange,
  className,
}: {
  fields: FilterField[];
  values: FilterValues;
  onChange: (next: FilterValues) => void;
  className?: string;
}) {
  const chips = activeChips(fields, values);
  if (chips.length === 0) return null;

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className ?? ""}`}>
      {chips.map((chip) => (
        <AppButton
          key={chip.key}
          variant="outline"
          size="sm"
          className="max-w-64 rounded-full"
          onClick={() => onChange(cleared(values, chip.clears))}
          title={`Remove the ${chip.label.toLowerCase()} filter`}
          aria-label={`Remove the ${chip.label.toLowerCase()} filter`}
        >
          <span className="shrink-0">{chip.label}:</span>
          <span className="truncate font-bold text-gray-900 dark:text-zinc-100">{chip.text}</span>
          <X size={12} className="shrink-0" />
        </AppButton>
      ))}
      {chips.length > 1 && (
        <AppButton
          variant="ghost"
          size="sm"
          onClick={() => onChange(cleared(values, chips.flatMap((chip) => chip.clears)))}
        >
          Clear all
        </AppButton>
      )}
    </div>
  );
}
