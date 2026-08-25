import React from "react";
import { FileText, Plus, X } from "lucide-react";
import A4Preview from "./A4Preview";
import DocumentEditorHeader from "./DocumentEditorHeader";
import Field from "./Field";

export default function ShokumuDocument({
  data,
  experiences,
  html,
  mobileEditorClass,
  mobilePreviewClass,
  onAddExperience,
  onFieldChange,
  onPrint,
  onRemoveExperience,
  onTitleChange,
  onUpdateExperience,
  version,
}) {
  return (
    <div>
      <DocumentEditorHeader
        icon={<FileText size={18} />}
        title={version.title}
        isTemplate={version.isTemplate}
        label="職務経歴書"
        onPrint={onPrint}
        onTitleChange={onTitleChange}
      />
      <div className="grid grid-cols-[minmax(260px,380px)_minmax(0,1fr)] gap-3 max-lg:grid-cols-1">
        <div className={`${mobileEditorClass} grid max-h-[720px] gap-3 overflow-y-auto pr-1 max-md:max-h-none max-md:overflow-visible max-md:pr-0`}>
          <Field label="作成日" value={data.date} onChange={(value) => onFieldChange("date", value)} />
          <Field label="氏名" value={data.name} onChange={(value) => onFieldChange("name", value)} />
          <Field label="職務要約" value={data.summary} onChange={(value) => onFieldChange("summary", value)} multiline />
          <Field label="活かせる経験・知識・技術" value={data.skills} onChange={(value) => onFieldChange("skills", value)} multiline />
          {experiences.map((experience, index) => (
            <fieldset className="grid gap-3 rounded-md border border-[#d8d7d0] p-3 dark:border-[#39453f]" key={experience.id || index}>
              <legend className="px-1 text-sm font-bold text-[#555d58] dark:text-[#d4ddd7]">
                <span className="inline-flex items-center gap-2">
                  職歴 {index + 1}
                  {experiences.length > 1 && (
                    <button
                      className="grid h-6 w-6 place-items-center rounded text-[#8c3429] hover:bg-[#f2ddd8] dark:text-[#ff9f91] dark:hover:bg-[#3b2925]"
                      type="button"
                      onClick={() => onRemoveExperience(index)}
                      title={`職歴 ${index + 1} を削除`}
                      aria-label={`職歴 ${index + 1} を削除`}
                    >
                      <X size={14} />
                    </button>
                  )}
                </span>
              </legend>
              <Field label="期間" value={experience.period} onChange={(value) => onUpdateExperience(index, "period", value)} />
              <Field label="会社名" value={experience.company} onChange={(value) => onUpdateExperience(index, "company", value)} />
              <Field label="事業内容" value={experience.business} onChange={(value) => onUpdateExperience(index, "business", value)} multiline />
              <Field label="雇用形態" value={experience.employmentType} onChange={(value) => onUpdateExperience(index, "employmentType", value)} />
              <Field label="職種" value={experience.role} onChange={(value) => onUpdateExperience(index, "role", value)} />
              <Field label="担当業務" value={experience.responsibilities} onChange={(value) => onUpdateExperience(index, "responsibilities", value)} multiline />
              <Field label="実績・取り組み" value={experience.achievements} onChange={(value) => onUpdateExperience(index, "achievements", value)} multiline />
              <Field label="使用技術" value={experience.technologies} onChange={(value) => onUpdateExperience(index, "technologies", value)} multiline />
            </fieldset>
          ))}
          <button
            className="flex h-9 items-center justify-center gap-2 rounded-md border border-dashed border-[#aeb5b0] bg-[#f8f7f3] text-sm font-semibold text-[#555d58] hover:border-[#6c897e] hover:text-[#1e554a] dark:border-[#4a5750] dark:bg-[#151c18] dark:text-[#bdc8c1]"
            type="button"
            onClick={onAddExperience}
          >
            <Plus size={16} /> 職歴を追加
          </button>
          <Field label="自己PR" value={data.selfPr} onChange={(value) => onFieldChange("selfPr", value)} multiline />
          <Field label="資格・語学" value={data.certifications} onChange={(value) => onFieldChange("certifications", value)} multiline />
        </div>
        <A4Preview
          className={`${mobilePreviewClass} max-md:rounded-none max-md:border-0 max-md:p-0`}
          contentClassName="cv-preview shokumu-preview"
          html={html}
          pageClassName="text-sm leading-6 text-[#17201d]"
        />
      </div>
    </div>
  );
}
