/** Shared Tailwind class bundles for app pages — light base, dark: preserves the original look. */

export const theme = {
  card:
    "rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/60 sm:p-8 dark:border-white/10 dark:bg-white/5 dark:shadow-xl dark:shadow-black/20 dark:backdrop-blur-md",
  cardHighlight:
    "rounded-3xl border border-amber-200 bg-gradient-to-b from-amber-50 to-orange-50/80 p-6 shadow-lg shadow-amber-200/40 sm:p-8 dark:border-amber-500/30 dark:from-amber-500/10 dark:to-white/5 dark:shadow-lg dark:shadow-amber-500/5 dark:backdrop-blur-md",
  cardInner:
    "rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5 dark:backdrop-blur-sm",
  input:
    "mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 dark:border-white/15 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500",
  inputDisabled:
    "mt-1 w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-3 py-3 text-sm text-slate-600 outline-none dark:border-white/10 dark:bg-white/10 dark:text-slate-300",
  label: "text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400",
  title: "text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white",
  pageTitle: "text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white",
  body: "text-sm text-slate-600 dark:text-slate-400",
  link: "font-semibold text-amber-600 transition hover:text-amber-500 hover:underline dark:text-amber-400 dark:hover:text-amber-300",
  eyebrow: "text-sm font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-400",
  btnPrimary:
    "inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-orange-500/20 transition hover:from-amber-400 hover:to-orange-500 disabled:cursor-not-allowed disabled:opacity-60",
  btnSecondary:
    "inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/20 dark:bg-white/5 dark:text-white dark:backdrop-blur-sm dark:hover:bg-white/10",
  btnGhost:
    "inline-flex items-center justify-center rounded-xl border border-slate-200 bg-transparent px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-60 dark:border-white/15 dark:text-slate-200 dark:hover:border-white/25 dark:hover:bg-white/5",
  error: "text-sm text-rose-600 dark:text-rose-400",
  success: "text-sm font-semibold text-emerald-600 dark:text-emerald-400",
} as const;
