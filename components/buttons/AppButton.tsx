"use client";

import { trackCTAClick, trackWhatsAppLead } from "@/lib/conversion";
import type { BizBlock } from "@/lib/feature-tracking";
import Link from "next/link";
import { ComponentPropsWithRef, MouseEvent, ReactNode } from "react";

// OS variants (internal app) + BIZ variants (marketing site) live on one
// component so every button in the codebase goes through a single class map.
export type AppButtonVariant =
  | "primary"
  | "outline"
  | "ghost"
  | "sidebarOutline"
  | "ink"
  | "white"
  | "orange"
  | "lime"
  | "forest"
  | "outlineDark"
  | "discord";
export type AppButtonSize = "sm" | "md" | "icon" | "iconSm" | "cta" | "lg";

interface AppButtonBaseProps {
  children: ReactNode;
  variant?: AppButtonVariant;
  size?: AppButtonSize;
}

type AppButtonAsButton = AppButtonBaseProps &
  ComponentPropsWithRef<"button"> & { href?: undefined };

// Passing href renders a link: next/link for in-page anchors and routes, a new-tab <a> for external URLs.
type AppButtonAsLink = AppButtonBaseProps &
  ComponentPropsWithRef<"a"> & {
    href: string;
    // Block this CTA lives in; a wa.me href reports a lead, anything else a CTA click.
    trackPlacement?: BizBlock;
  };

export type AppButtonProps = AppButtonAsButton | AppButtonAsLink;

const variantClasses: Record<AppButtonVariant, string> = {
  // OS (internal app)
  primary:
    "bg-lime-bright text-forest-deep hover:bg-lime-bright/90 active:bg-lime-bright/80",
  outline:
    "border border-gray-300 bg-gray-50 text-gray-600 hover:bg-gray-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700",
  ghost:
    "text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200",
  // Same shape as "outline" but tuned for the sidebar's dark-forest chrome instead of the light page background.
  sidebarOutline:
    "border border-sb-border-soft bg-sb-item-hover text-sb-text-strong hover:bg-sb-item-active-bg",

  // BIZ (marketing site); filled variants carry a same-color border so they line up with outlineDark.
  ink: "bg-ink text-white hover:bg-ink/90",
  white: "bg-white text-ink border border-ink-line hover:border-ink",
  orange: "bg-oranye text-white hover:bg-oranye/90",
  lime: "border border-biz-lime bg-biz-lime text-biz-forest hover:bg-biz-lime/90",
  forest:
    "border border-biz-forest bg-biz-forest text-white hover:bg-biz-forest/90",
  // White outline for dark or colored backgrounds (hero, forest sections).
  outlineDark:
    "border border-white/30 text-white hover:border-white hover:bg-white/10",
  discord: "bg-white text-[#5865F2] hover:bg-white/90",
};

const sizeClasses: Record<AppButtonSize, string> = {
  sm: "h-8 px-3 text-xs gap-1.5 rounded-lg font-medium transition-colors",
  md: "h-9 px-3.5 text-sm gap-2 rounded-lg font-medium transition-colors",
  icon: "size-8 justify-center p-0 rounded-lg font-medium transition-colors",
  iconSm: "size-7 justify-center p-0 rounded-lg font-medium transition-colors",
  cta: "justify-center px-6 py-3.5 gap-1.5 text-[15px] rounded-xl font-medium transition-transform hover:-translate-y-0.5",
  // Hero-only step above cta.
  lg: "h-15 justify-center px-9 gap-2 text-[17px] rounded-xl font-medium transition-transform hover:-translate-y-0.5",
};

export default function AppButton({
  children,
  variant = "primary",
  size = "md",
  className,
  ...rest
}: AppButtonProps) {
  const finalClasses = [
    "inline-flex items-center hover:cursor-pointer disabled:opacity-50 disabled:pointer-events-none",
    variantClasses[variant],
    sizeClasses[size],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (rest.href === undefined) {
    return (
      <button className={finalClasses} {...rest}>
        {children}
      </button>
    );
  }

  const { href, trackPlacement, onClick, ...anchorProps } = rest;
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (trackPlacement) {
      if (href.includes("wa.me")) {
        trackWhatsAppLead({ placement: trackPlacement });
      } else {
        trackCTAClick({ placement: trackPlacement });
      }
    }
    onClick?.(event);
  };

  if (href.startsWith("http")) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={finalClasses}
        onClick={handleClick}
        {...anchorProps}
      >
        {children}
      </a>
    );
  }

  return (
    <Link
      href={href}
      className={finalClasses}
      onClick={handleClick}
      {...anchorProps}
    >
      {children}
    </Link>
  );
}
