"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";

/**
 * Renders a logo image, trying each URL in `sources` before showing `fallback`.
 * Handles dead SimpleIcons links and missing DB icons gracefully.
 */
export function LogoImage({
  src,
  sources,
  alt,
  className,
  fallback,
}: {
  /** Primary URL (legacy — merged into `sources` when provided). */
  src?: string | null;
  /** Ordered URLs to try; first success wins. */
  sources?: readonly string[];
  alt: string;
  className?: string;
  fallback: ReactNode;
}) {
  const candidates = useMemo(() => {
    const list: string[] = [];
    for (const raw of sources ?? (src ? [src] : [])) {
      const trimmed = raw?.trim();
      if (trimmed && !list.includes(trimmed)) {
        list.push(trimmed);
      }
    }
    return list;
  }, [sources, src]);

  const [index, setIndex] = useState(0);
  const candidateKey = candidates.join("|");

  useEffect(() => {
    setIndex(0);
  }, [candidateKey]);

  const current = candidates[index];

  if (!current || index >= candidates.length) {
    return <>{fallback}</>;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      key={current}
      src={current}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      onError={() => setIndex((i) => i + 1)}
    />
  );
}
