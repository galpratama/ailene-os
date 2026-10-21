"use client";

import AppImageUpload from "@/components/fields/AppImageUpload";

const LOGO_COMPRESSION = { maxDimension: 512, maxBytes: 150 * 1024 };

export default function CompanyLogoUploadOS({
  inputId,
  value,
  onChange,
  onBusyChange,
  disabled,
}: {
  inputId: string;
  value: string;
  onChange: (url: string) => void;
  onBusyChange: (busy: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <AppImageUpload
      inputId={inputId}
      label="Company logo"
      value={value}
      onChange={onChange}
      onBusyChange={onBusyChange}
      disabled={disabled}
      folderPath="companies/logos"
      maxBytes={10 * 1024 * 1024}
      maxSizeLabel="10 MB"
      aspectRatio="1/1"
      imageFit="cover"
      compact
      layout="horizontal"
      compression={LOGO_COMPRESSION}
    />
  );
}
