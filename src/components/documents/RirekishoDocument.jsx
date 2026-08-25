import React from "react";
import { Languages } from "lucide-react";
import DocumentEditorHeader from "./DocumentEditorHeader";
import Field from "./Field";

export default function RirekishoDocument({
  data,
  html,
  mobileEditorClass,
  mobilePreviewClass,
  onFieldChange,
  onPhotoChange,
  onPrint,
  onTitleChange,
  version,
}) {
  return (
    <div>
      <DocumentEditorHeader
        icon={<Languages size={18} />}
        title={version.title}
        isTemplate={version.isTemplate}
        label="履歴書"
        onPrint={onPrint}
        onTitleChange={onTitleChange}
      />
      <div className="grid grid-cols-[minmax(260px,360px)_minmax(0,1fr)] gap-3 max-lg:grid-cols-1">
        <div className={`${mobileEditorClass} grid max-h-[720px] gap-3 overflow-y-auto pr-1 max-md:max-h-none max-md:overflow-visible max-md:pr-0`}>
          <Field label="作成日" value={data.date} onChange={(value) => onFieldChange("date", value)} />
          <label className="grid gap-1.5">
            <span className="text-xs font-bold uppercase tracking-wide text-[#747a76] dark:text-[#9ca9a2]">証明写真</span>
            <input
              className="w-full rounded-md border border-[#cfcec7] bg-[#fbfaf7] px-3 py-2 text-sm text-[#17201d] outline-none file:mr-3 file:rounded-md file:border-0 file:bg-[#1e554a] file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white dark:border-[#39453f] dark:bg-[#111713] dark:text-[#edf3ef]"
              type="file"
              accept="image/*"
              onChange={(event) => onPhotoChange(event.target.files?.[0])}
            />
            {data.photoDataUrl && (
              <button
                className="h-9 rounded-md border border-[#d1d0ca] bg-white px-3 text-sm font-semibold text-[#555d58] dark:border-[#39453f] dark:bg-[#111713] dark:text-[#d4ddd7]"
                type="button"
                onClick={() => onFieldChange("photoDataUrl", "")}
              >
                Remove photo
              </button>
            )}
          </label>
          <Field label="氏名" value={data.name} onChange={(value) => onFieldChange("name", value)} />
          <Field label="ふりがな" value={data.furigana} onChange={(value) => onFieldChange("furigana", value)} />
          <Field label="生年月日" value={data.birthDate} onChange={(value) => onFieldChange("birthDate", value)} />
          <Field label="性別" value={data.gender} onChange={(value) => onFieldChange("gender", value)} />
          <Field label="郵便番号" value={data.postalCode} onChange={(value) => onFieldChange("postalCode", value)} />
          <Field label="現住所ふりがな（任意）" value={data.addressFurigana || ""} onChange={(value) => onFieldChange("addressFurigana", value)} />
          <Field label="現住所" value={data.address} onChange={(value) => onFieldChange("address", value)} multiline />
          <Field label="電話" value={data.phone} onChange={(value) => onFieldChange("phone", value)} />
          <Field label="メール" value={data.email} onChange={(value) => onFieldChange("email", value)} />
          <Field label="志望職種" value={data.desiredRole} onChange={(value) => onFieldChange("desiredRole", value)} />
          <Field label="職務要約" value={data.summary} onChange={(value) => onFieldChange("summary", value)} multiline />
          <Field label="得意分野・技術" value={data.skills} onChange={(value) => onFieldChange("skills", value)} multiline />
          <Field label="学歴" value={data.education} onChange={(value) => onFieldChange("education", value)} multiline />
          <Field label="職歴" value={data.workHistory} onChange={(value) => onFieldChange("workHistory", value)} multiline />
          <Field label="免許・資格" value={data.certifications} onChange={(value) => onFieldChange("certifications", value)} multiline />
          <Field label="志望動機" value={data.motivation} onChange={(value) => onFieldChange("motivation", value)} multiline />
          <Field label="自己PR" value={data.selfPr} onChange={(value) => onFieldChange("selfPr", value)} multiline />
          <Field label="本人希望欄" value={data.requests} onChange={(value) => onFieldChange("requests", value)} multiline />
        </div>
        <div className={`${mobilePreviewClass} a4-preview-stage max-md:rounded-none max-md:border-0 max-md:p-0`}>
          <div className="a4-preview-page text-[#17201d]">
            <div className="rirekisho-preview" dangerouslySetInnerHTML={{ __html: html }} />
          </div>
        </div>
      </div>
    </div>
  );
}
