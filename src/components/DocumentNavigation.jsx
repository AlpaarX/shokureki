import React from "react";
import { FileText, Languages } from "lucide-react";

const documents = [
  { id: "cv", label: "CV", icon: FileText },
  { id: "rirekisho", label: "履歴書", icon: Languages },
  { id: "shokumu", label: "職務経歴書", icon: FileText },
];

export default function DocumentNavigation({ activeTab, mobile = false, onChange }) {
  return (
    <nav
      className={mobile
        ? "fixed inset-x-0 bottom-0 z-50 hidden grid-cols-3 border-t border-[#d8d7d0] bg-white/95 px-2 pt-1 shadow-[0_-5px_20px_rgb(23_32_29/12%)] backdrop-blur dark:border-[#303b35] dark:bg-[#18201c]/95 max-md:grid"
        : "document-type-tabs mb-4 flex flex-nowrap items-center gap-2 overflow-x-auto overflow-y-hidden border-b border-[#deddd6] pb-3 dark:border-[#303b35] max-md:hidden"}
      style={mobile ? { paddingBottom: "calc(4px + env(safe-area-inset-bottom))" } : undefined}
      role="tablist"
      aria-label="Document type"
    >
      {documents.map(({ id, label, icon: Icon }) => {
        const selected = activeTab === id;
        return (
          <button
            className={mobile
              ? [
                "flex min-w-0 flex-col items-center justify-center gap-1 rounded-lg px-1 py-2 text-[11px] font-semibold transition",
                selected
                  ? "bg-[#e7eee8] text-[#1e554a] dark:bg-[#20332a] dark:text-[#a8d9c6]"
                  : "text-[#747a76] dark:text-[#9ca9a2]",
              ].join(" ")
              : [
                "flex h-10 flex-none items-center gap-2 whitespace-nowrap rounded-md px-4 text-sm font-semibold transition",
                selected
                  ? "bg-[#1e554a] text-white"
                  : "border border-[#d5d4ce] bg-[#faf9f5] text-[#555c57] dark:border-[#39453f] dark:bg-[#111713] dark:text-[#bdc8c1]",
              ].join(" ")}
            type="button"
            onClick={() => onChange(id)}
            role="tab"
            aria-selected={selected}
          >
            <Icon size={mobile ? 20 : 16} />
            <span className="truncate">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
