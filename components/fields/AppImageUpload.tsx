"use client";

import AppButton from "@/components/buttons/AppButton";
import { fieldLabelClass } from "@/lib/field-styles";
import { SUPABASE_BUCKET, getSupabase } from "@/lib/supabase";
import { showErrorToast } from "@/lib/toast";
import { ImagePlus, Loader2, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

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
}

// Uploads straight to Supabase Storage and hands back the public URL.
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
}: AppImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    // Reset so picking the same file again still fires onChange.
    event.target.value = "";
    if (!file) return;

    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!ALLOWED_TYPES.includes(file.type) || !extension || !ALLOWED_EXTENSIONS.includes(extension)) {
      return showErrorToast("Only JPG, PNG, WEBP, or AVIF images are allowed.");
    }
    if (file.size > maxBytes) {
      return showErrorToast(`Image must be smaller than ${maxSizeLabel}.`);
    }

    setIsUploading(true);
    try {
      const supabase = getSupabase();
      const path = `${folderPath}/${Date.now()}.${extension}`;
      const { error: uploadError } = await supabase.storage
        .from(SUPABASE_BUCKET)
        .upload(path, file, { cacheControl: "3600", upsert: false });
      if (uploadError) {
        return showErrorToast(`Upload failed: ${uploadError.message}`);
      }
      onChange(supabase.storage.from(SUPABASE_BUCKET).getPublicUrl(path).data.publicUrl);
    } catch (e) {
      showErrorToast(e, "Upload failed.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className={fieldLabelClass}>
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div
        className="relative w-full overflow-hidden rounded-xl border border-dashed border-gray-300 bg-gray-50 dark:border-zinc-700 dark:bg-zinc-800"
        style={{ aspectRatio }}
      >
        {value ? (
          <>
            <Image src={value} alt="Uploaded image" fill className="object-cover" />
            <AppButton
              type="button"
              variant="outline"
              size="iconSm"
              title="Remove image"
              onClick={() => onChange("")}
              className="absolute right-2 top-2 text-red-600 dark:text-red-400"
            >
              <X size={13} />
            </AppButton>
          </>
        ) : (
          // The whole empty area is the file input's label, so clicking anywhere opens the picker.
          <label
            htmlFor={inputId}
            className={`flex h-full w-full flex-col items-center justify-center gap-2 text-center text-gray-500 dark:text-zinc-400 ${isUploading ? "cursor-wait" : "cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-700/50"}`}
          >
            {isUploading ? (
              <Loader2 size={24} className="animate-spin" />
            ) : (
              <ImagePlus size={24} />
            )}
            <span className="text-sm font-semibold text-gray-700 dark:text-zinc-200">
              {isUploading ? "Uploading..." : "Upload image"}
            </span>
            <span className="text-xs">
              {aspectRatio} ratio, JPG/PNG/WEBP/AVIF, under {maxSizeLabel}
            </span>
          </label>
        )}
        <input
          id={inputId}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,.avif"
          className="hidden"
          disabled={isUploading}
          onChange={handleFile}
        />
      </div>

    </div>
  );
}
