import type { ComponentPropsWithoutRef } from "react";

// Stepped max-width container so header, hero and sections share one left/right edge.
export default function PageMargin({
  className = "",
  ...props
}: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={`mx-auto w-full px-5 lg:max-w-247 xl:max-w-302 2xl:max-w-325 ${className}`}
      {...props}
    />
  );
}
