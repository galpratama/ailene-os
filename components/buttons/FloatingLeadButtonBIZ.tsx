"use client";

import AppButton from "@/components/buttons/AppButton";
import { useEffect, useState } from "react";
import { IconBrandWhatsapp } from "@tabler/icons-react";

// Visible from the first screen; steps aside while the destination form is seen.
export default function FloatingLeadButtonBIZ() {
  const [isContactVisible, setIsContactVisible] = useState(false);

  useEffect(() => {
    const contact = document.getElementById("contact");
    if (!contact) return;

    const contactObserver = new IntersectionObserver(
      ([entry]) => setIsContactVisible(entry.isIntersecting),
      { threshold: 0.15 },
    );

    contactObserver.observe(contact);

    return () => contactObserver.disconnect();
  }, []);

  if (isContactVisible) return null;

  return (
    <div className="pointer-events-none fixed right-4 bottom-4 z-40 sm:right-6 sm:bottom-6">
      <AppButton
        href="#contact"
        variant="floatingBiz"
        size="floating"
        trackPlacement="curriculum"
        className="pointer-events-auto"
      >
        Mulai percakapan
        <span className="grid size-6 place-items-center rounded-full bg-biz-forest text-white">
          <IconBrandWhatsapp size={15} aria-hidden="true" strokeWidth={2.25} />
        </span>
      </AppButton>
    </div>
  );
}
