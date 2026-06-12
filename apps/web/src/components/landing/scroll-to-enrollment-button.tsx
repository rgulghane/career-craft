"use client";

import type { ReactNode } from "react";

type ScrollToEnrollmentButtonProps = {
  className?: string;
  children: ReactNode;
};

const ENROLLMENT_SECTION_IDS = ["enrollment", "pricing"] as const;

function scrollToEnrollmentSection() {
  for (const id of ENROLLMENT_SECTION_IDS) {
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
  }
}

export function ScrollToEnrollmentButton({ className, children }: ScrollToEnrollmentButtonProps) {
  return (
    <button type="button" className={className} onClick={scrollToEnrollmentSection}>
      {children}
    </button>
  );
}
