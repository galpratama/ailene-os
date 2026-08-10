import Link from "next/link";
import { AnchorHTMLAttributes, ReactNode } from "react";

// Marketing CTAs navigate to in-page anchors or external destinations.
export type LinkButtonVariant = "dark" | "light" | "lime" | "outlineDark";

interface LinkButtonBIZProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  variant?: LinkButtonVariant;
  children: ReactNode;
  className?: string;
}

const variantClasses: Record<LinkButtonVariant, string> = {
  dark: "bg-ink text-white hover:brightness-110",
  light: "bg-gray-100 text-ink hover:bg-gray-200",
  lime: "border border-biz-lime bg-biz-lime text-biz-forest hover:bg-biz-lime/90",
  outlineDark:
    "border border-white/30 bg-transparent text-white hover:border-white hover:bg-white/10",
};

export default function LinkButtonBIZ({
  href,
  variant = "dark",
  children,
  className,
  ...rest
}: LinkButtonBIZProps) {
  const classes = [
    "inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg px-4.5 text-[13px] font-semibold tracking-[-0.02em] transition-[filter,transform,background-color,border-color] hover:-translate-y-0.5 active:scale-[0.98]",
    variantClasses[variant],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (href.startsWith("http")) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={classes}
        {...rest}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes} {...rest}>
      {children}
    </Link>
  );
}
