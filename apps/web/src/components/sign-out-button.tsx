"use client";

import { messages } from "@career-craft/shared/content";
import { useState } from "react";
import { performSignOut } from "@/lib/sign-out-client";
import { theme } from "@/lib/theme";

export function SignOutButton({ userType }: { userType?: string | null }) {
  const [pending, setPending] = useState(false);

  return (
    <button
      type="button"
      className={theme.btnGhost}
      disabled={pending}
      onClick={async () => {
        setPending(true);
        try {
          const redirectPath = await performSignOut(userType);
          window.location.assign(redirectPath);
        } finally {
          setPending(false);
        }
      }}
    >
      {pending ? "…" : messages.nav.signOut}
    </button>
  );
}
