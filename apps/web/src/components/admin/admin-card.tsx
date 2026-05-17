import type { ReactNode } from "react";

export function AdminCard({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
      {title ? <h2 className="text-lg font-semibold text-white">{title}</h2> : null}
      <div className={title ? "mt-4" : undefined}>{children}</div>
    </section>
  );
}
