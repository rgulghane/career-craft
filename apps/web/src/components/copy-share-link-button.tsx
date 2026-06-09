"use client";

import { useState } from "react";
import { messages } from "@career-craft/shared/content";
import { theme } from "@/lib/theme";

export function CopyShareLinkButton({ shareMessage }: { shareMessage: string }) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareMessage);
      setCopied(true);
      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button type="button" className={theme.btnSecondary} onClick={() => void copyLink()}>
      {copied ? "Copied!" : messages.dashboard.copyShareMessage}
    </button>
  );
}
