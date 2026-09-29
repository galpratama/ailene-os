"use client";

import AppButton from "@/components/buttons/AppButton";
import { Maximize2, X } from "lucide-react";
import { ReactNode, useEffect } from "react";

interface SheetOSProps {
  title: string;
  description?: string;
  isOpen: boolean;
  onClose: () => void;
  // Renders an "open full page" icon next to the close button.
  fullPageHref?: string;
  children: ReactNode;
}

// Right-side slide-over sheet used for create/edit forms across the OS app.
export default function SheetOS({
  title,
  description,
  isOpen,
  onClose,
  fullPageHref,
  children,
}: SheetOSProps) {
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/30"
      onClick={onClose}
    >
      <div
        className="relative flex h-full w-full max-w-md flex-col bg-white border-l border-line shadow-xl dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-line-soft px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-100">{title}</h2>
            {description && (
              <p className="mt-0.5 text-sm text-gray-500 dark:text-zinc-400">{description}</p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {fullPageHref && (
              <AppButton
                variant="ghost"
                size="iconSm"
                href={fullPageHref}
                title="Open full page"
              >
                <Maximize2 size={14} />
              </AppButton>
            )}
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
            >
              <X size={16} />
            </button>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
