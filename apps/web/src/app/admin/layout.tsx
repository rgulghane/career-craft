import type { ReactNode } from "react";

/** Admin pages query MongoDB at request time — skip static generation during `next build`. */
export const dynamic = "force-dynamic";

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return children;
}
