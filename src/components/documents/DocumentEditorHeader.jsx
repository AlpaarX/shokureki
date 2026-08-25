import React from "react";
import { Printer } from "lucide-react";

export default function DocumentEditorHeader({ icon, title, isTemplate, label, onPrint, onTitleChange }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <span className="grid h-9 w-9 place-items-center rounded-md bg-[#e7eee8] text-[#1e554a] dark:bg-[#20332a] dark:text-[#a8d9c6]">
        {icon}
      </span>
      <input
        className={`min-w-0 flex-1 bg-transparent text-base font-bold outline-none ${isTemplate ? "cursor-default" : "focus:rounded focus:ring-2 focus:ring-[#1e554a]/20"}`}
        value={title}
        onChange={(event) => {
          if (!isTemplate) onTitleChange(event.target.value);
        }}
        readOnly={isTemplate}
        aria-label={`${label} version name`}
      />
      <button
        className="ml-auto flex h-9 flex-none items-center gap-2 rounded-md border border-[#d5d4ce] bg-[#faf9f5] px-3 text-sm font-semibold text-[#555c57] dark:border-[#39453f] dark:bg-[#111713] dark:text-[#bdc8c1]"
        type="button"
        onClick={onPrint}
      >
        <Printer size={16} /> PDF
      </button>
    </div>
  );
}
