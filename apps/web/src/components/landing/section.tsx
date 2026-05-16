import type { ReactNode } from "react";

export function Section({
  id,
  children,
  className = "",
  dark = false,
  innerClassName = "",
}: {
  id?: string;
  children: ReactNode;
  className?: string;
  dark?: boolean;
  innerClassName?: string;
}) {
  return (
    <section
      id={id}
      className={[
        "relative px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24",
        dark
          ? "bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-white"
          : "bg-white text-slate-900",
        className,
      ].join(" ")}
    >
      <div className={["mx-auto max-w-6xl", innerClassName].filter(Boolean).join(" ")}>{children}</div>
    </section>
  );
}
