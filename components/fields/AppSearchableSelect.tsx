"use client";

import { Loader2 } from "lucide-react";
import { createContext, ReactNode, useContext, useRef, useState } from "react";
import ReactSelect, { components as SelectComponents, type MenuListProps } from "react-select";
import { fieldLabelClass } from "@/lib/field-styles";

export interface AppSearchableOption {
  label: string;
  value: string | number;
}

export interface AppLoadOptionsResult {
  options: AppSearchableOption[];
  hasMore: boolean;
}

// Hoisted so react-select doesn't remount MenuList (which resets scroll) each render.
const IsLoadingMoreContext = createContext(false);

function MenuListWithLoader(props: MenuListProps<AppSearchableOption, false>) {
  const isLoadingMore = useContext(IsLoadingMoreContext);
  return (
    <SelectComponents.MenuList {...props}>
      {props.children}
      {isLoadingMore && (
        <div className="flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-400 dark:text-zinc-500">
          <Loader2 className="size-4 animate-spin" />
          Loading...
        </div>
      )}
    </SelectComponents.MenuList>
  );
}

const selectComponents = { MenuList: MenuListWithLoader };

interface AppSearchableSelectProps {
  selectId: string;
  label?: string;
  icon?: ReactNode;
  placeholder?: string;
  value: AppSearchableOption | null;
  onChange: (option: AppSearchableOption | null) => void;
  loadOptions: (inputValue: string, page: number) => Promise<AppLoadOptionsResult>;
  defaultOptions?: AppSearchableOption[];
  debounceMs?: number;
  required?: boolean;
  disabled?: boolean;
  noOptionsMessage?: string;
}

export default function AppSearchableSelect({
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
}: AppSearchableSelectProps) {
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState<AppSearchableOption[]>(defaultOptions);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

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

  function handleChange(option: AppSearchableOption | null) {
    onChange(option);
    setInputValue("");
    fetchPage("", 1);
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
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-3 text-gray-400 dark:text-zinc-500">
              {icon}
            </div>
          )}
          <ReactSelect<AppSearchableOption, false>
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
            isLoading={isLoading}
            onMenuScrollToBottom={handleMenuScrollToBottom}
            placeholder={placeholder}
            loadingMessage={() => "Searching..."}
            noOptionsMessage={() => noOptionsMessage}
            menuPortalTarget={
              typeof document !== "undefined" ? document.body : undefined
            }
            components={selectComponents}
            unstyled
            classNames={{
              control: ({ isFocused }) =>
                `cursor-pointer rounded-lg border bg-gray-50 px-2 py-1 text-sm transition dark:bg-zinc-800 ${
                  isFocused
                    ? "border-claude ring-2 ring-claude/30"
                    : "border-gray-300 dark:border-zinc-700"
                } ${icon ? "pl-7" : ""}`,
              valueContainer: () => "cursor-pointer px-1 py-0.5",
              placeholder: () => "cursor-pointer px-1 text-sm text-gray-400 dark:text-zinc-500",
              input: () => "cursor-pointer px-1 text-sm text-gray-900 dark:text-zinc-100",
              singleValue: () => "cursor-pointer px-1 text-sm text-gray-900 dark:text-zinc-100",
              indicatorsContainer: () => "cursor-pointer text-gray-400 dark:text-zinc-500",
              indicatorSeparator: () => "hidden",
              dropdownIndicator: () => "cursor-pointer px-1",
              clearIndicator: () => "cursor-pointer px-1 hover:text-red-600",
              menuPortal: () => "z-50",
              menu: () =>
                "z-30 mt-1 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md dark:border-zinc-700 dark:bg-zinc-800",
              menuList: () => "max-h-60 overflow-y-auto p-1",
              option: ({ isFocused }) =>
                `cursor-pointer rounded-md px-3 py-2 text-sm ${
                  isFocused ? "bg-claude/10 text-claude" : "text-gray-900 dark:text-zinc-100"
                }`,
              noOptionsMessage: () => "p-2 text-sm text-gray-400 dark:text-zinc-500",
              loadingMessage: () => "p-2 text-sm text-gray-400 dark:text-zinc-500",
            }}
          />
        </div>
      </IsLoadingMoreContext.Provider>
    </div>
  );
}
