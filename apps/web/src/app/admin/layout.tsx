import type { Metadata } from "next";
import type { ReactNode } from "react";
import { NO_INDEX } from "@/lib/seo";

/** Admin pages query MongoDB at request time — skip static generation during `next build`. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  ...NO_INDEX,
  title: "Admin",
};

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return children;
}
