import { resolveToolIcon } from "./tool-icons";

export function ToolPill({ name }: { name: string }) {
  const icon = resolveToolIcon(name);

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-100 py-1 pl-2 pr-3 text-xs font-medium text-sky-800 dark:bg-sky-500/20 dark:text-sky-200">
      {icon.kind === "logo" ? (
        <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center overflow-hidden rounded-md bg-white shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={icon.src}
            alt=""
            width={14}
            height={14}
            className="h-3.5 w-3.5 object-contain"
            loading="lazy"
            decoding="async"
          />
        </span>
      ) : (
        <span
          className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-md"
          style={{ backgroundColor: icon.bg }}
        >
          <svg
            width="12"
            height="12"
            viewBox={icon.viewBox}
            fill="white"
            aria-hidden
            className="h-3 w-3"
          >
            {icon.node}
          </svg>
        </span>
      )}
      {name}
    </span>
  );
}
