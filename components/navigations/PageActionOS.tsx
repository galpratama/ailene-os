"use client";

import AppButton from "@/components/buttons/AppButton";
import { useHeaderActionContext } from "@/contexts/HeaderActionContext";

// Renders a page's registered action button (via useHeaderAction) at the top
// of the content area, now that there's no persistent HeaderOS bar to host it.
export default function PageActionOS() {
  const { action } = useHeaderActionContext();

  if (!action) return null;

  return (
    <div className="flex justify-end px-3 pt-3 sm:px-5">
      <AppButton variant="primary" size="sm" onClick={action.onClick}>
        <action.icon size={13} />
        {action.label}
      </AppButton>
    </div>
  );
}
