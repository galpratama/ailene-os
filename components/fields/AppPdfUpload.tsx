"use client";

import AppButton from "@/components/buttons/AppButton";
import { fieldLabelClass } from "@/lib/field-styles";
import { compressPdf } from "@/lib/pdf-compression";
import { SUPABASE_BUCKET, getSupabase } from "@/lib/supabase";
import { showErrorToast } from "@/lib/toast";
import { FileText, Loader2, Trash2, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const PDF_MIME_TYPE = "application/pdf";

function fileSize(value: number) {
  return `${(value / 1024 / 1024).toFixed(1)} MB`;
}

async function isPdf(file: File) {
  const header = new Uint8Array(await file.slice(0, 5).arrayBuffer());
  return new TextDecoder().decode(header) === "%PDF-";
}

export default function AppPdfUpload({
  inputId,
  label,
  value,
  onChange,
  folderPath,
  maxBytes,
  maxSizeLabel,
  disabled = false,
  onBusyChange,
}: {
  inputId: string;
  label: string;
  value: string;
  onChange: (url: string) => void;
  folderPath: string;
  maxBytes: number;
  maxSizeLabel: string;
  disabled?: boolean;
  onBusyChange?: (busy: boolean) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const operationRef = useRef(0);
  const [isUploading, setIsUploading] = useState(false);
  const [stage, setStage] = useState<"compressing" | "uploading">(
    "compressing",
  );
  const [uploadedSize, setUploadedSize] = useState<number | null>(null);

  useEffect(() => () => {
    operationRef.current += 1;
  }, []);

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || disabled || isUploading) return;

    const extension = file.name.split(".").pop()?.toLowerCase();
    if (
      extension !== "pdf" ||
      (file.type && file.type !== PDF_MIME_TYPE) ||
      !(await isPdf(file))
    ) {
      return showErrorToast("Only a valid PDF document can be uploaded.");
    }
    if (file.size > maxBytes) {
      return showErrorToast(`PDF must be smaller than ${maxSizeLabel}.`);
    }

    setIsUploading(true);
    setStage("compressing");
    onBusyChange?.(true);
    const operation = ++operationRef.current;
    try {
      const uploadFile = await compressPdf(file);
      if (operation !== operationRef.current) return;
      setStage("uploading");

      const supabase = getSupabase();
      const path = `${folderPath}/${crypto.randomUUID()}.pdf`;
      const { error } = await supabase.storage
        .from(SUPABASE_BUCKET)
        .upload(path, uploadFile, {
          cacheControl: "3600",
          contentType: PDF_MIME_TYPE,
          upsert: false,
        });
      if (operation !== operationRef.current) return;
      if (error) return showErrorToast(`Upload failed: ${error.message}`);

      setUploadedSize(uploadFile.size);
      onChange(
        supabase.storage.from(SUPABASE_BUCKET).getPublicUrl(path).data
          .publicUrl,
      );
    } catch (error) {
      if (operation === operationRef.current) {
        showErrorToast(
          error,
          "The PDF could not be compressed. Make sure it is valid and not password-protected.",
        );
      }
    } finally {
      if (operation === operationRef.current) {
        setIsUploading(false);
        onBusyChange?.(false);
      }
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className={fieldLabelClass}>
        {label}
      </label>
      <div className="flex min-h-24 items-center gap-3 rounded-xl border border-dashed border-line bg-gray-50 p-3 dark:bg-zinc-800">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-merah-t text-merah">
          {isUploading ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <FileText size={20} />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-gray-800 dark:text-zinc-200">
            {isUploading
              ? stage === "compressing"
                ? "Compressing PDF..."
                : "Uploading PDF..."
              : value
                ? "PDF document attached"
                : "Upload supporting document"}
          </p>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-zinc-400">
            {uploadedSize && value
              ? `${fileSize(uploadedSize)} after compression`
              : `PDF only, maximum ${maxSizeLabel}. Compressed before upload.`}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <AppButton
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled || isUploading}
              onClick={() => inputRef.current?.click()}
            >
              <Upload size={13} /> {value ? "Replace PDF" : "Upload PDF"}
            </AppButton>
            {value && (
              <AppButton
                type="button"
                variant="dangerWhite"
                size="sm"
                disabled={disabled || isUploading}
                onClick={() => {
                  setUploadedSize(null);
                  onChange("");
                }}
              >
                <Trash2 size={13} /> Remove
              </AppButton>
            )}
          </div>
        </div>
      </div>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        disabled={disabled || isUploading}
        onChange={handleFile}
      />
    </div>
  );
}
