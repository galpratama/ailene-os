import AppButton from "@/components/buttons/AppButton";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface PageHeaderOSAction {
  label: string;
  icon: LucideIcon;
  onClick?: () => void;
}

interface PageHeaderOSProps {
  title: string;
  description?: string;
  action?: PageHeaderOSAction;
  children?: ReactNode;
}

// Page title + top-right action button, kept in one row so they always line
// up — every OS page renders this instead of a hand-rolled <h2>/<p> pair.
export default function PageHeaderOS({
  title,
  description,
  action,
  children,
}: PageHeaderOSProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-100">
          {title}
        </h2>
        {description && (
          <p className="mt-0.5 text-sm text-gray-500 dark:text-zinc-400">
            {description}
          </p>
        )}
      </div>
      {(action || children) && (
        <div className="flex shrink-0 items-center gap-2">
          {children}
          {action && (
            <AppButton variant="primary" size="sm" onClick={action.onClick}>
              <action.icon size={13} />
              {action.label}
            </AppButton>
          )}
        </div>
      )}
    </div>
  );
}
