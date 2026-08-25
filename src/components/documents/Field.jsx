import React from "react";

export default function Field({ label, value, onChange, multiline = false }) {
  const inputClass = "w-full rounded-md border border-[#cfcec7] bg-[#fbfaf7] px-3 py-2 text-sm text-[#17201d] outline-none focus:border-[#6c897e] focus:ring-4 focus:ring-[#1e554a]/10 dark:border-[#39453f] dark:bg-[#111713] dark:text-[#edf3ef]";
  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-bold uppercase tracking-wide text-[#747a76] dark:text-[#9ca9a2]">{label}</span>
      {multiline ? (
        <textarea className={`${inputClass} min-h-24 resize-y`} value={value} onChange={(event) => onChange(event.target.value)} />
      ) : (
        <input className={inputClass} value={value} onChange={(event) => onChange(event.target.value)} />
      )}
    </label>
  );
}
