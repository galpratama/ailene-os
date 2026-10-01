"use client";

import AppButton from "@/components/buttons/AppButton";
import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface ArticleBodyBIZProps {
  content: string;
  className?: string;
}

function getCodeText(block: HTMLElement) {
  const code = block.querySelector("code");
  if (code) return code.textContent ?? "";

  const contentClone = block.cloneNode(true) as HTMLElement;
  contentClone.querySelector("[data-article-code-copy]")?.remove();
  return contentClone.textContent ?? "";
}

async function copyText(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "fixed";
  textArea.style.opacity = "0";
  document.body.appendChild(textArea);
  textArea.select();
  document.execCommand("copy");
  textArea.remove();
}

// The API sanitizes article HTML on save. This component only adds copy controls to code blocks after it mounts.
export default function ArticleBodyBIZ({ content, className }: ArticleBodyBIZProps) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [codeBlocks, setCodeBlocks] = useState<HTMLElement[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    const body = bodyRef.current;
    if (!body) return;

    body.querySelectorAll<HTMLTableElement>("table").forEach((table) => {
      if (table.parentElement?.classList.contains("article-table-scroll")) return;

      const scrollArea = document.createElement("div");
      scrollArea.className = "article-table-scroll";
      scrollArea.tabIndex = 0;
      scrollArea.setAttribute("role", "region");
      scrollArea.setAttribute("aria-label", "Tabel artikel. Geser ke samping untuk melihat seluruh kolom.");
      table.parentNode?.insertBefore(scrollArea, table);
      scrollArea.appendChild(table);
    });

    setCodeBlocks(Array.from(body.querySelectorAll<HTMLElement>("pre")));
    setCopiedIndex(null);
  }, [content]);

  useEffect(() => () => {
    if (resetTimer.current) clearTimeout(resetTimer.current);
  }, []);

  async function handleCopy(index: number, block: HTMLElement) {
    try {
      await copyText(getCodeText(block));
      setCopiedIndex(index);
      if (resetTimer.current) clearTimeout(resetTimer.current);
      resetTimer.current = setTimeout(() => setCopiedIndex(null), 2_000);
    } catch {
      // Clipboard access can be unavailable in an embedded or non-secure browser context.
    }
  }

  return (
    <>
      <div
        ref={bodyRef}
        className={className}
        // Sanitized by the API on save (tag/attribute allowlist, no scripts or event handlers).
        dangerouslySetInnerHTML={{ __html: content }}
      />
      {codeBlocks.map((block, index) =>
        createPortal(
          <AppButton
            key={index}
            type="button"
            variant="outlineDark"
            size="sm"
            data-article-code-copy
            className="article-code-copy"
            aria-label={copiedIndex === index ? "Kode tersalin" : "Salin kode"}
            onClick={() => void handleCopy(index, block)}
          >
            {copiedIndex === index ? <Check size={14} /> : <Copy size={14} />}
            {copiedIndex === index ? "Tersalin" : "Salin"}
          </AppButton>,
          block,
          `article-code-copy-${index}`,
        ),
      )}
    </>
  );
}
