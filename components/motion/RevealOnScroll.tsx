"use client";

import { trackFeatureView, type BizBlock } from "@/lib/feature-tracking";
import { useEffect, useRef, useState, type ReactNode } from "react";

// Plain IntersectionObserver + a CSS transition (.biz-reveal in globals.css), so the landing page ships no animation library.
export default function RevealOnScroll({
  children,
  delay = 0,
  className,
  viewBlock,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  // Set it to report a GTM view event when this section scrolls in.
  viewBlock?: BizBlock;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setIsVisible(true);
        if (viewBlock) trackFeatureView({ name: "home_section", block: viewBlock });
        observer.disconnect();
      },
      { rootMargin: "-80px 0px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [viewBlock]);

  return (
    <div
      ref={ref}
      className={`biz-reveal ${isVisible ? "is-visible" : ""} ${className ?? ""}`}
      style={delay ? { transitionDelay: `${delay}s` } : undefined}
    >
      {children}
    </div>
  );
}
