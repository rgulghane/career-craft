"use client";

import { useEffect, useRef } from "react";
import { isValidReferralCodeInput, normalizeReferralCode } from "@career-craft/shared";
import { writeStoredReferral } from "@/lib/referral-storage";

const ENROLLMENT_WIDGET_ID = "enrollment";

function scrollToEnrollmentWidget() {
  const widget = document.getElementById(ENROLLMENT_WIDGET_ID);
  const pricing = document.getElementById("pricing");
  const target = widget ?? pricing;
  if (!target) {
    return;
  }
  target.scrollIntoView({ behavior: "smooth", block: "start" });
}

/** On referral links, persist the code and scroll the home enrollment widget into view. */
export function ReferralLandingHandler({ referralCode }: { referralCode: string }) {
  const handledRef = useRef(false);

  useEffect(() => {
    const code = normalizeReferralCode(referralCode);
    if (!isValidReferralCodeInput(code) || handledRef.current) {
      return;
    }
    handledRef.current = true;
    writeStoredReferral(code);

    const timer = window.setTimeout(scrollToEnrollmentWidget, 150);
    return () => window.clearTimeout(timer);
  }, [referralCode]);

  return null;
}
