"use client";

import { useState, type ReactNode } from "react";

/**
 * Renders a logo image, falling back to `fallback` when there is no source or
 * the image fails to load (e.g. a CDN icon that no longer exists). Keeps the
 * mentor cards from showing broken-image icons.
 */
export function LogoImage({
  src,
  alt,
  className,
  fallback,
}: {
  src?: string | null;
  alt: string;
  className?: string;
  fallback: ReactNode;
}) {
  const [errored, setErrored] = useState(false);
  const trimmed = src?.trim();

  if (!trimmed || errored) {
    return <>{fallback}</>;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={trimmed}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      onError={() => setErrored(true)}
    />
  );
}
