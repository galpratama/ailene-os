"use client";

import AppButton from "@/components/buttons/AppButton";
import { Loader2, X } from "lucide-react";
import { useEffect } from "react";

export default function PdfPreviewModalOS({
  isOpen,
  url,
  title,
  onClose,
}: {
  isOpen: boolean;
  url: string | null;
  title: string;
  onClose: () => void;
}) {
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 py-6"
      onClick={onClose}
    >
      <div
        className="flex h-full w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-gray-300 bg-card-bg shadow-xl dark:border-zinc-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-5 py-3 dark:border-zinc-800">
          <h2 className="truncate text-sm font-bold text-gray-900 dark:text-zinc-100">
            {title}
          </h2>
          <AppButton
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={16} />
          </AppButton>
        </div>
        <div className="min-h-0 flex-1 bg-gray-100 dark:bg-zinc-950">
          {url ? (
            <iframe src={url} title={title} className="h-full w-full" />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Loader2 size={24} className="animate-spin text-gray-400" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
