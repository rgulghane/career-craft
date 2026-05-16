"use client";

import { useRouter } from "next/navigation";
import { messages } from "@career-craft/shared/content";
import { useState } from "react";
import { theme } from "@/lib/theme";

export function SignOutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  return (
    <button
      type="button"
      className={theme.btnGhost}
      disabled={pending}
      onClick={async () => {
        setPending(true);
        try {
          await fetch("/api/auth/logout", { method: "POST" });
          router.push("/");
          router.refresh();
        } finally {
          setPending(false);
        }
      }}
    >
      {pending ? "…" : messages.nav.signOut}
    </button>
  );
}
