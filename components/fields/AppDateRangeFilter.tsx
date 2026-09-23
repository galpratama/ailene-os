"use client";

import AppInput from "@/components/fields/AppInput";
import { fieldLabelClass } from "@/lib/field-styles";

// Two date inputs as one field; both ends inclusive, sent as plain YYYY-MM-DD.
export default function AppDateRangeFilter({
  fieldId,
  label,
  from,
  to,
  onChange,
}: {
  fieldId: string;
  label?: string;
  from: string;
  to: string;
  onChange: (range: { from: string; to: string }) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <span className={fieldLabelClass}>{label}</span>}
      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1">
          <AppInput
            inputId={`${fieldId}-from`}
            type="date"
            aria-label={label ? `${label} from` : "From"}
            value={from}
            max={to || undefined}
            onChange={(event) => onChange({ from: event.target.value, to })}
          />
        </div>
        <span className="shrink-0 text-xs text-gray-400">to</span>
        <div className="min-w-0 flex-1">
          <AppInput
            inputId={`${fieldId}-to`}
            type="date"
            aria-label={label ? `${label} to` : "To"}
            value={to}
            min={from || undefined}
            onChange={(event) => onChange({ from, to: event.target.value })}
          />
        </div>
      </div>
    </div>
  );
}
