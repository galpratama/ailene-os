"use client";

import { ChevronDown } from "lucide-react";
import Image from "next/image";
import { ReactNode, useEffect, useRef, useState } from "react";
import { fieldLabelClass, fieldOptionActiveClass } from "@/lib/field-styles";

export interface AppSelectOption {
  label: string;
  value: string | number | null;
  image?: string;
}

interface AppSelectProps {
  selectId: string;
  label?: string;
  icon?: ReactNode;
  placeholder: string;
  value: string | number | null;
  onChange?: (value: string | number | null) => void;
  disabled?: boolean;
  required?: boolean;
  options?: AppSelectOption[];
  onOpenChange?: (open: boolean) => void;
}

export default function AppSelect({
  selectId,
  label,
  icon,
  placeholder,
  value,
  onChange,
  disabled,
  required,
  options = [],
  onOpenChange,
}: AppSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onOpenChange?.(isOpen);
  }, [isOpen, onOpenChange]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="flex flex-col gap-1.5" ref={containerRef}>
      {label && (
        <label htmlFor={selectId} className={fieldLabelClass}>
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div
        id={selectId}
        className={[
          "relative flex h-9 w-full items-center rounded-lg border bg-gray-50 px-3 text-sm transition dark:bg-zinc-800",
          isOpen
            ? "border-claude ring-2 ring-claude/30"
            : "border-gray-300 dark:border-zinc-700",
          disabled
            ? "cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-zinc-900 dark:text-zinc-600"
            : "cursor-pointer",
          icon ? "pl-9" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        onClick={() => {
          if (!disabled) setIsOpen((prev) => !prev);
        }}
      >
        {icon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 dark:text-zinc-500">
            {icon}
          </div>
        )}

        <div className="flex items-center gap-2 truncate">
          {selectedOption?.image && (
            <div className="flex aspect-square size-5 overflow-hidden rounded-full">
              <Image
                className="h-full w-full object-cover"
                src={selectedOption.image}
                alt={selectedOption.label}
                width={100}
                height={100}
              />
            </div>
          )}
          <span
            className={`block truncate ${selectedOption ? "text-gray-900 dark:text-zinc-100" : "text-gray-400 dark:text-zinc-500"}`}
          >
            {selectedOption?.label || placeholder}
          </span>
        </div>

        {!disabled && (
          <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500">
            <ChevronDown className="size-4" />
          </div>
        )}

        {isOpen && !disabled && (
          <div className="absolute left-0 top-full z-30 mt-2 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md dark:border-zinc-700 dark:bg-zinc-800">
            <ul className="flex max-h-60 flex-col overflow-auto text-sm">
              {options.map((opt, index) => (
                <li
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange?.(opt.value);
                    setIsOpen(false);
                  }}
                  className={`flex cursor-pointer items-center gap-2 px-3 py-2 hover:bg-claude/10 hover:text-claude ${
                    value === opt.value ? fieldOptionActiveClass : "text-gray-900 dark:text-zinc-100"
                  }`}
                >
                  {opt.image && (
                    <div className="flex aspect-square size-[26px] overflow-hidden rounded-full">
                      <Image
                        className="h-full w-full object-cover"
                        src={opt.image}
                        alt={opt.label}
                        width={100}
                        height={100}
                      />
                    </div>
                  )}
                  {opt.label}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
