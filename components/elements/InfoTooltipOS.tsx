"use client";

import AppButton from "@/components/buttons/AppButton";
import { osTypeClassName } from "@/lib/os-fonts";
import { Info } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

type Position = { left: number; top: number; below: boolean };

// An info icon whose explanation shows in a dark tooltip, portaled so cards and tables never clip it.
export default function InfoTooltipOS({
  label,
  explanation,
  tone = "default",
}: {
  label: string;
  explanation: string;
  tone?: "default" | "onDark";
}) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const tooltipId = useId();
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<Position | null>(null);

  const updatePosition = useCallback(() => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const halfWidth = Math.min(144, (window.innerWidth - 24) / 2);
    setPosition({
      left: Math.min(
        Math.max(rect.left + rect.width / 2, halfWidth + 12),
        window.innerWidth - halfWidth - 12,
      ),
      top: rect.top < 124 ? rect.bottom + 10 : rect.top - 10,
      below: rect.top < 124,
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open, updatePosition]);

  function show() {
    updatePosition();
    setOpen(true);
  }

  return (
    <>
      <AppButton
        ref={triggerRef}
        type="button"
        variant={tone === "onDark" ? "bare" : "secondary"}
        size="iconSm"
        className={
          tone === "onDark"
            ? "rounded-lg text-white/50 hover:bg-white/10 hover:text-white"
            : undefined
        }
        aria-label={`About ${label}`}
        aria-describedby={open ? tooltipId : undefined}
        onMouseEnter={show}
        onMouseLeave={() => setOpen(false)}
        onFocus={show}
        onBlur={() => setOpen(false)}
        onClick={show}
        onKeyDown={(event) => {
          if (event.key === "Escape") setOpen(false);
        }}
      >
        <Info size={14} aria-hidden="true" />
      </AppButton>
      {open &&
        position &&
        createPortal(
          <div
            id={tooltipId}
            role="tooltip"
            className={`${osTypeClassName} pointer-events-none fixed z-50 w-max max-w-72 rounded-lg bg-ink px-3 py-2 text-left text-xs font-normal normal-case leading-relaxed tracking-normal text-white shadow-lg`}
            style={{
              left: position.left,
              top: position.top,
              maxWidth: "min(18rem, calc(100vw - 24px))",
              transform: position.below
                ? "translate(-50%, 0)"
                : "translate(-50%, -100%)",
            }}
          >
            {explanation}
            <span
              aria-hidden="true"
              className={`absolute left-1/2 size-2 -translate-x-1/2 rotate-45 bg-ink ${position.below ? "-top-1" : "-bottom-1"}`}
            />
          </div>,
          document.body,
        )}
    </>
  );
}
