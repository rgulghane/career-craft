import Link from "next/link";
import { messages } from "@career-craft/shared";
import { AppPageShell } from "@/components/app-page-shell";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Page not found",
  description: "The page you requested could not be found.",
  noIndex: true,
});

export default function NotFoundPage() {
  return (
    <AppPageShell>
      <div className="mx-auto max-w-lg text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-400">
          404
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Page not found
        </h1>
        <p className="mt-4 text-slate-600 dark:text-slate-400">
          The page you are looking for does not exist or may have moved.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-orange-500/25 transition hover:from-amber-400 hover:to-orange-500"
        >
          {messages.nav.home}
        </Link>
      </div>
    </AppPageShell>
  );
}
