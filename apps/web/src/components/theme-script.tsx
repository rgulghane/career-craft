import Script from "next/script";
import { DEFAULT_THEME, THEME_STORAGE_KEY } from "@/lib/theme-preference";

/** Runs before paint to avoid a flash of the wrong theme. */
export function ThemeScript() {
  const script = `
(function () {
  try {
    var key = ${JSON.stringify(THEME_STORAGE_KEY)};
    var stored = localStorage.getItem(key);
    var theme = stored === "light" || stored === "dark" ? stored : ${JSON.stringify(DEFAULT_THEME)};
    var root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.style.colorScheme = theme;
  } catch (e) {}
})();
`;

  return (
    <Script id="career-craft-theme" strategy="beforeInteractive">
      {script}
    </Script>
  );
}
