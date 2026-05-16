import { getAvatarBackground, getInitials } from "@/lib/avatar";

export type SessionUser = {
  id: string;
  email: string;
  fullName: string;
};

export function UserAvatar({
  user,
  size = "md",
  className = "",
}: {
  user: Pick<SessionUser, "fullName" | "email">;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const seed = user.fullName.trim() || user.email;
  const initials = getInitials(seed);

  const sizeClass =
    size === "sm" ? "h-8 w-8 text-xs" : size === "lg" ? "h-12 w-12 text-base" : "h-9 w-9 text-sm";

  return (
    <span
      className={[
        "inline-flex shrink-0 items-center justify-center rounded-full font-bold text-white shadow-md ring-2 ring-slate-300/80 dark:ring-white/20",
        sizeClass,
        className,
      ].join(" ")}
      style={{ background: getAvatarBackground(seed), color: "#ffffff" }}
      aria-hidden
    >
      {initials}
    </span>
  );
}
