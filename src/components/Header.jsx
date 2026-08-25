import React, { useEffect, useRef, useState } from "react";
import { Moon, Sun } from "lucide-react";

const THEME_KEY = "shokureki.theme";

function initialTheme() {
  const savedTheme = window.localStorage.getItem(THEME_KEY);
  if (savedTheme === "light" || savedTheme === "dark") return savedTheme;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export default function Header() {
  const [theme, setTheme] = useState(initialTheme);
  const [visible, setVisible] = useState(true);
  const previousScrollY = useRef(window.scrollY);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    window.localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    let frameId = null;

    const updateVisibility = () => {
      const currentScrollY = Math.max(0, window.scrollY);
      const movement = currentScrollY - previousScrollY.current;

      if (currentScrollY < 24) setVisible(true);
      else if (movement > 0) setVisible(false);
      else if (movement < 0) setVisible(true);

      previousScrollY.current = currentScrollY;
      frameId = null;
    };

    const handleScroll = () => {
      if (frameId === null) frameId = window.requestAnimationFrame(updateVisibility);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (frameId !== null) window.cancelAnimationFrame(frameId);
    };
  }, []);

  const nextTheme = theme === "light" ? "dark" : "light";

  return (
    <header
      className={[
        "sticky top-0 z-50 border-b border-[#d8d7d0] bg-white/95 px-[clamp(16px,3vw,40px)] py-3 shadow-sm backdrop-blur transition-transform duration-300 dark:border-[#303b35] dark:bg-[#18201c]/95",
        visible ? "translate-y-0" : "-translate-y-full",
      ].join(" ")}
    >
      <div className="mx-auto flex max-w-[1800px] items-center gap-3">
        <h1 className="truncate text-xl font-bold tracking-tight text-[#173b36] dark:text-[#edf3ef]">職歴</h1>
        <button
          className="ml-auto grid h-10 w-10 flex-none place-items-center rounded-full border border-[#d5d4ce] bg-[#faf9f5] text-[#45514b] transition hover:border-[#6c897e] hover:text-[#1e554a] dark:border-[#39453f] dark:bg-[#111713] dark:text-[#d4ddd7] dark:hover:border-[#739889] dark:hover:text-[#a8d9c6]"
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
