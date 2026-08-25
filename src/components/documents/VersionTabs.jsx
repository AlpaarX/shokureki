import React from "react";
import { FileText, Languages, Lock, Plus, X } from "lucide-react";

const typeLabel = (type) => type === "cv" ? "CV" : type === "rirekisho" ? "履歴書" : "職務経歴書";

export default function VersionTabs({
  activeId,
  documentType,
  nameDraft,
  onAdd,
  onCancelRename,
  onClose,
  onFinishRename,
  onNameDraftChange,
  onSelect,
  onStartRename,
  renamingId,
  versions,
}) {
  return (
    <div className="document-version-tabs mb-4 flex min-w-0 items-end overflow-x-auto overflow-y-hidden border-b border-[#cbc9c1] px-2 dark:border-[#3b4841] max-md:-mx-3 max-md:px-3">
      {versions.map((version) => {
        const selected = activeId === version.id;
        return (
          <div
            key={version.id}
            className={[
              "group relative -mb-px flex h-10 min-w-32 max-w-56 items-center gap-2 rounded-t-lg border pl-4 pr-2 text-left text-sm font-semibold transition",
              selected
                ? "z-10 border-[#cbc9c1] border-b-white bg-white text-[#17201d] dark:border-[#3b4841] dark:border-b-[#18201c] dark:bg-[#18201c] dark:text-[#edf3ef]"
                : "border-transparent bg-[#eceae4] text-[#68706b] hover:bg-[#e3e1da] dark:bg-[#111713] dark:text-[#aab5ae] dark:hover:bg-[#202a25]",
            ].join(" ")}
            onClick={() => onSelect(version.id)}
            onDoubleClick={() => onStartRename(version)}
            onAuxClick={(event) => {
              if (event.button === 1) {
                event.preventDefault();
                onClose(version.id);
              }
            }}
            onKeyDown={(event) => {
              if (event.target === event.currentTarget && (event.key === "Enter" || event.key === " ")) {
                event.preventDefault();
                onSelect(version.id);
              }
            }}
            title={version.isTemplate ? "Template (locked tab)" : version.title}
            role="tab"
            tabIndex={0}
            aria-selected={selected}
          >
            {version.isTemplate
              ? <Lock size={14} />
              : documentType === "rirekisho" ? <Languages size={14} /> : <FileText size={14} />}
            {renamingId === version.id ? (
              <input
                className="min-w-0 flex-1 rounded border border-[#6c897e] bg-white px-1.5 py-0.5 text-sm text-[#17201d] outline-none dark:bg-[#18201c] dark:text-[#edf3ef]"
                value={nameDraft}
                onChange={(event) => onNameDraftChange(event.target.value)}
                onClick={(event) => event.stopPropagation()}
                onDoubleClick={(event) => event.stopPropagation()}
                onBlur={() => onFinishRename(version.id)}
                onKeyDown={(event) => {
                  event.stopPropagation();
                  if (event.key === "Enter") event.currentTarget.blur();
                  if (event.key === "Escape") onCancelRename();
                }}
                aria-label="Version name"
                autoFocus
              />
            ) : (
              <span className="min-w-0 flex-1 truncate">{version.title}</span>
            )}
            {!version.isTemplate && (
              <button
                className="grid h-6 w-6 flex-none place-items-center rounded text-[#7d837f] opacity-60 transition hover:bg-[#d8d6cf] hover:text-[#8c3429] group-hover:opacity-100 dark:text-[#9ca9a2] dark:hover:bg-[#313d37] dark:hover:text-[#ff9f91]"
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onClose(version.id);
                }}
                title={`Close ${version.title}`}
                aria-label={`Close ${version.title}`}
              >
                <X size={14} />
              </button>
            )}
          </div>
        );
      })}
      <button
        className="mb-1 ml-1 grid h-8 w-8 flex-none place-items-center rounded-md text-[#5d6761] transition hover:bg-[#dfddd6] hover:text-[#1e554a] dark:text-[#aab5ae] dark:hover:bg-[#26322c] dark:hover:text-[#a8d9c6]"
        type="button"
        onClick={onAdd}
        title={`Add ${typeLabel(documentType)} version`}
        aria-label={`Add ${documentType} version`}
      >
        <Plus size={18} />
      </button>
    </div>
  );
}
