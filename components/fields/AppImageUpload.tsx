"use client";

import AppButton from "@/components/buttons/AppButton";
import { fieldLabelClass } from "@/lib/field-styles";
import { SUPABASE_BUCKET, getSupabase } from "@/lib/supabase";
import { showErrorToast } from "@/lib/toast";
import { compressImage, type ImageCompressionOptions } from "@/lib/image-compression";
import { ImagePlus, Loader2, Trash2, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "avif"];

interface AppImageUploadProps {
  inputId: string;
  label?: string;
  required?: boolean;
  value: string;
  onChange: (url: string) => void;
  // Folder inside the bucket, e.g. "articles".
  folderPath: string;
  maxBytes: number;
  maxSizeLabel: string;
  // CSS aspect-ratio value, e.g. "16/9".
  aspectRatio: string;
  compression?: ImageCompressionOptions;
  imageFit?: "cover" | "contain";
  compact?: boolean;
  layout?: "stacked" | "horizontal";
  disabled?: boolean;
  onBusyChange?: (busy: boolean) => void;
}

// Optionally compresses images, uploads to Supabase Storage, and returns the public URL.
export default function AppImageUpload({
  inputId,
  label,
  required,
  value,
  onChange,
  folderPath,
  maxBytes,
  maxSizeLabel,
  aspectRatio,
  compression,
  imageFit = "cover",
  compact = false,
  layout = "stacked",
  disabled = false,
  onBusyChange,
}: AppImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const operationRef = useRef(0);

  useEffect(() => () => { operationRef.current += 1; }, []);

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    // Reset so picking the same file again still fires onChange.
    event.target.value = "";
    if (!file || disabled || isUploading) return;

    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!ALLOWED_TYPES.includes(file.type) || !extension || !ALLOWED_EXTENSIONS.includes(extension)) {
      return showErrorToast("Only JPG, PNG, WEBP, or AVIF images are allowed.");
    }
    if (file.size > maxBytes) {
      return showErrorToast(`Image must be smaller than ${maxSizeLabel}.`);
    }

    setIsUploading(true);
    onBusyChange?.(true);
    const operation = ++operationRef.current;
    try {
      setIsCompressing(!!compression);
      const uploadFile = compression ? await compressImage(file, compression) : file;
      if (operation !== operationRef.current) return;
      setIsCompressing(false);
      const supabase = getSupabase();
      const outputExtension = uploadFile.name.split(".").pop()?.toLowerCase();
      const path = `${folderPath}/${crypto.randomUUID()}.${outputExtension}`;
      const { error: uploadError } = await supabase.storage
        .from(SUPABASE_BUCKET)
        .upload(path, uploadFile, { contentType: uploadFile.type, cacheControl: "3600", upsert: false });
      if (operation !== operationRef.current) return;
      if (uploadError) {
        return showErrorToast(`Upload failed: ${uploadError.message}`);
      }
      onChange(supabase.storage.from(SUPABASE_BUCKET).getPublicUrl(path).data.publicUrl);
    } catch (e) {
      if (operation === operationRef.current) showErrorToast(e, "Upload failed.");
    } finally {
      if (operation === operationRef.current) {
        setIsCompressing(false);
        setIsUploading(false);
        onBusyChange?.(false);
      }
    }
  }

  return (
    <div className={layout === "horizontal" ? "flex items-center gap-4" : "flex flex-col gap-1.5"}>
      {label && layout === "stacked" && (
        <label htmlFor={inputId} className={fieldLabelClass}>
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div
        className={`relative overflow-hidden rounded-xl border border-dashed border-line bg-gray-50 dark:bg-zinc-800 ${layout === "horizontal" ? "w-24 shrink-0" : "w-full"}`}
        style={{ aspectRatio }}
      >
        {value ? (
          <>
            <Image src={value} alt="Uploaded image" fill className={imageFit === "contain" ? "object-contain p-3" : "object-cover"} />
            {layout === "stacked" && (
              <>
                <AppButton
                  type="button"
                  variant="white"
                  size="iconSm"
                  title="Replace image"
                  disabled={isUploading || disabled}
                  onClick={() => inputRef.current?.click()}
                  className="absolute bottom-2 right-2"
                >
                  <ImagePlus size={13} />
                </AppButton>
                <AppButton
                  type="button"
                  variant="dangerWhite"
                  size="iconSm"
                  title="Remove image"
                  disabled={isUploading || disabled}
                  onClick={() => onChange("")}
                  className="absolute right-2 top-2"
                >
                  <X size={13} />
                </AppButton>
              </>
            )}
          </>
        ) : (
          // The whole empty area is the file input's label, so clicking anywhere opens the picker.
          <label
            htmlFor={inputId}
            className={`flex h-full w-full flex-col items-center justify-center gap-2 px-3 text-center text-gray-500 dark:text-zinc-400 ${isUploading ? "cursor-wait" : disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-700/50"}`}
          >
            {isUploading ? (
              <Loader2 size={compact ? 20 : 24} className="animate-spin" />
            ) : (
              <ImagePlus size={compact ? 20 : 24} />
            )}
            <span className={`${compact ? "text-xs" : "text-sm"} font-semibold text-gray-700 dark:text-zinc-200`}>
              {isUploading ? (isCompressing ? "Compressing..." : "Uploading...") : compact ? "Upload" : "Upload image"}
            </span>
            {!compact && (
              <span className="text-xs">
                {imageFit === "cover" ? `${aspectRatio} ratio, ` : ""}JPG/PNG/WEBP/AVIF, under {maxSizeLabel}
              </span>
            )}
          </label>
        )}
        {value && isUploading && (
          <div role="status" className={`absolute inset-0 flex flex-col items-center justify-center gap-2 bg-card-bg/90 ${compact ? "text-xs" : "text-sm"} text-gray-600 dark:text-zinc-300`}>
            <Loader2 size={compact ? 20 : 24} className="animate-spin" />
            {isCompressing ? "Compressing..." : "Uploading..."}
          </div>
        )}
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,.avif"
          className="hidden"
          disabled={isUploading || disabled}
          onChange={handleFile}
        />
      </div>
      {layout === "horizontal" && (
        <div className="flex min-w-0 flex-1 flex-col items-start gap-2">
          {label && (
            <label htmlFor={inputId} className={fieldLabelClass}>
              {label}
              {required && <span className="text-red-500">*</span>}
            </label>
          )}
          <div className="flex flex-wrap gap-2">
            <AppButton type="button" variant="outline" size="sm" disabled={isUploading || disabled} onClick={() => inputRef.current?.click()}>
              <ImagePlus size={14} />
              {value ? "Change" : "Upload"}
            </AppButton>
            {value && (
              <AppButton type="button" variant="dangerWhite" size="sm" disabled={isUploading || disabled} onClick={() => onChange("")}>
                <Trash2 size={14} />
                Delete
              </AppButton>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
