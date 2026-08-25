import React from "react";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle({ theme, onChange }) {
  const nextTheme = theme === "light" ? "dark" : "light";

  return (
    <button
      className="grid h-10 w-10 flex-none place-items-center rounded-full border border-[#d5d4ce] bg-[#faf9f5] text-[#45514b] transition hover:border-[#6c897e] hover:text-[#1e554a] dark:border-[#39453f] dark:bg-[#111713] dark:text-[#d4ddd7] dark:hover:border-[#739889] dark:hover:text-[#a8d9c6]"
      type="button"
      onClick={() => onChange(nextTheme)}
      title={`Switch to ${nextTheme} theme`}
      aria-label={`Switch to ${nextTheme} theme`}
    >
      {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
    </button>
  );
}
