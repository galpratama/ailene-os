import { ReactNode } from "react";

export default function LmsInsightPanelOS({
  title,
  description,
  action,
  children,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`flex min-w-0 flex-col rounded-2xl border border-line bg-card-bg ${className ?? ""}`}
    >
      <header className="flex flex-wrap items-start justify-between gap-3 px-5 pt-5">
        <div className="min-w-0">
          <h3 className="font-bold text-gray-900 dark:text-zinc-100">{title}</h3>
          {description && (
            <p className="mt-0.5 text-sm text-gray-500 dark:text-zinc-400">
              {description}
            </p>
          )}
        </div>
        {action}
      </header>
      <div className="min-w-0 flex-1 px-5 pb-5 pt-4">{children}</div>
    </section>
  );
}
