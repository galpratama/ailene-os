import Link from "next/link";
import { AnchorHTMLAttributes, ReactNode } from "react";

// Every CTA on the B2B training landing page is a navigational link (in-page
// anchor or an external link), never a real <button> action — so unlike
// AppButton (button-semantic only), this renders an <a>/<Link>, matching the
// existing HeaderBIZ/FooterBIZ pattern of hand-styling link-CTAs directly.
export type LinkButtonVariant = "dark" | "light";

interface LinkButtonBIZProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  variant?: LinkButtonVariant;
  children: ReactNode;
  className?: string;
}

const variantClasses: Record<LinkButtonVariant, string> = {
  dark: "bg-ink text-white hover:brightness-110",
  light: "bg-gray-100 text-ink hover:bg-gray-200",
};

export default function LinkButtonBIZ({
  href,
  variant = "dark",
  children,
  className,
  ...rest
}: LinkButtonBIZProps) {
  const classes = [
    "inline-flex min-h-12.5 items-center justify-center gap-1.5 px-5.5 text-[13px] font-bold tracking-[0.06em] uppercase transition-[filter,transform] active:scale-[0.98]",
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
