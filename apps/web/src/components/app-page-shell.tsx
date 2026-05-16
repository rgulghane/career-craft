import type { ReactNode } from "react";

export function AppPageShell({
  children,
  narrow = false,
}: {
  children: ReactNode;
  narrow?: boolean;
}) {
  return (
    <div className="relative min-h-[calc(100dvh-8rem)] overflow-hidden text-slate-900 dark:text-white">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -left-32 top-0 h-80 w-80 rounded-full bg-violet-400/20 blur-3xl dark:bg-violet-600/25" />
        <div className="absolute -right-20 top-1/4 h-72 w-72 rounded-full bg-amber-400/15 blur-3xl dark:bg-amber-500/15" />
        <div className="absolute bottom-0 left-1/2 h-48 w-full -translate-x-1/2 bg-gradient-to-t from-slate-50 to-transparent dark:from-slate-950" />
      </div>
      <div
        className={[
          "relative mx-auto px-4 py-10 sm:px-6 sm:py-14 lg:px-8",
          narrow ? "max-w-lg" : "max-w-6xl",
        ].join(" ")}
      >
        {children}
      </div>
    </div>
  );
}
