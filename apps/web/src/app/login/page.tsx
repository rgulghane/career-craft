import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { messages } from "@career-craft/shared";
import { AppPageShell } from "@/components/app-page-shell";
import { getSessionUser } from "@/lib/server-api";
import { AuthCard } from "./ui";

export const metadata: Metadata = {
  title: `${messages.nav.signIn} — CareerCraft`,
};

function safeNextPath(next: string | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/dashboard";
  }
  return next;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const user = await getSessionUser();
  const next = safeNextPath((await searchParams).next);

  if (user) {
    redirect(next);
  }

  return (
    <AppPageShell narrow>
      <AuthCard mode="login" heading={messages.auth.signInHeading} redirectTo={next} />
    </AppPageShell>
  );
}
