import type { Metadata } from "next";
import { messages } from "@career-craft/shared";
import { AppPageShell } from "@/components/app-page-shell";
import { getSessionUser } from "@/lib/server-api";
import { AuthCard } from "../login/ui";

export const metadata: Metadata = {
  title: `${messages.nav.register} — CareerCraft`,
};

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const user = await getSessionUser();
  const ref = (await searchParams).ref?.trim().toUpperCase() ?? "";
  const enrollContinuePath = ref
    ? `/enroll?ref=${encodeURIComponent(ref)}&continue=1`
    : "/enroll?continue=1";

  return (
    <AppPageShell narrow>
      <AuthCard
        mode="register"
        heading={user ? messages.enroll.heading : messages.auth.registerHeading}
        sessionUser={user}
        redirectTo={user ? enrollContinuePath : "/dashboard"}
      />
    </AppPageShell>
  );
}
