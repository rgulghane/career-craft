"use client";

import type { ReactNode } from "react";

const ENROLLMENT_SECTION_ID = "pricing";

type ScrollToEnrollmentButtonProps = {
  className?: string;
  children: ReactNode;
};

export function ScrollToEnrollmentButton({ className, children }: ScrollToEnrollmentButtonProps) {
  function scrollToEnrollment() {
    const target = document.getElementById(ENROLLMENT_SECTION_ID);
    if (!target) {
      return;
    }
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <button type="button" className={className} onClick={scrollToEnrollment}>
      {children}
    </button>
  );
}
