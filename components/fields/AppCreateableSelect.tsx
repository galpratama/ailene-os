"use client";

import { Building2, Loader2, Plus } from "lucide-react";
import Image from "next/image";
import { createContext, ReactNode, useContext, useRef, useState } from "react";
import CreatableSelect from "react-select/creatable";
import { components as SelectComponents, type MenuListProps } from "react-select";
import { fieldLabelClass } from "@/lib/field-styles";

export interface AppCreateableOption {
  label: string;
  value: string | number;
  image?: string | null;
}

export interface AppLoadOptionsResult {
  options: AppCreateableOption[];
  hasMore: boolean;
}

// Hoisted so react-select doesn't remount MenuList (which resets scroll) each render.
const IsLoadingMoreContext = createContext(false);

function MenuListWithLoader(props: MenuListProps<AppCreateableOption, false>) {
  const isLoadingMore = useContext(IsLoadingMoreContext);
  return (
    <SelectComponents.MenuList {...props}>
      {props.children}
      {isLoadingMore && (
        <div className="flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-400">
          <Loader2 className="size-4 animate-spin" />
          Loading...
        </div>
      )}
    </SelectComponents.MenuList>
  );
}

const selectComponents = { MenuList: MenuListWithLoader };

interface AppCreateableSelectProps {
  selectId: string;
  label?: string;
  icon?: ReactNode;
  placeholder?: string;
  value: AppCreateableOption | null;
  onChange: (option: AppCreateableOption | null) => void;
  loadOptions: (inputValue: string, page: number) => Promise<AppLoadOptionsResult>;
  defaultOptions?: AppCreateableOption[];
  debounceMs?: number;
  required?: boolean;
  disabled?: boolean;
  noOptionsMessage?: string;
  onCreateOption?: (inputValue: string) => Promise<AppCreateableOption | null>;
  createLabel?: (inputValue: string) => string;
}

export default function AppCreateableSelect({
  selectId,
  label,
  icon,
  placeholder = "Search...",
  value,
  onChange,
  loadOptions,
  defaultOptions = [],
  debounceMs = 0,
  required,
  disabled,
  noOptionsMessage = "No results found.",
  onCreateOption,
  createLabel = (inputValue) => `Add "${inputValue}"`,
}: AppCreateableSelectProps) {
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState<AppCreateableOption[]>(defaultOptions);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const requestIdRef = useRef(0);

  async function fetchPage(query: string, pageToLoad: number) {
    const requestId = ++requestIdRef.current;
    const setLoadingState = pageToLoad === 1 ? setIsLoading : setIsLoadingMore;
    setLoadingState(true);

    try {
      const result = await loadOptions(query, pageToLoad);
      if (requestId !== requestIdRef.current) return;

      setOptions((prev) =>
        pageToLoad === 1 ? result.options : [...prev, ...result.options]
      );
      setHasMore(result.hasMore);
      setPage(pageToLoad);
    } finally {
      if (requestId === requestIdRef.current) setLoadingState(false);
    }
  }

  function handleInputChange(nextValue: string, meta: { action: string }) {
    if (meta.action !== "input-change") return;
    setInputValue(nextValue);

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchPage(nextValue, 1);
    }, debounceMs);
  }

  function handleMenuScrollToBottom() {
    if (!hasMore || isLoading || isLoadingMore) return;
    fetchPage(inputValue, page + 1);
  }

  function handleChange(option: AppCreateableOption | null) {
    onChange(option);
    setInputValue("");
    fetchPage("", 1);
  }

  async function handleCreateOption(rawValue: string) {
    if (!onCreateOption) return;
    const name = rawValue.trim();
    if (!name) return;

    setIsCreating(true);
    try {
      const created = await onCreateOption(name);
      if (created) handleChange(created);
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={selectId} className={fieldLabelClass}>
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <IsLoadingMoreContext.Provider value={isLoadingMore}>
        <div className="relative">
          {icon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-3 text-gray-400">
              {icon}
            </div>
          )}
          <CreatableSelect<AppCreateableOption, false>
            inputId={selectId}
            instanceId={selectId}
            isDisabled={disabled}
            value={value}
            inputValue={inputValue}
            onInputChange={handleInputChange}
            onChange={handleChange}
            isClearable
            options={options}
            filterOption={null}
            isLoading={isLoading || isCreating}
            onMenuScrollToBottom={handleMenuScrollToBottom}
            isValidNewOption={(input) =>
              Boolean(onCreateOption) &&
              options.length === 0 &&
              !isLoading &&
              !isCreating &&
              input.trim().length > 0
            }
            onCreateOption={handleCreateOption}
            formatCreateLabel={createLabel}
            placeholder={placeholder}
            loadingMessage={() => "Searching..."}
            noOptionsMessage={() => noOptionsMessage}
            menuPortalTarget={
              typeof document !== "undefined" ? document.body : undefined
            }
            formatOptionLabel={(
              option: AppCreateableOption & { __isNew__?: boolean }
            ) => {
              if (option.__isNew__) {
                return (
                  <span className="flex items-center gap-2 text-claude">
                    <Plus className="size-4" />
                    {option.label}
                  </span>
                );
              }

              return (
                <div className="flex items-center gap-2">
                  <span className="flex size-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100">
                    {option.image ? (
                      <Image
                        className="h-full w-full object-cover"
                        src={option.image}
                        alt={option.label}
                        width={24}
                        height={24}
                      />
                    ) : (
                      <Building2 className="size-3.5 text-gray-400" />
                    )}
                  </span>
                  <span className="truncate">{option.label}</span>
                </div>
              );
            }}
            components={selectComponents}
            unstyled
            classNames={{
              control: ({ isFocused }) =>
                `cursor-pointer rounded-lg border bg-gray-50 px-2 py-1 text-sm transition ${
                  isFocused ? "border-claude ring-2 ring-claude/30" : "border-gray-300"
                } ${icon ? "pl-7" : ""}`,
              valueContainer: () => "cursor-pointer px-1 py-0.5",
              placeholder: () => "cursor-pointer px-1 text-sm text-gray-400",
              input: () => "cursor-pointer px-1 text-sm text-gray-900",
              singleValue: () => "cursor-pointer px-1 text-sm text-gray-900",
              indicatorsContainer: () => "cursor-pointer text-gray-400",
              indicatorSeparator: () => "hidden",
              dropdownIndicator: () => "cursor-pointer px-1",
              clearIndicator: () => "cursor-pointer px-1 hover:text-red-600",
              menuPortal: () => "z-50",
              menu: () =>
                "z-30 mt-1 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md",
              menuList: () => "max-h-60 overflow-y-auto p-1",
              option: ({ isFocused }) =>
                `cursor-pointer rounded-md px-3 py-2 text-sm ${
                  isFocused ? "bg-claude/10 text-claude" : "text-gray-900"
                }`,
              noOptionsMessage: () => "p-2 text-sm text-gray-400",
              loadingMessage: () => "p-2 text-sm text-gray-400",
            }}
          />
        </div>
      </IsLoadingMoreContext.Provider>
    </div>
  );
}
