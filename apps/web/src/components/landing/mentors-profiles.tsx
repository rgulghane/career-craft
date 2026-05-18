"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { LANDING } from "@career-craft/shared";

const MENTORS = LANDING.mentors;
const INTERVAL_MS = 4500;
const TRANSITION_MS = 750;

function MentorSpotlightCard({
  mentor,
  visible,
}: {
  mentor: (typeof MENTORS)[number];
  visible: boolean;
}) {
  return (
    <article
      className="relative mx-auto w-full max-w-sm overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-900/95 shadow-2xl shadow-black/30 transition-[opacity,transform] ease-out motion-reduce:transition-none"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0) scale(1)" : "translateY(0.35rem) scale(0.98)",
        transitionDuration: `${TRANSITION_MS}ms`,
      }}
    >
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

export function MentorsProfiles() {
  const mentorCount = MENTORS.length;
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [reduceMotion, setReduceMotion] = useState(false);

  const mentor = MENTORS[index];

  const goTo = useCallback(
    (nextIndex: number) => {
      if (mentorCount <= 1 || nextIndex === index) {
        return;
      }

      if (reduceMotion) {
        setIndex(((nextIndex % mentorCount) + mentorCount) % mentorCount);
        return;
      }

      setVisible(false);
      window.setTimeout(() => {
        setIndex(((nextIndex % mentorCount) + mentorCount) % mentorCount);
        setVisible(true);
      }, TRANSITION_MS);
    },
    [index, mentorCount, reduceMotion],
  );

  const advance = useCallback(() => {
    goTo(index + 1);
  }, [goTo, index]);

  useEffect(() => {
    setReduceMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    if (mentorCount <= 1 || reduceMotion) {
      return;
    }
    const id = window.setInterval(advance, INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [advance, mentorCount, reduceMotion]);

  if (!mentor) {
    return null;
  }

  return (
    <div
      className="mt-8 w-full min-w-0"
      role="region"
      aria-roledescription="carousel"
      aria-label="Mentor profiles"
    >
      <div className="relative min-h-[9.5rem] sm:min-h-[10.5rem]">
        <MentorSpotlightCard mentor={mentor} visible={visible} />
      </div>

      {mentorCount > 1 ? (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <div className="flex items-center gap-1.5" role="tablist" aria-label="Choose mentor">
            {MENTORS.map((m, i) => {
              const active = i === index;
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
            {visible ? `Showing ${mentor.name}, ${mentor.designation} at ${mentor.company}` : "Updating mentor"}
          </p>
        </div>
      ) : null}
    </div>
  );
}
