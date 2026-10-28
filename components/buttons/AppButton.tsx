"use client";

import { trackCTAClick, trackWhatsAppLead } from "@/lib/conversion";
import type { BizBlock } from "@/lib/feature-tracking";
import Link from "next/link";
import { ComponentPropsWithRef, MouseEvent, ReactNode } from "react";

// Keep button colors and shapes here, including BIZ CTAs.
export type AppButtonVariant =
  | "primary"
  | "outline"
  | "secondary"
  | "destructive"
  | "dangerGhost"
  | "dangerWhite"
  | "outlineDashed"
  | "row"
  | "textLink"
  | "sort"
  | "sortActive"
  | "bare"
  | "black"
  | "ghost"
  | "success"
  | "warning"
  | "ghostBiz"
  | "floatingBiz"
  | "ink"
  | "white"
  | "orange"
  | "lime"
  | "forest"
  | "outlineDark"
  | "discord"
  | "choiceBiz"
  | "choiceBizActive";
export type AppButtonSize = "sm" | "md" | "icon" | "iconSm" | "iconRound" | "iconRoundSm" | "pill" | "row" | "rowWide" | "rowSummary" | "textLink" | "sort" | "bare" | "dashed" | "floating" | "cta" | "lg" | "choice" | "rating";

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
    "border border-line bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700",
  secondary:
    "text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200",
  destructive:
    "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 dark:bg-red-600 dark:hover:bg-red-500",
  dangerGhost: "text-gray-500 hover:bg-red-50 hover:text-merah dark:text-zinc-400 dark:hover:bg-red-950/40 dark:hover:text-red-300",
  dangerWhite: "border border-line bg-white text-red-600 hover:bg-red-50 dark:bg-zinc-800 dark:text-red-400 dark:hover:bg-zinc-700",
  outlineDashed: "border-2 border-dashed border-line text-gray-500 hover:border-claude hover:text-claude dark:text-zinc-400",
  row: "hover:bg-gray-50 dark:hover:bg-zinc-800/50",
  textLink: "text-claude hover:underline",
  sort: "text-gray-400 hover:text-gray-700 dark:hover:text-zinc-200",
  sortActive: "text-claude hover:text-claude",
  bare: "",
  black:
    "border border-black bg-black text-white hover:bg-zinc-800 dark:border-white/20 dark:hover:bg-zinc-800",
  ghost:
    "text-sb-text hover:bg-sb-item-hover hover:text-sb-text-strong",
  success: "bg-hijau text-white hover:bg-hijau/90",
  warning: "bg-oranye text-white hover:bg-oranye/90",

  // BIZ (marketing site); filled variants carry a same-color border so they line up with outlineDark.
  ghostBiz: "text-biz-forest hover:bg-biz-forest/8",
  floatingBiz: "border-2 border-biz-forest bg-biz-lime text-biz-forest shadow-[0_10px_24px_rgba(1,30,22,0.16)] hover:bg-white hover:shadow-[0_14px_30px_rgba(1,30,22,0.22)]",
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
  // Answer options in a BIZ questionnaire (trilogy survey).
  choiceBiz: "border border-ink-line bg-white text-ink hover:border-ink/40",
  choiceBizActive: "border border-biz-forest bg-biz-lime/20 text-ink ring-1 ring-biz-forest",
};

const sizeClasses: Record<AppButtonSize, string> = {
  sm: "h-8 px-3 text-xs gap-1.5 rounded-lg font-medium transition-colors",
  md: "h-9 px-3.5 text-sm gap-2 rounded-lg font-medium transition-colors",
  icon: "size-8 justify-center p-0 rounded-lg font-medium transition-colors",
  iconSm: "size-7 justify-center p-0 rounded-lg font-medium transition-colors",
  iconRound: "size-8 justify-center p-0 rounded-full font-medium transition-colors",
  iconRoundSm: "size-7 justify-center p-0 rounded-full font-medium transition-colors",
  pill: "h-8 px-3 text-xs gap-1.5 rounded-full font-medium transition-colors",
  row: "w-full gap-3 px-4 py-3 text-left transition-colors",
  rowWide: "w-full gap-3 px-5 py-3 text-left transition-colors",
  rowSummary: "w-full justify-between gap-4 px-5 py-3.5 text-left transition-colors",
  textLink: "gap-1 text-xs font-medium transition-colors",
  sort: "gap-1 text-xs font-semibold uppercase transition-colors",
  bare: "",
  dashed: "w-full justify-center gap-1.5 rounded-lg py-2.5 text-xs font-semibold uppercase tracking-wide transition-colors",
  floating: "h-12 rounded-full px-3.5 py-0 text-[15px] tracking-[-0.02em] gap-1.5 font-medium transition-[background-color,box-shadow,transform]",
  cta: "justify-center px-6 py-3.5 gap-1.5 text-[15px] rounded-xl font-medium transition-transform hover:-translate-y-0.5",
  // Hero-only step above cta.
  lg: "h-15 justify-center px-9 gap-2 text-[17px] rounded-xl font-medium transition-transform hover:-translate-y-0.5",
  choice: "min-h-13 w-full justify-start gap-3 rounded-xl px-4 py-3.5 text-left text-[15px] leading-snug font-medium transition-colors",
  rating: "h-13 w-full justify-center rounded-xl text-base font-semibold tabular-nums transition-colors",
};

export default function AppButton({
  children,
  variant = "primary",
  size = "md",
  className,
  ...rest
}: AppButtonProps) {
  const finalClasses = [
    "inline-flex items-center hover:cursor-pointer disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-claude dark:focus-visible:ring-lime-bright",
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
