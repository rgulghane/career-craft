"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LANDING } from "@career-craft/shared";
import { MentorSpotlightCard } from "./mentor-spotlight-card";

const MENTORS = LANDING.mentors;
const COUNT = MENTORS.length;
const INTERVAL_MS = 4500;
const SLIDE_MS = 650;
const EASE = "cubic-bezier(0.25, 0.1, 0.25, 1)";

function mod(n: number, m: number) {
  return ((n % m) + m) % m;
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

  const goTo = useCallback((nextIndex: number) => {
    if (COUNT <= 1) {
      return;
    }
    setTransitioning(true);
    setTrackIndex(mod(nextIndex, COUNT));
  }, []);

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
        className="relative overflow-hidden px-2 py-3"
        style={{ minHeight: "28.5rem" }}
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
              className="flex w-full shrink-0 grow-0 basis-full justify-center px-1 sm:px-2"
              aria-hidden={mod(i, COUNT) !== displayIndex && i !== trackIndex}
            >
              <MentorSpotlightCard mentor={mentor} priority={i <= 1} />
            </div>
          ))}
        </div>
      </div>

      {COUNT > 1 ? (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
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
                    active
                      ? "w-8 bg-gradient-to-r from-amber-400 to-orange-500"
                      : "w-1.5 bg-slate-400 hover:bg-slate-500"
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
