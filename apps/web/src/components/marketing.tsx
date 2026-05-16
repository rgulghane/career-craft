"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PROGRAM } from "@career-craft/shared";

const lockupClass = "group flex items-center gap-3";

function LockupContent() {
  return (
    <>
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-sm font-bold text-slate-950 shadow-md transition group-hover:from-amber-400 group-hover:to-orange-500">
        CC
      </span>
      <span className="flex flex-col leading-tight">
        <span className="text-sm font-semibold text-slate-900 dark:text-white">{PROGRAM.name}</span>
        <span className="text-xs text-slate-500 dark:text-slate-400">12-Week Accelerator</span>
      </span>
    </>
  );
}

export function BrandLockup() {
  const onHome = usePathname() === "/";

  if (onHome) {
    return (
      <button
        type="button"
        className={`${lockupClass} text-left`}
        onClick={() => {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      >
        <LockupContent />
      </button>
    );
  }

  return (
    <Link href="/" className={lockupClass}>
      <LockupContent />
    </Link>
  );
}
