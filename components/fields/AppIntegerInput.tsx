"use client";

import AppNumberInput from "@/components/fields/AppNumberInput";
import { ComponentProps, useState } from "react";

type AppIntegerInputProps = Omit<
  ComponentProps<typeof AppNumberInput>,
  "value" | "onValueChange" | "mode"
> & {
  value: number;
  min?: number;
  onValueChange: (value: number) => void;
};

// Holds the typed text while editing, so the field can be cleared and retyped; below-min input snaps back on blur.
export default function AppIntegerInput({
  value,
  min = 0,
  onValueChange,
  onBlur,
  ...rest
}: AppIntegerInputProps) {
  const [draft, setDraft] = useState(String(value));
  const [syncedValue, setSyncedValue] = useState(value);
  if (value !== syncedValue) {
    setSyncedValue(value);
    setDraft(String(value));
  }

  return (
    <AppNumberInput
      {...rest}
      mode="numeric"
      value={draft}
      onValueChange={(text) => {
        setDraft(text);
        const parsed = parseInt(text, 10);
        if (!Number.isNaN(parsed) && parsed >= min && parsed !== value) {
          setSyncedValue(parsed);
          onValueChange(parsed);
        }
      }}
      onBlur={(event) => {
        const parsed = parseInt(draft, 10);
        const committed = Number.isNaN(parsed) ? value : Math.max(min, parsed);
        setDraft(String(committed));
        if (committed !== value) {
          setSyncedValue(committed);
          onValueChange(committed);
        }
        onBlur?.(event);
      }}
    />
  );
}
