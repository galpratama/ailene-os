"use client";

import AppButton from "@/components/buttons/AppButton";
import { ArrowDownRight } from "lucide-react";
import { useEffect, useState } from "react";

// Kept out of the initial viewport: it becomes available after someone has
// reached the curriculum, then steps aside while the destination form is seen.
export default function FloatingLeadButtonBIZ() {
  const [hasReachedCurriculum, setHasReachedCurriculum] = useState(false);
  const [isContactVisible, setIsContactVisible] = useState(false);

  useEffect(() => {
    const curriculum = document.getElementById("curriculum");
    const contact = document.getElementById("contact");
    if (!curriculum || !contact) return;

    const curriculumObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasReachedCurriculum(true);
          curriculumObserver.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    const contactObserver = new IntersectionObserver(
      ([entry]) => setIsContactVisible(entry.isIntersecting),
      { threshold: 0.15 },
    );

    curriculumObserver.observe(curriculum);
    contactObserver.observe(contact);

    return () => {
      curriculumObserver.disconnect();
      contactObserver.disconnect();
    };
  }, []);

  if (!hasReachedCurriculum || isContactVisible) return null;

  return (
    <div className="pointer-events-none fixed right-4 bottom-4 z-40 sm:right-6 sm:bottom-6">
      <AppButton
        href="#contact"
        variant="white"
        size="cta"
        trackPlacement="curriculum"
        className="pointer-events-auto h-12 rounded-full !border-2 !border-biz-forest !bg-biz-lime !px-3.5 !py-0 !text-[15px] !tracking-[-0.02em] !text-biz-forest shadow-[0_10px_24px_rgba(1,30,22,0.16)] transition-[background-color,box-shadow,transform] hover:!bg-white hover:shadow-[0_14px_30px_rgba(1,30,22,0.22)]"
      >
        Mulai percakapan
        <span className="grid size-6 place-items-center rounded-full bg-biz-forest text-white">
          <ArrowDownRight size={15} aria-hidden="true" strokeWidth={2.5} />
        </span>
      </AppButton>
    </div>
  );
}
