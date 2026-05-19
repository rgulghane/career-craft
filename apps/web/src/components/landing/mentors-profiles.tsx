"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LANDING } from "@career-craft/shared";

const MENTORS = LANDING.mentors;
const COUNT = MENTORS.length;
const INTERVAL_MS = 4500;
const SLIDE_MS = 650;
const EASE = "cubic-bezier(0.25, 0.1, 0.25, 1)";

type Mentor = (typeof MENTORS)[number];

function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}

function MentorSpotlightCard({ mentor, priority }: { mentor: Mentor; priority?: boolean }) {
  return (
    <article className="relative mx-auto w-full max-w-sm overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-900/95 shadow-2xl shadow-black/30">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-amber-400 via-amber-500/80 to-orange-600/60"
      />

      <div className="flex min-w-0 gap-4 p-4 sm:gap-5 sm:p-5">
        <div className="relative h-28 w-24 shrink-0 overflow-hidden rounded-xl border border-white/10 sm:h-32 sm:w-28">
          <Image
            src={mentor.photo}
            alt=""
            fill
            sizes="(max-width: 640px) 96px, 112px"
            className="object-cover object-top"
            priority={priority}
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-slate-950/50 to-transparent"
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-center">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-amber-400/90">
            Mentor
          </p>
          <h3 className="mt-1 text-lg font-bold leading-tight tracking-tight text-white sm:text-xl">
            {mentor.name}
          </h3>
          <p className="mt-1.5 line-clamp-2 text-sm leading-snug text-slate-300">{mentor.designation}</p>

          <dl className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs">
            <div className="min-w-0">
              <dt className="font-medium uppercase tracking-wider text-slate-500">Company</dt>
              <dd className="mt-0.5 truncate font-semibold text-white">{mentor.company}</dd>
            </div>
            <div className="min-w-0">
              <dt className="font-medium uppercase tracking-wider text-slate-500">Based in</dt>
              <dd className="mt-0.5 truncate text-slate-200">{mentor.location}</dd>
            </div>
          </dl>
        </div>
      </div>
    </article>
  );
}

function usePreloadMentorPhotos() {
  useEffect(() => {
    MENTORS.forEach((mentor) => {
      const img = new window.Image();
      img.decoding = "async";
      img.src = mentor.photo;
    });
  }, []);
}

export function MentorsProfiles() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [trackIndex, setTrackIndex] = useState(0);
  const [transitioning, setTransitioning] = useState(true);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [paused, setPaused] = useState(false);

  const loopSlides = useMemo(() => (COUNT > 0 ? [...MENTORS, MENTORS[0]!] : []), []);
  const displayIndex = COUNT > 0 ? mod(trackIndex, COUNT) : 0;
  const activeMentor = MENTORS[displayIndex];

  usePreloadMentorPhotos();

  useEffect(() => {
    setReduceMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    if (trackIndex !== COUNT) {
      return;
    }
    const timer = window.setTimeout(() => {
      setTransitioning(false);
      setTrackIndex(0);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setTransitioning(true));
      });
    }, SLIDE_MS);
    return () => window.clearTimeout(timer);
  }, [trackIndex]);

  const goTo = useCallback(
    (nextIndex: number) => {
      if (COUNT <= 1) {
        return;
      }
      setTransitioning(true);
      setTrackIndex(mod(nextIndex, COUNT));
    },
    [],
  );

  const advance = useCallback(() => {
    setTransitioning(true);
    setTrackIndex((i) => i + 1);
  }, []);

  useEffect(() => {
    if (COUNT <= 1 || paused || reduceMotion) {
      return;
    }
    const id = window.setInterval(advance, INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [advance, paused, reduceMotion]);

  if (!activeMentor) {
    return null;
  }

  const slideTransition =
    transitioning && !reduceMotion ? `transform ${SLIDE_MS}ms ${EASE}` : "none";

  return (
    <div
      className="mt-8 w-full min-w-0"
      role="region"
      aria-roledescription="carousel"
      aria-label="Mentor profiles"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        ref={viewportRef}
        className="relative overflow-hidden"
        style={{ minHeight: "9.5rem" }}
      >
        <div
          className="flex will-change-transform motion-reduce:transform-none"
          style={{
            transform: `translate3d(-${trackIndex * 100}%, 0, 0)`,
            transition: slideTransition,
          }}
        >
          {loopSlides.map((mentor, i) => (
            <div
              key={`${mentor.name}-${i}`}
              className="w-full shrink-0 grow-0 basis-full px-0.5 sm:px-1"
              aria-hidden={mod(i, COUNT) !== displayIndex && i !== trackIndex}
            >
              <MentorSpotlightCard mentor={mentor} priority={i <= 1} />
            </div>
          ))}
        </div>
      </div>

      {COUNT > 1 ? (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <div className="flex items-center gap-1.5" role="tablist" aria-label="Choose mentor">
            {MENTORS.map((m, i) => {
              const active = i === displayIndex;
              return (
                <button
                  key={m.name}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  aria-label={`Show ${m.name}`}
                  onClick={() => goTo(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 motion-reduce:transition-none ${
                    active ? "w-7 bg-amber-400" : "w-1.5 bg-slate-600 hover:bg-slate-500"
                  }`}
                />
              );
            })}
          </div>
          <p className="sr-only" aria-live="polite">
            {activeMentor.name}, {activeMentor.designation} at {activeMentor.company}
          </p>
        </div>
      ) : null}
    </div>
  );
}
