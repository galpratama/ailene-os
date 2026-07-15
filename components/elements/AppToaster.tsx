"use client";

import { useTheme } from "next-themes";
import { Toaster, type ToasterProps } from "sonner";

export default function AppToaster(props: ToasterProps) {
  const { theme = "system" } = useTheme();

  return (
    <Toaster
      theme={theme as ToasterProps["theme"]}
      richColors
      position="top-center"
      {...props}
    />
  );
}
