"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  TOOL_BRANDS,
  buildToolColumns,
  toolBrandIconUrl,
  type ToolBrand,
  type ToolColumn,
} from "./tool-brands";

const INTERVAL_MS = 4500;
const TRANSITION_MS = 600;
const VISIBLE_COLS = 1;

const COLUMNS = buildToolColumns();

function ToolCard({ tool }: { tool: ToolBrand }) {
  return (
    <article
      className="group relative flex h-full min-h-[11rem] w-full min-w-0 flex-col overflow-hidden rounded-[1.35rem] border border-slate-200/90 bg-white shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-600/50 dark:bg-slate-800 dark:shadow-lg dark:hover:shadow-2xl sm:min-h-[12.5rem] sm:rounded-[1.5rem]"
    >
      <div
        aria-hidden
        className="h-1.5 w-full shrink-0 sm:h-2"
        style={{ background: `linear-gradient(90deg, #${tool.color}, #${tool.color}88)` }}
      />
      <div className="grid min-h-0 flex-1 grid-cols-2">
        <div className="flex flex-col items-center justify-center gap-3 border-r border-slate-100 px-4 py-5 dark:border-slate-700/80 sm:gap-4 sm:px-5 sm:py-6">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl sm:h-16 sm:w-16"
            style={{ backgroundColor: `#${tool.color}20` }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={toolBrandIconUrl(tool.slug)}
              alt=""
              width={40}
              height={40}
              className="h-9 w-9 object-contain dark:invert sm:h-10 sm:w-10"
              loading="lazy"
              decoding="async"
            />
          </div>
          <h3 className="text-center text-sm font-bold leading-snug tracking-tight text-slate-900 dark:text-slate-100 sm:text-base">
            {tool.name}
          </h3>
        </div>
        <div className="flex items-center px-4 py-5 sm:px-5 sm:py-6">
          <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400 sm:text-sm sm:leading-relaxed">
            {tool.description}
          </p>
        </div>
      </div>
    </article>
  );
}

function ToolColumnSlide({ column }: { column: ToolColumn }) {
  return (
    <div className="h-full">
      <ToolCard tool={column.top} />
    </div>
  );
}

export function ToolsCarousel() {
  const columnCount = COLUMNS.length;
  const viewportRef = useRef<HTMLDivElement>(null);
  const [colWidth, setColWidth] = useState(0);
  const [index, setIndex] = useState(0);
  const [transitioning, setTransitioning] = useState(true);
  const [ready, setReady] = useState(false);

  const extended = [...COLUMNS, ...COLUMNS.slice(0, VISIBLE_COLS)];

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }

    const measure = () => {
      const width = viewport.getBoundingClientRect().width;
      if (width > 0) {
        setColWidth(width / VISIBLE_COLS);
        setReady(true);
      }
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      return;
    }
    const id = window.setInterval(() => {
      setIndex((prev) => prev + 1);
    }, INTERVAL_MS);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (index !== columnCount) {
      return;
    }
    const resetTimer = window.setTimeout(() => {
      setTransitioning(false);
      setIndex(0);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setTransitioning(true));
      });
    }, TRANSITION_MS);
    return () => window.clearTimeout(resetTimer);
  }, [index, columnCount]);

  const offsetPx = index * colWidth;

  const visibleTools = Array.from({ length: VISIBLE_COLS }, (_, colOffset) => {
    const col = COLUMNS[(index + colOffset) % columnCount]!;
    return col.top;
  });

  return (
    <div
      className="mt-8 w-full min-w-0"
      role="region"
      aria-roledescription="carousel"
      aria-label="Tools you will master"
    >
      <div
        ref={viewportRef}
        className="w-full min-w-0 overflow-hidden"
        style={{ minHeight: "11.25rem" }}
      >
        {!ready ? (
          <div className="grid grid-cols-1 gap-4">
            {TOOL_BRANDS.slice(0, VISIBLE_COLS).map((tool) => (
              <ToolCard key={tool.slug} tool={tool} />
            ))}
          </div>
        ) : (
          <div
            className="flex items-stretch will-change-transform"
            style={{
              transform: `translate3d(-${offsetPx}px, 0, 0)`,
              transition: transitioning ? `transform ${TRANSITION_MS}ms cubic-bezier(0.4, 0, 0.2, 1)` : "none",
            }}
          >
            {extended.map((column, i) => (
              <div
                key={`${column.top.slug}-${i}`}
                className="box-border shrink-0 grow-0 px-1.5 sm:px-2"
                style={{ width: colWidth }}
                aria-hidden={i < index || i >= index + VISIBLE_COLS}
              >
                <ToolColumnSlide column={column} />
              </div>
            ))}
          </div>
        )}
      </div>
      <p className="sr-only" aria-live="polite">
        Showing {visibleTools.map((t) => t.name).join(", ")}
      </p>
    </div>
  );
}
