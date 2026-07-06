import {
  ButtonHTMLAttributes,
  ForwardedRef,
  forwardRef,
  ReactNode,
} from "react";

// OS variants (internal app) + BIZ variants (marketing site) live on one
// component so every button in the codebase goes through a single class map.
export type AppButtonVariant =
  | "primary"
  | "outline"
  | "ghost"
  | "ink"
  | "white"
  | "orange"
  | "discord";
export type AppButtonSize = "sm" | "md" | "icon" | "cta";

interface AppButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: AppButtonVariant;
  size?: AppButtonSize;
}

const variantClasses: Record<AppButtonVariant, string> = {
  // OS (internal app)
  primary: "bg-claude text-white hover:bg-claude/90 active:bg-claude/80",
  outline: "border border-gray-300 bg-gray-50 text-gray-600 hover:bg-gray-100",
  ghost: "text-gray-500 hover:bg-gray-100 hover:text-gray-700",

  // BIZ (marketing site)
  ink: "bg-ink text-white hover:bg-ink/90",
  white: "bg-white text-ink border border-ink-line hover:border-ink",
  orange: "bg-oranye text-white hover:bg-oranye/90",
  discord: "bg-white text-[#5865F2] hover:bg-white/90",
};

const sizeClasses: Record<AppButtonSize, string> = {
  sm: "h-8 px-3 text-xs gap-1.5 rounded-lg font-semibold transition-colors",
  md: "h-9 px-3.5 text-sm gap-2 rounded-lg font-semibold transition-colors",
  icon: "size-8 justify-center p-0 rounded-lg font-semibold transition-colors",
  cta: "px-6 py-3.5 gap-1.5 text-[15px] rounded-xl font-bold transition-transform hover:-translate-y-0.5",
};

const AppButton = forwardRef<HTMLButtonElement, AppButtonProps>(
  (
    { children, variant = "primary", size = "md", className, ...rest },
    ref: ForwardedRef<HTMLButtonElement>
  ) => {
    const baseClasses =
      "inline-flex items-center hover:cursor-pointer disabled:opacity-50 disabled:pointer-events-none";

    const finalClasses = [
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <button ref={ref} className={finalClasses} {...rest}>
        {children}
      </button>
    );
  }
);
AppButton.displayName = "AppButton";

export default AppButton;
