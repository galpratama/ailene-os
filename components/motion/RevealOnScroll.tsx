"use client";

import { trackFeatureView, type BizBlock } from "@/lib/feature-tracking";
import { motion, useReducedMotion, type Variants } from "motion/react";
import type { ReactNode } from "react";

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
  const shouldReduceMotion = useReducedMotion();

  const variants: Variants = shouldReduceMotion
    ? { hidden: { opacity: 1, y: 0 }, visible: { opacity: 1, y: 0 } }
    : { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      onViewportEnter={
        viewBlock
          ? () => trackFeatureView({ name: "home_section", block: viewBlock })
          : undefined
      }
      variants={variants}
      transition={{ duration: 0.55, ease: "easeOut", delay }}
    >
      {children}
    </motion.div>
  );
}
