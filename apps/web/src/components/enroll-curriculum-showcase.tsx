"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { ENROLL_SHOWCASE, LANDING } from "@career-craft/shared";

const slides = ENROLL_SHOWCASE.slides;
const AUTO_MS = 6000;

const SLIDE_OVERLAY: Record<(typeof slides)[number]["id"], string> = {
  foundations: "bg-gradient-to-t from-violet-600 via-purple-600 to-indigo-800",
  skills: "bg-gradient-to-t from-amber-500 via-orange-500 to-rose-600",
  career: "bg-gradient-to-t from-emerald-500 via-teal-500 to-cyan-700",
};

export function EnrollCurriculumShowcase() {
  const [active, setActive] = useState(0);
  const slide = slides[active] ?? slides[0];

  const goTo = useCallback((index: number) => {
    setActive((index + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % slides.length);
    }, AUTO_MS);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-400">
          12-week curriculum
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
          {ENROLL_SHOWCASE.title}
        </h1>
        <p className="mt-3 max-w-xl text-sm text-slate-600 sm:text-base dark:text-slate-400">
          {ENROLL_SHOWCASE.subtitle}
        </p>
        <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">
          {LANDING.schedule.live} · {LANDING.schedule.note}
        </p>
      </header>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 shadow-xl dark:border-white/10">
        <div className="relative aspect-[16/10] w-full sm:aspect-[16/9]">
          {slides.map((s, i) => (
            <div
              key={s.id}
              className={[
                "absolute inset-0 transition-opacity duration-700 ease-out",
                i === active ? "opacity-100" : "pointer-events-none opacity-0",
              ].join(" ")}
              aria-hidden={i !== active}
            >
              <Image
                src={s.image}
                alt={s.imageAlt}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 55vw"
                priority={i === 0}
              />
              <div
                className={[
                  "absolute inset-0 opacity-75 mix-blend-multiply",
                  SLIDE_OVERLAY[s.id],
                ].join(" ")}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
            </div>
          ))}

          <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-300">{slide.phase}</p>
            <p className="text-sm text-white/80">{slide.weeks}</p>
            <h2 className="mt-1 text-2xl font-bold text-white sm:text-3xl">{slide.title}</h2>
            <p className="mt-2 max-w-lg text-sm text-white/85">{slide.caption}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {slide.tools.map((tool) => (
                <span
                  key={tool}
                  className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm"
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>

          <button
            type="button"
            className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60"
            aria-label="Previous slide"
            onClick={() => goTo(active - 1)}
          >
            ‹
          </button>
          <button
            type="button"
            className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60"
            aria-label="Next slide"
            onClick={() => goTo(active + 1)}
          >
            ›
          </button>
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-white/10 bg-slate-900/95 px-4 py-3">
          <div className="flex gap-2">
            {slides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                aria-label={`Show ${s.title}`}
                aria-current={i === active ? "true" : undefined}
                className={[
                  "h-2 rounded-full transition-all",
                  i === active ? "w-8 bg-amber-400" : "w-2 bg-white/30 hover:bg-white/50",
                ].join(" ")}
                onClick={() => goTo(i)}
              />
            ))}
          </div>
          <p className="text-xs text-white/50">
            {active + 1} / {slides.length}
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {LANDING.phases.map((p, i) => {
          const isActive = slides[active]?.phase === p.phase;
          return (
            <button
              key={p.phase}
              type="button"
              onClick={() => goTo(i)}
              className={[
                "rounded-xl border p-4 text-left transition",
                isActive
                  ? "border-amber-400/60 bg-amber-50 shadow-md shadow-amber-200/30 dark:border-amber-500/40 dark:bg-amber-500/10 dark:shadow-amber-500/10"
                  : "border-slate-200 bg-white hover:border-slate-300 dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20",
              ].join(" ")}
            >
              <p className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                {p.phase}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{p.weeks}</p>
              <h3 className="mt-2 font-semibold text-slate-900 dark:text-white">{p.theme}</h3>
              <ul className="mt-3 space-y-1.5">
                {p.items.map((item) => (
                  <li key={item} className="flex gap-2 text-xs text-slate-600 dark:text-slate-300">
                    <span className="shrink-0 text-amber-500">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Tools you&apos;ll master
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {LANDING.tools.map((tool) => (
            <span
              key={tool}
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
            >
              {tool}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
