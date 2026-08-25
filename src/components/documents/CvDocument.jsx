import React from "react";
import { Eye, FileText } from "lucide-react";
import DocumentEditorHeader from "./DocumentEditorHeader";

function insertTextareaText(textarea, value) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const nextValue = `${textarea.value.slice(0, start)}${value}${textarea.value.slice(end)}`;
  textarea.value = nextValue;
  textarea.selectionStart = start + value.length;
  textarea.selectionEnd = start + value.length;
  textarea.dispatchEvent(new Event("input", { bubbles: true }));
}

export default function CvDocument({ html, mobileEditorClass, mobilePreviewClass, onChange, onPrint, version }) {
  return (
    <div>
      <DocumentEditorHeader
        icon={<FileText size={18} />}
        title={version.title}
        isTemplate={version.isTemplate}
        label="CV"
        onPrint={onPrint}
        onTitleChange={(title) => onChange({ title })}
      />
      <div className="grid grid-cols-2 gap-3 max-lg:grid-cols-1">
        <textarea
          className={`${mobileEditorClass} min-h-[620px] resize-y rounded-md border border-[#d8d7d0] bg-[#fbfaf7] p-4 font-mono text-[13px] leading-6 text-[#17201d] outline-none focus:border-[#6c897e] focus:ring-4 focus:ring-[#1e554a]/10 dark:border-[#303b35] dark:bg-[#111713] dark:text-[#edf3ef] max-md:min-h-[calc(100dvh-220px)] max-md:rounded-xl`}
          value={version.content}
          onChange={(event) => onChange({ content: event.target.value })}
          onKeyDown={(event) => {
            if (event.key !== "Tab") return;
            event.preventDefault();
            insertTextareaText(event.currentTarget, "  ");
          }}
          aria-label="CV Markdown editor"
        />
        <div className={`${mobilePreviewClass} a4-preview-stage max-md:rounded-none max-md:border-0 max-md:p-0`}>
          <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[#747a76]">
            <Eye size={14} /> A4 preview
          </div>
          <article className="a4-preview-page text-sm leading-6 text-[#17201d]">
            <div className="cv-preview stanford-cv" dangerouslySetInnerHTML={{ __html: html }} />
          </article>
        </div>
      </div>
    </div>
  );
}
