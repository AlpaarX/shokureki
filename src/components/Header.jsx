import React from "react";
import { Eye, Pencil } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

export default function Header({ mobileViewMode, onMobileViewModeChange, onThemeChange, theme }) {

  return (
    <header className="sticky top-0 z-50 hidden border-b border-[#d8d7d0] bg-white/95 px-3 py-2 shadow-sm backdrop-blur dark:border-[#303b35] dark:bg-[#18201c]/95 max-md:block">
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
        <ThemeToggle theme={theme} onChange={onThemeChange} />
      </div>
    </header>
  );
}
