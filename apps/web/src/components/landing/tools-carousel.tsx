"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  TOOL_BRANDS,
  buildToolColumns,
  toolBrandIconUrl,
  type ToolBrand,
  type ToolColumn,
} from "./tool-brands";

const INTERVAL_MS = 3000;
const TRANSITION_MS = 600;
const VISIBLE_COLS = 3;
const ROWS = 2;

const COLUMNS = buildToolColumns();

function ToolIconCard({ tool }: { tool: ToolBrand }) {
  return (
    <article className="mx-auto flex w-full min-w-0 flex-col items-center gap-1.5 rounded-xl border border-slate-200 bg-white p-2.5 shadow-md dark:border-slate-600/50 dark:bg-slate-800 dark:shadow-lg sm:gap-2 sm:p-3">
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg sm:h-11 sm:w-11"
        style={{ backgroundColor: `#${tool.color}22` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={toolBrandIconUrl(tool.slug)}
          alt=""
          width={32}
          height={32}
          className="h-7 w-7 object-contain dark:invert sm:h-8 sm:w-8"
          loading="lazy"
          decoding="async"
        />
      </div>
      <span className="w-full truncate text-center text-[11px] font-semibold leading-tight text-slate-900 dark:text-slate-100 sm:text-xs">
        {tool.name}
      </span>
    </article>
  );
}

function ToolColumnSlide({ column }: { column: ToolColumn }) {
  return (
    <div className="flex h-full flex-col gap-2 sm:gap-2.5">
      <ToolIconCard tool={column.top} />
      {column.bottom ? <ToolIconCard tool={column.bottom} /> : <div className="flex-1" aria-hidden />}
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
    return [col.top, col.bottom].filter(Boolean) as ToolBrand[];
  }).flat();

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
        style={{ minHeight: "13.5rem" }}
      >
        {!ready ? (
          <div className="grid grid-cols-3 grid-rows-2 gap-2 sm:gap-3">
            {TOOL_BRANDS.slice(0, VISIBLE_COLS * ROWS).map((tool) => (
              <ToolIconCard key={tool.slug} tool={tool} />
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
                className="box-border shrink-0 grow-0 px-1 sm:px-1.5"
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
