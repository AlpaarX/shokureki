import React, { useEffect, useState } from "react";
import { Eye, Moon, Pencil, Sun } from "lucide-react";

const THEME_KEY = "shokureki.theme";

function initialTheme() {
  const savedTheme = window.localStorage.getItem(THEME_KEY);
  if (savedTheme === "light" || savedTheme === "dark") return savedTheme;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export default function Header({ mobileViewMode, onMobileViewModeChange }) {
  const [theme, setTheme] = useState(initialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    window.localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const nextTheme = theme === "light" ? "dark" : "light";

  return (
    <header className="sticky top-0 z-50 border-b border-[#d8d7d0] bg-white/95 px-[clamp(12px,3vw,40px)] py-2 shadow-sm backdrop-blur dark:border-[#303b35] dark:bg-[#18201c]/95">
      <div className="mx-auto grid max-w-[1800px] grid-cols-[40px_minmax(0,1fr)_40px] items-center gap-2">
        <span aria-hidden="true" />
        <div className="mx-auto hidden w-full max-w-56 grid-cols-2 rounded-xl bg-[#eceeea] p-1 dark:bg-[#101511] max-md:grid">
          <button
            className={[
              "flex h-9 items-center justify-center gap-1.5 rounded-lg text-sm font-semibold transition",
              mobileViewMode === "edit"
                ? "bg-white text-[#1e554a] shadow-sm dark:bg-[#26322c] dark:text-[#a8d9c6]"
                : "text-[#747a76] dark:text-[#9ca9a2]",
            ].join(" ")}
            type="button"
            onClick={() => onMobileViewModeChange("edit")}
            aria-pressed={mobileViewMode === "edit"}
          >
            <Pencil size={15} /> Edit
          </button>
          <button
            className={[
              "flex h-9 items-center justify-center gap-1.5 rounded-lg text-sm font-semibold transition",
              mobileViewMode === "preview"
                ? "bg-white text-[#1e554a] shadow-sm dark:bg-[#26322c] dark:text-[#a8d9c6]"
                : "text-[#747a76] dark:text-[#9ca9a2]",
            ].join(" ")}
            type="button"
            onClick={() => onMobileViewModeChange("preview")}
            aria-pressed={mobileViewMode === "preview"}
          >
            <Eye size={16} /> Preview
          </button>
        </div>
        <button
          className="grid h-10 w-10 place-items-center rounded-full border border-[#d5d4ce] bg-[#faf9f5] text-[#45514b] transition hover:border-[#6c897e] hover:text-[#1e554a] dark:border-[#39453f] dark:bg-[#111713] dark:text-[#d4ddd7] dark:hover:border-[#739889] dark:hover:text-[#a8d9c6]"
          type="button"
          onClick={() => setTheme(nextTheme)}
          title={`Switch to ${nextTheme} theme`}
          aria-label={`Switch to ${nextTheme} theme`}
        >
          {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      </div>
    </header>
  );
}
