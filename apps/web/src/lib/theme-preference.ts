export const THEME_STORAGE_KEY = "career-craft-theme";

export type Theme = "light" | "dark";

export const DEFAULT_THEME: Theme = "dark";

export function isTheme(value: string | null | undefined): value is Theme {
  return value === "light" || value === "dark";
}
