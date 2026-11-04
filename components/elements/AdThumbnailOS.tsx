"use client";

import { ImageOff } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

// Meta thumbnail URLs are signed and expire, so a failed load falls back to a neutral tile instead of a broken image.
export default function AdThumbnailOS({ url, size = 28 }: { url: string | null; size?: number }) {
  const [failed, setFailed] = useState(false);
  if (!url || failed) {
    return (
      <div className="flex shrink-0 items-center justify-center rounded-lg border border-line-soft bg-gray-50 text-gray-400 dark:bg-zinc-800 dark:text-zinc-500" style={{ width: size, height: size }} aria-hidden="true">
        <ImageOff size={Math.round(size / 2.2)} />
      </div>
    );
  }
  return <Image src={url} alt="" width={size} height={size} unoptimized onError={() => setFailed(true)} className="shrink-0 rounded-lg border border-line-soft object-cover" style={{ width: size, height: size }} />;
}
