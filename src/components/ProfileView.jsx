import React, { useEffect, useMemo, useState } from "react";
import { Eye, FileText, Languages, Lock, Plus, Printer, X } from "lucide-react";
import DocumentNavigation from "./DocumentNavigation";
import { generateEnglishCv, generateRirekishoData, generateShokumuKeirekishoData } from "../utils/documents";
import { defaultProfileText } from "../utils/profile";

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function inlineMarkdown(value) {
  return escapeHtml(value).replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
}

function renderAlignedLine(value, tagName, className) {
  const parts = value.split(/\s+\|\s+/);
  if (parts.length < 2) return `<${tagName}>${inlineMarkdown(value)}</${tagName}>`;
  const secondary = parts.pop();
  return `<${tagName} class="${className}"><span>${inlineMarkdown(parts.join(" | "))}</span><span>${inlineMarkdown(secondary)}</span></${tagName}>`;
}

function listDepth(indent) {
  const columns = [...indent].reduce((total, char) => total + (char === "\t" ? 2 : 1), 0);
  return Math.max(0, Math.floor(columns / 2));
}

function renderListItems(items) {
  return `<ul>${items.map((item) => (
    `<li>${inlineMarkdown(item.text)}${item.children.length ? renderListItems(item.children) : ""}</li>`
  )).join("")}</ul>`;
}

function parseList(lines, startIndex) {
  const root = [];
  const stack = [{ depth: -1, children: root }];
  let index = startIndex;

  while (index < lines.length) {
    const match = lines[index].match(/^([ \t]*)-\s+(.*)$/);
    if (!match) break;
    let depth = listDepth(match[1]);
    while (stack.length > 1 && stack[stack.length - 1].depth >= depth) stack.pop();
    const parent = stack[stack.length - 1];
    if (depth > parent.depth + 1) depth = parent.depth + 1;
    const item = { text: match[2], children: [] };
    parent.children.push(item);
    stack.push({ depth, children: item.children });
    index += 1;
  }

  return { html: renderListItems(root), nextIndex: index };
}

function renderMarkdown(markdown) {
  const lines = String(markdown || "").split("\n");
  const html = [];
  let hasTitle = false;
  let hasContactLine = false;

  for (let index = 0; index < lines.length;) {
    const line = lines[index];
    if (/^[ \t]*-\s+/.test(line)) {
      const list = parseList(lines, index);
      html.push(list.html);
      index = list.nextIndex;
      continue;
    }
    if (line.startsWith("### ")) html.push(renderAlignedLine(line.slice(4), "h3", "cv-entry-heading"));
    else if (line.startsWith("## ")) html.push(`<h2>${inlineMarkdown(line.slice(3))}</h2>`);
    else if (line.startsWith("# ")) {
      html.push(`<h1>${inlineMarkdown(line.slice(2))}</h1>`);
      hasTitle = true;
    } else if (line.trim() && hasTitle && !hasContactLine) {
      html.push(`<p class="cv-contact">${inlineMarkdown(line)}</p>`);
      hasContactLine = true;
    } else if (line.trim() && /\s+\|\s+/.test(line)) {
      html.push(renderAlignedLine(line, "p", "cv-entry-meta"));
    } else if (line.trim()) html.push(`<p>${inlineMarkdown(line)}</p>`);
    index += 1;
  }

  return html.join("");
}

function insertTextareaText(textarea, value) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const nextValue = `${textarea.value.slice(0, start)}${value}${textarea.value.slice(end)}`;
  textarea.value = nextValue;
  textarea.selectionStart = start + value.length;
  textarea.selectionEnd = start + value.length;
  textarea.dispatchEvent(new Event("input", { bubbles: true }));
}

function splitRirekishoLines(value) {
  return String(value || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function parseDatedEntry(line) {
  const match = line.match(/^(\d{4}|YYYY)年(?:\s*(\d{1,2}|MM)月)?\s*(.*)$/);
  if (!match) return { year: "", month: "", text: line };
  return { year: match[1], month: match[2] || "", text: match[3] };
}

function renderDatedRows(value, emptyRows = 4) {
  const rows = splitRirekishoLines(value).map(parseDatedEntry);
  while (rows.length < emptyRows) rows.push({ year: "", month: "", text: "" });
  return rows.map((entry) => `
    <tr>
      <td class="rirekisho-year">${escapeHtml(entry.year)}</td>
      <td class="rirekisho-month">${escapeHtml(entry.month)}</td>
      <td>${escapeHtml(entry.text)}</td>
    </tr>
  `).join("");
}

function renderList(value) {
  const items = splitRirekishoLines(value);
  if (!items.length) return "";
  return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function renderRirekishoHtml(data) {
  const text = (value) => escapeHtml(value).replaceAll("\n", "<br>");
  const appealSections = [
    data.motivation && `<strong>志望動機</strong><br>${text(data.motivation)}`,
    data.selfPr && `<strong>自己PR</strong><br>${text(data.selfPr)}`,
  ].filter(Boolean);
  const photo = data.photoDataUrl
    ? `<img class="rirekisho-photo-image" src="${escapeHtml(data.photoDataUrl)}" alt="証明写真">`
    : `
      <div class="rirekisho-photo-placeholder">
        <strong>写真を貼る位置</strong>
        <span>縦 4cm × 横 3cm</span>
        <span>本人単身胸から上</span>
      </div>
    `;

  return `
    <article class="rirekisho-document">
      <h1>履歴書</h1>
      <div class="rirekisho-date">${escapeHtml(data.date)} 現在</div>
      <div class="rirekisho-top">
        <table class="rirekisho-basic-table">
          <tbody>
            <tr>
              <th>ふりがな</th>
              <td colspan="3">${text(data.furigana)}</td>
            </tr>
            <tr>
              <th>氏名</th>
              <td colspan="3" class="rirekisho-name">${text(data.name)}</td>
            </tr>
            <tr>
              <th>生年月日</th>
              <td class="rirekisho-birth">${text(data.birthDate)}</td>
              <th>※性別</th>
              <td>${text(data.gender)}</td>
            </tr>
            ${data.addressFurigana ? `
              <tr>
                <th>ふりがな</th>
                <td colspan="3">${text(data.addressFurigana)}</td>
              </tr>
            ` : ""}
            <tr>
              <th>現住所 〒</th>
              <td colspan="3">${text([data.postalCode, data.address].filter(Boolean).join(" "))}</td>
            </tr>
            <tr>
              <th>電話</th>
              <td colspan="3">${text(data.phone)}</td>
            </tr>
            <tr>
              <th>メール</th>
              <td colspan="3" class="rirekisho-email">${text(data.email)}</td>
            </tr>
          </tbody>
        </table>
        <aside class="rirekisho-photo">${photo}</aside>
      </div>
      <table class="rirekisho-history-table">
        <thead>
          <tr>
            <th class="rirekisho-year">年</th>
            <th class="rirekisho-month">月</th>
            <th>学歴・職歴（各別にまとめて書く）</th>
          </tr>
        </thead>
        <tbody>
          <tr><td></td><td></td><td class="rirekisho-section-label">学歴</td></tr>
          ${renderDatedRows(data.education, 3)}
          <tr><td></td><td></td><td class="rirekisho-section-label">職歴</td></tr>
          ${renderDatedRows(data.workHistory, 6)}
        </tbody>
      </table>
      <table class="rirekisho-history-table">
        <thead>
          <tr>
            <th class="rirekisho-year">年</th>
            <th class="rirekisho-month">月</th>
            <th>免許・資格</th>
          </tr>
        </thead>
        <tbody>
          ${renderDatedRows(data.certifications, 4)}
        </tbody>
      </table>
      <table class="rirekisho-notes-table rirekisho-notes-section">
        <tbody>
          <tr>
            <th colspan="3">志望の動機、特技、好きな学科、アピールポイントなど</th>
          </tr>
          <tr>
            <td colspan="3" class="rirekisho-appeal">${appealSections.join("<br><br>") || text([data.summary, data.skills].filter(Boolean).join("\n"))}</td>
          </tr>
        </tbody>
      </table>
      <table class="rirekisho-notes-table rirekisho-notes-section">
        <tbody>
          <tr>
            <th colspan="3">本人希望記入欄（特に給料・職種・勤務時間・勤務地・その他についての希望などがあれば記入）</th>
          </tr>
          <tr>
            <td colspan="3">${text([data.desiredRole && `希望職種：${data.desiredRole}`, data.requests].filter(Boolean).join("\n"))}</td>
          </tr>
        </tbody>
      </table>
    </article>
  `;
}

function getShokumuExperiences(data) {
  if (Array.isArray(data.experiences) && data.experiences.length) return data.experiences;
  return [{
    period: data.period || "",
    company: data.company || "",
    business: data.business || "",
    employmentType: data.employmentType || "",
    role: data.role || "",
    responsibilities: data.responsibilities || "",
    achievements: data.achievements || "",
    technologies: data.technologies || "",
  }];
}

function renderShokumuExperience(experience) {
  const text = (value) => escapeHtml(value).replaceAll("\n", "<br>");
  const optionalRow = (label, value, renderValue = text) => value
    ? `<tr><th>${label}</th><td>${renderValue(value)}</td></tr>`
    : "";

  return `
    <table class="shokumu-career-table">
      <tbody>
        ${optionalRow("期間", experience.period)}
        ${optionalRow("会社名", experience.company)}
        ${optionalRow("事業内容", experience.business)}
        ${optionalRow("雇用形態", experience.employmentType)}
        ${optionalRow("職種", experience.role)}
        ${optionalRow("担当業務", experience.responsibilities, renderList)}
        ${optionalRow("実績・取り組み", experience.achievements, renderList)}
        ${optionalRow("使用技術", experience.technologies)}
      </tbody>
    </table>
  `;
}

function renderShokumuKeirekishoHtml(data) {
  const text = (value) => escapeHtml(value).replaceAll("\n", "<br>");
  const experiences = getShokumuExperiences(data);

  return `
    <article class="shokumu-document">
      <h1>職務経歴書</h1>
      <div class="shokumu-meta">日付：${escapeHtml(data.date)}</div>
      <div class="shokumu-meta">氏名：${escapeHtml(data.name || "[氏名]")}</div>
      <section>
        <h2>職務要約</h2>
        <p>${text(data.summary)}</p>
      </section>
      <section>
        <h2>活かせる経験・知識・技術</h2>
        ${renderList(data.skills)}
      </section>
      <section>
        <h2>職務経歴</h2>
        ${experiences.map(renderShokumuExperience).join("")}
      </section>
      <section>
        <h2>自己PR</h2>
        <p>${text(data.selfPr)}</p>
      </section>
      <section>
        <h2>資格・語学</h2>
        ${renderList(data.certifications)}
      </section>
    </article>
  `;
}

function printDocument(title, bodyHtml, extraStyle = "") {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;
  printWindow.document.write(`
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${escapeHtml(title)}</title>
        <style>
          @page { size: A4; margin: 0; }
          * { box-sizing: border-box; }
          body { position: relative; margin: 0; padding: 16mm; color: #17201d; background: #fff; font: 14px/1.6 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
          h1 { margin: 0 0 18px; font-size: 28px; line-height: 1.2; }
          h2 { margin: 24px 0 8px; border-bottom: 1px solid #d8d7d0; padding-bottom: 4px; font-size: 17px; }
          h3 { margin: 14px 0 4px; font-size: 15px; }
          p { margin: 6px 0; }
          ul { margin: 8px 0 0 20px; padding: 0; }
          tr, td, th, li, .rirekisho-top, .rirekisho-notes-section, .cv-entry-heading, .cv-entry-meta {
            break-inside: avoid;
            page-break-inside: avoid;
          }
          h1, h2, h3, .cv-entry-heading, .cv-entry-meta {
            break-after: avoid;
            page-break-after: avoid;
          }
          thead { display: table-header-group; }
          .shokumu-document { font-family: "Yu Gothic", "Hiragino Kaku Gothic ProN", Meiryo, sans-serif; font-size: 10.5pt; line-height: 1.42; }
          .shokumu-document h1 { text-align: center; letter-spacing: .12em; }
          .shokumu-document h2 { margin: 16px 0 6px; border-bottom-color: #222; break-after: avoid; page-break-after: avoid; }
          .shokumu-document p { margin: 4px 0; }
          .shokumu-document ul { margin-top: 3px; }
          .shokumu-document section { break-inside: auto; page-break-inside: auto; }
          .shokumu-meta { text-align: right; }
          .shokumu-career-table { width: 100%; margin-top: 8px; border-collapse: collapse; table-layout: fixed; break-inside: auto; page-break-inside: auto; }
          .shokumu-career-table + .shokumu-career-table { break-before: page; page-break-before: always; }
          .shokumu-career-table th, .shokumu-career-table td { border: 1px solid #222; padding: 5px 8px; vertical-align: top; }
          .shokumu-career-table th { width: 116px; background: #f4f2ed; text-align: center; }
          .shokumu-career-table ul { margin-top: 0; }
          .rirekisho-document { font-family: "Yu Gothic", "Hiragino Kaku Gothic ProN", Meiryo, sans-serif; }
          .rirekisho-date { text-align: right; margin: -4px 0 6px; }
          .rirekisho-document h1 { margin-bottom: 8px; text-align: center; letter-spacing: .2em; }
          .rirekisho-top { display: grid; grid-template-columns: minmax(0, 1fr) 30mm; gap: 2mm; align-items: start; }
          .rirekisho-photo { display: grid; place-items: center; width: 30mm; height: 40mm; border: 1px solid #222; text-align: center; font-size: 10px; line-height: 1.35; overflow: hidden; }
          .rirekisho-photo-placeholder { display: grid; gap: 4px; padding: 8px; }
          .rirekisho-photo-image { width: 100%; height: 100%; object-fit: cover; }
          .rirekisho-name { height: 42px; font-size: 20px; font-weight: 700; }
          .rirekisho-birth { white-space: nowrap; font-size: 12px; }
          .rirekisho-email { overflow-wrap: anywhere; word-break: break-word; }
          table { width: 100%; border-collapse: collapse; table-layout: fixed; }
          th, td { border: 1px solid #222; padding: 5px 7px; vertical-align: middle; }
          th { background: #f4f2ed; font-weight: 700; text-align: center; }
          td { height: 30px; white-space: normal; overflow-wrap: anywhere; }
          .rirekisho-basic-table th { width: 86px; }
          .rirekisho-history-table, .rirekisho-notes-table { margin-top: 8px; }
          .rirekisho-year { width: 54px; text-align: center; }
          .rirekisho-month { width: 42px; text-align: center; }
          .rirekisho-section-label { text-align: center; font-weight: 700; }
          .rirekisho-notes-table th { text-align: left; }
          .rirekisho-notes-table td { height: 86px; vertical-align: top; }
          .rirekisho-appeal { line-height: 1.5; }
          .print-page-count {
            display: none;
            position: absolute;
            right: 14mm;
            color: #555;
            font-size: 9pt;
            line-height: 1;
          }
          body.has-page-count .print-page-count { display: block; }
          ${extraStyle}
        </style>
      </head>
      <body>
        ${bodyHtml}
        <script>
          (() => {
            const pageHeightMm = 297;
            const pageHeightPx = pageHeightMm / 25.4 * 96;
            const updatePageCount = () => {
              document.querySelectorAll(".print-page-count").forEach((counter) => counter.remove());
              document.body.classList.remove("has-page-count");
              let totalPages = Math.max(1, Math.ceil(document.documentElement.scrollHeight / pageHeightPx));
              document.body.classList.toggle("has-page-count", totalPages > 1);
              if (totalPages <= 1) return;
              totalPages = Math.max(1, Math.ceil(document.documentElement.scrollHeight / pageHeightPx));
              for (let page = 1; page <= totalPages; page += 1) {
                const counter = document.createElement("div");
                counter.className = "print-page-count";
                counter.setAttribute("aria-hidden", "true");
                counter.textContent = \`\${page} / \${totalPages}\`;
                counter.style.top = \`calc(\${page * pageHeightMm}mm - 10mm)\`;
                document.body.appendChild(counter);
              }
            };
            window.addEventListener("load", updatePageCount);
            window.addEventListener("beforeprint", updatePageCount);
            setTimeout(updatePageCount, 100);
          })();
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
}

const stanfordCvPrintStyle = `
  @page { size: A4; margin: 0; }
  body { padding: 11mm 13mm; }
  .stanford-cv {
    color: #111;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 10pt;
    line-height: 1.18;
  }
  .stanford-cv h1 {
    margin: 0 0 2px;
    text-align: center;
    font-size: 19pt;
    font-weight: 700;
    line-height: 1.1;
  }
  .stanford-cv .cv-contact {
    margin: 0 0 11px;
    text-align: center;
    font-size: 9.5pt;
    white-space: nowrap;
  }
  .stanford-cv h2 {
    margin: 10px 0 5px;
    border-bottom: 1.25px solid #111;
    padding: 0 0 2px;
    font-size: 10pt;
    font-weight: 700;
    line-height: 1.15;
    break-after: avoid;
    page-break-after: avoid;
  }
  .stanford-cv h3,
  .stanford-cv .cv-entry-meta {
    display: flex;
    justify-content: space-between;
    gap: 20px;
  }
  .stanford-cv h3 {
    margin: 6px 0 0;
    font-size: 10pt;
    font-weight: 700;
    line-height: 1.18;
    break-after: avoid;
    page-break-after: avoid;
  }
  .stanford-cv .cv-entry-meta {
    margin: 0;
    font-style: italic;
  }
  .stanford-cv h3 span:last-child,
  .stanford-cv .cv-entry-meta span:last-child {
    flex: none;
    text-align: right;
  }
  .stanford-cv p { margin: 2px 0; }
  .stanford-cv ul { margin: 2px 0 0; padding-left: 16px; list-style: disc outside; }
  .stanford-cv li { display: list-item; margin: 0; padding-left: 2px; }
`;

function Field({ label, value, onChange, multiline = false }) {
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

function documentId(type) {
  return `${type}-${window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`}`;
}

function newDocumentVersion(type, sourceText, number) {
  const shared = {
    id: documentId(type),
    title: `${type === "cv" ? "CV" : type === "rirekisho" ? "履歴書" : "職務経歴書"} ${number}`,
    updatedAt: new Date().toISOString(),
  };
  if (type === "cv") return { ...shared, content: generateEnglishCv(sourceText) };
  if (type === "rirekisho") return { ...shared, data: generateRirekishoData(sourceText) };
  return { ...shared, data: generateShokumuKeirekishoData(sourceText) };
}

function newTemplateVersion(type, sourceText) {
  return {
    ...newDocumentVersion(type, sourceText, 1),
    id: `${type}-template`,
    title: "Template",
    isTemplate: true,
  };
}

function copyTemplateVersion(type, template, number) {
  const shared = {
    id: documentId(type),
    title: `${type === "cv" ? "CV" : type === "rirekisho" ? "履歴書" : "職務経歴書"} ${number}`,
    updatedAt: new Date().toISOString(),
  };
  if (type === "cv") return { ...shared, content: template.content };
  return { ...shared, data: { ...template.data } };
}

function createDocumentLibrary(sourceText) {
  const cvTemplate = newTemplateVersion("cv", sourceText);
  const rirekishoTemplate = newTemplateVersion("rirekisho", sourceText);
  const shokumuTemplate = newTemplateVersion("shokumu", sourceText);
  const cv = newDocumentVersion("cv", sourceText, 1);
  const rirekisho = newDocumentVersion("rirekisho", sourceText, 1);
  const shokumu = newDocumentVersion("shokumu", sourceText, 1);
  return {
    cv: [cvTemplate, cv],
    rirekisho: [rirekishoTemplate, rirekisho],
    shokumu: [shokumuTemplate, shokumu],
    active: { cv: cv.id, rirekisho: rirekisho.id, shokumu: shokumu.id },
  };
}

function isDocumentLibrary(value) {
  return value
    && ["cv", "rirekisho", "shokumu"].every((type) => Array.isArray(value[type]) && value[type].length);
}

function hasDocumentTemplates(value) {
  return isDocumentLibrary(value)
    && ["cv", "rirekisho", "shokumu"].every((type) => value[type].some((version) => version.isTemplate));
}

function addMissingTemplates(library, sourceText) {
  return ["cv", "rirekisho", "shokumu"].reduce((next, type) => ({
    ...next,
    [type]: next[type].some((version) => version.isTemplate)
      ? next[type]
      : [newTemplateVersion(type, sourceText), ...next[type]],
  }), { ...library });
}

export default function ProfileView({
  documents,
  documentTab,
  onDocumentTabChange,
  onDocumentsChange,
}) {
  const fallbackLibrary = useMemo(() => createDocumentLibrary(defaultProfileText), []);
  const library = useMemo(
    () => isDocumentLibrary(documents) ? addMissingTemplates(documents, defaultProfileText) : fallbackLibrary,
    [documents, fallbackLibrary],
  );
  const [renamingVersionId, setRenamingVersionId] = useState(null);
  const [versionNameDraft, setVersionNameDraft] = useState("");
  const activeVersion = (type) => {
    const versions = library[type];
    return versions.find((version) => version.id === library.active?.[type]) || versions[0];
  };
  const cvVersion = activeVersion("cv");
  const rirekishoVersion = activeVersion("rirekisho");
  const shokumuVersion = activeVersion("shokumu");
  const cvMarkdown = cvVersion.content;
  const rirekisho = rirekishoVersion.data;
  const shokumu = shokumuVersion.data;
  const shokumuExperiences = getShokumuExperiences(shokumu);
  const cvHtml = useMemo(() => renderMarkdown(cvMarkdown), [cvMarkdown]);
  const rirekishoHtml = useMemo(() => renderRirekishoHtml(rirekisho), [rirekisho]);
  const shokumuHtml = useMemo(() => renderShokumuKeirekishoHtml(shokumu), [shokumu]);

  useEffect(() => {
    if (documents !== null && (!isDocumentLibrary(documents) || !hasDocumentTemplates(documents))) {
      onDocumentsChange(library);
    }
  }, [documents, library, onDocumentsChange]);

  const updateVersionById = (type, id, changes) => {
    onDocumentsChange({
      ...library,
      [type]: library[type].map((version) => (
        version.id === id
          ? {
            ...version,
            ...changes,
            ...(version.isTemplate ? { title: "Template", isTemplate: true } : {}),
            updatedAt: new Date().toISOString(),
          }
          : version
      )),
    });
  };

  const updateVersion = (type, changes) => {
    updateVersionById(type, activeVersion(type).id, changes);
  };

  const updateRirekisho = (field, value) => {
    updateVersion("rirekisho", { data: { ...rirekisho, [field]: value } });
  };

  const updateShokumu = (field, value) => {
    updateVersion("shokumu", { data: { ...shokumu, [field]: value } });
  };

  const updateShokumuExperience = (index, field, value) => {
    updateVersion("shokumu", {
      data: {
        ...shokumu,
        experiences: shokumuExperiences.map((experience, experienceIndex) => (
          experienceIndex === index ? { ...experience, [field]: value } : experience
        )),
      },
    });
  };

  const addShokumuExperience = () => {
    updateVersion("shokumu", {
      data: {
        ...shokumu,
        experiences: [
          ...shokumuExperiences,
          {
            id: documentId("experience"),
            period: "",
            company: "",
            business: "",
            employmentType: "",
            role: "",
            responsibilities: "",
            achievements: "",
            technologies: "",
          },
        ],
      },
    });
  };

  const removeShokumuExperience = (index) => {
    if (shokumuExperiences.length <= 1) return;
    updateVersion("shokumu", {
      data: {
        ...shokumu,
        experiences: shokumuExperiences.filter((_, experienceIndex) => experienceIndex !== index),
      },
    });
  };

  const updateRirekishoPhoto = (file) => {
    if (!file) {
      updateRirekisho("photoDataUrl", "");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => updateRirekisho("photoDataUrl", reader.result || "");
    reader.readAsDataURL(file);
  };

  const selectVersion = (type, id) => {
    onDocumentsChange({ ...library, active: { ...library.active, [type]: id } });
  };

  const closeVersion = (type, id) => {
    const versions = library[type];
    const closingIndex = versions.findIndex((version) => version.id === id);
    if (closingIndex < 0) return;
    if (versions[closingIndex].isTemplate) return;
    let remaining = versions.filter((version) => version.id !== id);
    if (!remaining.length) {
      remaining = [newDocumentVersion(type, defaultProfileText, 1)];
    }
    const activeId = library.active?.[type];
    const nextActiveId = activeId === id
      ? (remaining[closingIndex] || remaining[closingIndex - 1] || remaining[0]).id
      : activeId;
    onDocumentsChange({
      ...library,
      [type]: remaining,
      active: { ...library.active, [type]: nextActiveId },
    });
    if (renamingVersionId === id) setRenamingVersionId(null);
  };

  const startRenamingVersion = (version) => {
    if (version.isTemplate) return;
    setRenamingVersionId(version.id);
    setVersionNameDraft(version.title);
  };

  const finishRenamingVersion = (type, id) => {
    const nextTitle = versionNameDraft.trim();
    if (nextTitle) updateVersionById(type, id, { title: nextTitle });
    setRenamingVersionId(null);
  };

  const addVersion = (type) => {
    const template = library[type].find((version) => version.isTemplate)
      || newTemplateVersion(type, defaultProfileText);
    const versionNumber = library[type].filter((item) => !item.isTemplate).length + 1;
    const version = copyTemplateVersion(type, template, versionNumber);
    onDocumentsChange({
      ...library,
      [type]: [...library[type], version],
      active: { ...library.active, [type]: version.id },
    });
  };

  return (
    <section className="mx-auto grid min-w-0 max-w-[1800px] gap-5 overflow-hidden px-[clamp(12px,2vw,28px)] py-7 text-[#17201d] dark:text-[#edf3ef] max-md:pb-24">
      <section className="min-w-0 max-w-full overflow-hidden rounded-lg border border-[#d8d7d0] bg-white p-4 dark:border-[#303b35] dark:bg-[#18201c]">
        <DocumentNavigation activeTab={documentTab} onChange={onDocumentTabChange} />

        <div className="document-version-tabs mb-4 flex min-w-0 items-end overflow-x-auto overflow-y-hidden border-b border-[#cbc9c1] px-2 dark:border-[#3b4841]">
          {library[documentTab].map((version) => {
            const selected = activeVersion(documentTab).id === version.id;
            return (
              <div
                key={version.id}
                className={[
                  "group relative -mb-px flex h-10 min-w-32 max-w-56 items-center gap-2 rounded-t-lg border pl-4 pr-2 text-left text-sm font-semibold transition",
                  selected
                    ? "z-10 border-[#cbc9c1] border-b-white bg-white text-[#17201d] dark:border-[#3b4841] dark:border-b-[#18201c] dark:bg-[#18201c] dark:text-[#edf3ef]"
                    : "border-transparent bg-[#eceae4] text-[#68706b] hover:bg-[#e3e1da] dark:bg-[#111713] dark:text-[#aab5ae] dark:hover:bg-[#202a25]",
                ].join(" ")}
                onClick={() => selectVersion(documentTab, version.id)}
                onDoubleClick={() => startRenamingVersion(version)}
                onAuxClick={(event) => {
                  if (event.button === 1) {
                    event.preventDefault();
                    closeVersion(documentTab, version.id);
                  }
                }}
                onKeyDown={(event) => {
                  if (event.target === event.currentTarget && (event.key === "Enter" || event.key === " ")) {
                    event.preventDefault();
                    selectVersion(documentTab, version.id);
                  }
                }}
                title={version.isTemplate ? "Template (locked tab)" : version.title}
                role="tab"
                tabIndex={0}
                aria-selected={selected}
              >
                {version.isTemplate
                  ? <Lock size={14} />
                  : documentTab === "rirekisho" ? <Languages size={14} /> : <FileText size={14} />}
                {renamingVersionId === version.id ? (
                  <input
                    className="min-w-0 flex-1 rounded border border-[#6c897e] bg-white px-1.5 py-0.5 text-sm text-[#17201d] outline-none dark:bg-[#18201c] dark:text-[#edf3ef]"
                    value={versionNameDraft}
                    onChange={(event) => setVersionNameDraft(event.target.value)}
                    onClick={(event) => event.stopPropagation()}
                    onDoubleClick={(event) => event.stopPropagation()}
                    onBlur={() => finishRenamingVersion(documentTab, version.id)}
                    onKeyDown={(event) => {
                      event.stopPropagation();
                      if (event.key === "Enter") event.currentTarget.blur();
                      if (event.key === "Escape") setRenamingVersionId(null);
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
                      closeVersion(documentTab, version.id);
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
            onClick={() => addVersion(documentTab)}
            title={`Add ${documentTab === "cv" ? "CV" : documentTab === "rirekisho" ? "履歴書" : "職務経歴書"} version`}
            aria-label={`Add ${documentTab} version`}
          >
            <Plus size={18} />
          </button>
        </div>

        {documentTab === "cv" ? (
          <div>
          <div className="mb-3 flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-md bg-[#e7eee8] text-[#1e554a] dark:bg-[#20332a] dark:text-[#a8d9c6]">
              <FileText size={18} />
            </span>
            <input
              className={`min-w-0 flex-1 bg-transparent text-base font-bold outline-none ${cvVersion.isTemplate ? "cursor-default" : "focus:rounded focus:ring-2 focus:ring-[#1e554a]/20"}`}
              value={cvVersion.title}
              onChange={(event) => {
                if (!cvVersion.isTemplate) updateVersion("cv", { title: event.target.value });
              }}
              readOnly={cvVersion.isTemplate}
              aria-label="CV version name"
            />
            <button
              className="ml-auto flex h-9 flex-none items-center gap-2 rounded-md border border-[#d5d4ce] bg-[#faf9f5] px-3 text-sm font-semibold text-[#555c57] dark:border-[#39453f] dark:bg-[#111713] dark:text-[#bdc8c1]"
              onClick={() => printDocument("CV", `<article class="stanford-cv">${cvHtml}</article>`, stanfordCvPrintStyle)}
            >
              <Printer size={16} /> PDF
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3 max-lg:grid-cols-1">
            <textarea
              className="min-h-[620px] resize-y rounded-md border border-[#d8d7d0] bg-[#fbfaf7] p-4 font-mono text-[13px] leading-6 text-[#17201d] outline-none focus:border-[#6c897e] focus:ring-4 focus:ring-[#1e554a]/10 dark:border-[#303b35] dark:bg-[#111713] dark:text-[#edf3ef]"
              value={cvMarkdown}
              onChange={(event) => updateVersion("cv", { content: event.target.value })}
              onKeyDown={(event) => {
                if (event.key !== "Tab") return;
                event.preventDefault();
                insertTextareaText(event.currentTarget, "  ");
              }}
              aria-label="CV Markdown editor"
            />
            <div className="a4-preview-stage">
              <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[#747a76]">
                <Eye size={14} /> A4 preview
              </div>
              <article className="a4-preview-page text-sm leading-6 text-[#17201d]">
                <div
                  className="cv-preview stanford-cv"
                  dangerouslySetInnerHTML={{ __html: cvHtml }}
                />
              </article>
            </div>
          </div>
          </div>
        ) : documentTab === "rirekisho" ? (
          <div>
          <div className="mb-3 flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-md bg-[#e7eee8] text-[#1e554a] dark:bg-[#20332a] dark:text-[#a8d9c6]">
              <Languages size={18} />
            </span>
            <input
              className={`min-w-0 flex-1 bg-transparent text-base font-bold outline-none ${rirekishoVersion.isTemplate ? "cursor-default" : "focus:rounded focus:ring-2 focus:ring-[#1e554a]/20"}`}
              value={rirekishoVersion.title}
              onChange={(event) => {
                if (!rirekishoVersion.isTemplate) updateVersion("rirekisho", { title: event.target.value });
              }}
              readOnly={rirekishoVersion.isTemplate}
              aria-label="履歴書 version name"
            />
            <button
              className="ml-auto flex h-9 flex-none items-center gap-2 rounded-md border border-[#d5d4ce] bg-[#faf9f5] px-3 text-sm font-semibold text-[#555c57] dark:border-[#39453f] dark:bg-[#111713] dark:text-[#bdc8c1]"
              onClick={() => printDocument("履歴書", rirekishoHtml)}
            >
              <Printer size={16} /> PDF
            </button>
          </div>
          <div className="grid grid-cols-[minmax(260px,360px)_minmax(0,1fr)] gap-3 max-lg:grid-cols-1">
            <div className="grid max-h-[720px] gap-3 overflow-y-auto pr-1">
              <Field label="作成日" value={rirekisho.date} onChange={(value) => updateRirekisho("date", value)} />
              <label className="grid gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wide text-[#747a76] dark:text-[#9ca9a2]">証明写真</span>
                <input
                  className="w-full rounded-md border border-[#cfcec7] bg-[#fbfaf7] px-3 py-2 text-sm text-[#17201d] outline-none file:mr-3 file:rounded-md file:border-0 file:bg-[#1e554a] file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white dark:border-[#39453f] dark:bg-[#111713] dark:text-[#edf3ef]"
                  type="file"
                  accept="image/*"
                  onChange={(event) => updateRirekishoPhoto(event.target.files?.[0])}
                />
                {rirekisho.photoDataUrl && (
                  <button
                    className="h-9 rounded-md border border-[#d1d0ca] bg-white px-3 text-sm font-semibold text-[#555d58] dark:border-[#39453f] dark:bg-[#111713] dark:text-[#d4ddd7]"
                    type="button"
                    onClick={() => updateRirekisho("photoDataUrl", "")}
                  >
                    Remove photo
                  </button>
                )}
              </label>
              <Field label="氏名" value={rirekisho.name} onChange={(value) => updateRirekisho("name", value)} />
              <Field label="ふりがな" value={rirekisho.furigana} onChange={(value) => updateRirekisho("furigana", value)} />
              <Field label="生年月日" value={rirekisho.birthDate} onChange={(value) => updateRirekisho("birthDate", value)} />
              <Field label="性別" value={rirekisho.gender} onChange={(value) => updateRirekisho("gender", value)} />
              <Field label="郵便番号" value={rirekisho.postalCode} onChange={(value) => updateRirekisho("postalCode", value)} />
              <Field label="現住所ふりがな（任意）" value={rirekisho.addressFurigana || ""} onChange={(value) => updateRirekisho("addressFurigana", value)} />
              <Field label="現住所" value={rirekisho.address} onChange={(value) => updateRirekisho("address", value)} multiline />
              <Field label="電話" value={rirekisho.phone} onChange={(value) => updateRirekisho("phone", value)} />
              <Field label="メール" value={rirekisho.email} onChange={(value) => updateRirekisho("email", value)} />
              <Field label="志望職種" value={rirekisho.desiredRole} onChange={(value) => updateRirekisho("desiredRole", value)} />
              <Field label="職務要約" value={rirekisho.summary} onChange={(value) => updateRirekisho("summary", value)} multiline />
              <Field label="得意分野・技術" value={rirekisho.skills} onChange={(value) => updateRirekisho("skills", value)} multiline />
              <Field label="学歴" value={rirekisho.education} onChange={(value) => updateRirekisho("education", value)} multiline />
              <Field label="職歴" value={rirekisho.workHistory} onChange={(value) => updateRirekisho("workHistory", value)} multiline />
              <Field label="免許・資格" value={rirekisho.certifications} onChange={(value) => updateRirekisho("certifications", value)} multiline />
              <Field label="志望動機" value={rirekisho.motivation} onChange={(value) => updateRirekisho("motivation", value)} multiline />
              <Field label="自己PR" value={rirekisho.selfPr} onChange={(value) => updateRirekisho("selfPr", value)} multiline />
              <Field label="本人希望欄" value={rirekisho.requests} onChange={(value) => updateRirekisho("requests", value)} multiline />
            </div>
            <div className="a4-preview-stage">
              <div className="a4-preview-page text-[#17201d]">
                <div
                  className="rirekisho-preview"
                  dangerouslySetInnerHTML={{ __html: rirekishoHtml }}
                />
              </div>
            </div>
          </div>
          </div>
        ) : (
          <div>
          <div className="mb-3 flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-md bg-[#e7eee8] text-[#1e554a] dark:bg-[#20332a] dark:text-[#a8d9c6]">
              <FileText size={18} />
            </span>
            <input
              className={`min-w-0 flex-1 bg-transparent text-base font-bold outline-none ${shokumuVersion.isTemplate ? "cursor-default" : "focus:rounded focus:ring-2 focus:ring-[#1e554a]/20"}`}
              value={shokumuVersion.title}
              onChange={(event) => {
                if (!shokumuVersion.isTemplate) updateVersion("shokumu", { title: event.target.value });
              }}
              readOnly={shokumuVersion.isTemplate}
              aria-label="職務経歴書 version name"
            />
            <button
              className="ml-auto flex h-9 flex-none items-center gap-2 rounded-md border border-[#d5d4ce] bg-[#faf9f5] px-3 text-sm font-semibold text-[#555c57] dark:border-[#39453f] dark:bg-[#111713] dark:text-[#bdc8c1]"
              onClick={() => printDocument("職務経歴書", shokumuHtml)}
            >
              <Printer size={16} /> PDF
            </button>
          </div>
          <div className="grid grid-cols-[minmax(260px,380px)_minmax(0,1fr)] gap-3 max-lg:grid-cols-1">
            <div className="grid max-h-[720px] gap-3 overflow-y-auto pr-1">
              <Field label="作成日" value={shokumu.date} onChange={(value) => updateShokumu("date", value)} />
              <Field label="氏名" value={shokumu.name} onChange={(value) => updateShokumu("name", value)} />
              <Field label="職務要約" value={shokumu.summary} onChange={(value) => updateShokumu("summary", value)} multiline />
              <Field label="活かせる経験・知識・技術" value={shokumu.skills} onChange={(value) => updateShokumu("skills", value)} multiline />
              {shokumuExperiences.map((experience, index) => (
                <fieldset className="grid gap-3 rounded-md border border-[#d8d7d0] p-3 dark:border-[#39453f]" key={experience.id || index}>
                  <legend className="px-1 text-sm font-bold text-[#555d58] dark:text-[#d4ddd7]">
                    <span className="inline-flex items-center gap-2">
                      職歴 {index + 1}
                      {shokumuExperiences.length > 1 && (
                        <button
                          className="grid h-6 w-6 place-items-center rounded text-[#8c3429] hover:bg-[#f2ddd8] dark:text-[#ff9f91] dark:hover:bg-[#3b2925]"
                          type="button"
                          onClick={() => removeShokumuExperience(index)}
                          title={`職歴 ${index + 1} を削除`}
                          aria-label={`職歴 ${index + 1} を削除`}
                        >
                          <X size={14} />
                        </button>
                      )}
                    </span>
                  </legend>
                  <Field label="期間" value={experience.period} onChange={(value) => updateShokumuExperience(index, "period", value)} />
                  <Field label="会社名" value={experience.company} onChange={(value) => updateShokumuExperience(index, "company", value)} />
                  <Field label="事業内容" value={experience.business} onChange={(value) => updateShokumuExperience(index, "business", value)} multiline />
                  <Field label="雇用形態" value={experience.employmentType} onChange={(value) => updateShokumuExperience(index, "employmentType", value)} />
                  <Field label="職種" value={experience.role} onChange={(value) => updateShokumuExperience(index, "role", value)} />
                  <Field label="担当業務" value={experience.responsibilities} onChange={(value) => updateShokumuExperience(index, "responsibilities", value)} multiline />
                  <Field label="実績・取り組み" value={experience.achievements} onChange={(value) => updateShokumuExperience(index, "achievements", value)} multiline />
                  <Field label="使用技術" value={experience.technologies} onChange={(value) => updateShokumuExperience(index, "technologies", value)} multiline />
                </fieldset>
              ))}
              <button
                className="flex h-9 items-center justify-center gap-2 rounded-md border border-dashed border-[#aeb5b0] bg-[#f8f7f3] text-sm font-semibold text-[#555d58] hover:border-[#6c897e] hover:text-[#1e554a] dark:border-[#4a5750] dark:bg-[#151c18] dark:text-[#bdc8c1]"
                type="button"
                onClick={addShokumuExperience}
              >
                <Plus size={16} /> 職歴を追加
              </button>
              <Field label="自己PR" value={shokumu.selfPr} onChange={(value) => updateShokumu("selfPr", value)} multiline />
              <Field label="資格・語学" value={shokumu.certifications} onChange={(value) => updateShokumu("certifications", value)} multiline />
            </div>
            <div className="a4-preview-stage">
              <article className="a4-preview-page text-sm leading-6 text-[#17201d]">
                <div
                  className="cv-preview shokumu-preview"
                  dangerouslySetInnerHTML={{ __html: shokumuHtml }}
                />
              </article>
            </div>
          </div>
          </div>
        )}
      </section>
      <DocumentNavigation activeTab={documentTab} mobile onChange={onDocumentTabChange} />
    </section>
  );
}
