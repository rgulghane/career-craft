/** Deterministic avatar initials + colors from a display name. */

const GRADIENTS = [
  { from: "#8b5cf6", to: "#6d28d9" },
  { from: "#f59e0b", to: "#ea580c" },
  { from: "#10b981", to: "#0d9488" },
  { from: "#0ea5e9", to: "#1d4ed8" },
  { from: "#f43f5e", to: "#db2777" },
  { from: "#d946ef", to: "#7c3aed" },
] as const;

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/** e.g. "Priya Kapoor" → "PK", "alex" → "AL" */
export function getInitials(displayName: string): string {
  const trimmed = displayName.trim();
  if (!trimmed) {
    return "?";
  }
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    const first = parts[0]?.[0] ?? "";
    const last = parts[parts.length - 1]?.[0] ?? "";
    return `${first}${last}`.toUpperCase();
  }
  const word = parts[0] ?? trimmed;
  return word.slice(0, 2).toUpperCase();
}

export function getAvatarBackground(displayName: string): string {
  const { from, to } = GRADIENTS[hashString(displayName.toLowerCase()) % GRADIENTS.length] ?? GRADIENTS[0];
  return `linear-gradient(to bottom right, ${from}, ${to})`;
}
