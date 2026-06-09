"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LANDING } from "@career-craft/shared";
import { applyStandardPriceLabel } from "@/lib/format";
import { Section } from "./section";

function StarRating({ rating }: { rating: number }) {
  const clamped = Math.max(0, Math.min(5, rating));
  const widthPct = (clamped / 5) * 100;

  return (
    <div className="flex items-center gap-2" aria-label={`${clamped} out of 5 stars`}>
      <div className="relative inline-flex text-base leading-none">
        <div className="flex gap-0.5 text-slate-300 dark:text-slate-600" aria-hidden>
          {"★★★★★"}
        </div>
        <div
          className="absolute inset-0 flex gap-0.5 overflow-hidden whitespace-nowrap text-amber-400"
          style={{ width: `${widthPct}%` }}
          aria-hidden
        >
          {"★★★★★"}
        </div>
      </div>
      <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{clamped.toFixed(1)}</span>
    </div>
  );
}

export function LandingStudentStories({ standardPriceLabel }: { standardPriceLabel: string }) {
  const { eyebrow, title, items } = LANDING.studentStories;
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const scrollByDir = useCallback((dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-story-card]");
    const step = card ? card.offsetWidth + 24 : el.clientWidth * 0.9;
    el.scrollBy({ left: step * dir, behavior: "smooth" });
  }, []);

  const handleScroll = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-story-card]");
    const step = card ? card.offsetWidth + 24 : el.clientWidth;
    setActiveIndex(Math.round(el.scrollLeft / step));
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const scrollToIndex = useCallback((index: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-story-card]");
    const step = card ? card.offsetWidth + 24 : el.clientWidth;
    el.scrollTo({ left: step * index, behavior: "smooth" });
  }, []);

  return (
    <Section id="stories" className="bg-slate-50 dark:bg-slate-900/50">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-400">
            {eyebrow}
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
            {title}
          </h2>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => scrollByDir(-1)}
            aria-label="Previous stories"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-amber-400 hover:text-amber-600 dark:border-white/15 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-amber-500/50 dark:hover:text-amber-400"
          >
            <span aria-hidden className="text-lg">&#8592;</span>
          </button>
          <button
            type="button"
            onClick={() => scrollByDir(1)}
            aria-label="Next stories"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-amber-400 hover:text-amber-600 dark:border-white/15 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-amber-500/50 dark:hover:text-amber-400"
          >
            <span aria-hidden className="text-lg">&#8594;</span>
          </button>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="mt-12 flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((story) => (
          <article
            key={story.name}
            data-story-card
            className="flex w-[85%] shrink-0 snap-start flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] dark:border-slate-700/60 dark:bg-slate-800/80 dark:shadow-none"
          >
            <StarRating rating={story.rating} />
            <blockquote className="mt-4 flex-1 text-sm italic leading-relaxed text-slate-700 dark:text-slate-300">
              &ldquo;{applyStandardPriceLabel(story.quote, standardPriceLabel)}&rdquo;
            </blockquote>
            <footer className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-5 dark:border-slate-700/60">
              <span
                className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${story.avatarClass}`}
                aria-hidden
              >
                {story.initials}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{story.name}</p>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{story.role}</p>
              </div>
            </footer>
          </article>
        ))}
      </div>

      <div className="mt-6 flex justify-center gap-2">
        {items.map((story, i) => (
          <button
            key={story.name}
            type="button"
            onClick={() => scrollToIndex(i)}
            aria-label={`Go to story ${i + 1}`}
            aria-current={activeIndex === i}
            className={`h-2 rounded-full transition-all ${
              activeIndex === i
                ? "w-6 bg-amber-500"
                : "w-2 bg-slate-300 hover:bg-slate-400 dark:bg-slate-600 dark:hover:bg-slate-500"
            }`}
          />
        ))}
      </div>
    </Section>
  );
}
