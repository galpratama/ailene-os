"use client";

import { LucideIcon } from "lucide-react";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

export type HeaderAction = {
  label: string;
  icon: LucideIcon;
  onClick?: () => void;
};

type HeaderActionContextType = {
  action: HeaderAction | null;
  setAction: (action: HeaderAction | null) => void;
};

const HeaderActionContext = createContext<HeaderActionContextType | null>(
  null
);

export function HeaderActionProvider({ children }: { children: ReactNode }) {
  const [action, setAction] = useState<HeaderAction | null>(null);
  return (
    <HeaderActionContext.Provider value={{ action, setAction }}>
      {children}
    </HeaderActionContext.Provider>
  );
}

export function useHeaderActionContext() {
  const context = useContext(HeaderActionContext);
  if (!context) {
    throw new Error(
      "useHeaderActionContext must be used within HeaderActionProvider"
    );
  }
  return context;
}

// Pages call this to tell PageActionOS what its action button should say and
// do — it registers on mount and clears itself on unmount so navigating away
// never leaves a stale button behind.
export function useHeaderAction(action: HeaderAction) {
  const { setAction } = useHeaderActionContext();

  useEffect(() => {
    setAction(action);
    return () => setAction(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [action.label, action.icon]);
}
