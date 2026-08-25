import React, { useEffect, useMemo, useState } from "react";
import DocumentNavigation from "../DocumentNavigation";
import ThemeToggle from "../ThemeToggle";
import { generateEnglishCv, generateRirekishoData, generateShokumuKeirekishoData } from "../../utils/documents";
import { defaultCandidateText } from "../../utils/defaults";
import CvDocument from "./CvDocument";
import RirekishoDocument from "./RirekishoDocument";
import ShokumuDocument from "./ShokumuDocument";
import VersionTabs from "./VersionTabs";

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

export default function DocumentsView({
  documents,
  documentTab,
  mobileViewMode,
  onDocumentTabChange,
  onDocumentsChange,
  onThemeChange,
  theme,
}) {
  const fallbackLibrary = useMemo(() => createDocumentLibrary(defaultCandidateText), []);
  const library = useMemo(
    () => isDocumentLibrary(documents) ? addMissingTemplates(documents, defaultCandidateText) : fallbackLibrary,
    [documents, fallbackLibrary],
  );
  const [renamingVersionId, setRenamingVersionId] = useState(null);
  const [versionNameDraft, setVersionNameDraft] = useState("");
  const mobileEditorClass = mobileViewMode === "edit" ? "" : "max-md:hidden";
  const mobilePreviewClass = mobileViewMode === "preview" ? "" : "max-md:hidden";
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
      remaining = [newDocumentVersion(type, defaultCandidateText, 1)];
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
      || newTemplateVersion(type, defaultCandidateText);
    const versionNumber = library[type].filter((item) => !item.isTemplate).length + 1;
    const version = copyTemplateVersion(type, template, versionNumber);
    onDocumentsChange({
      ...library,
      [type]: [...library[type], version],
      active: { ...library.active, [type]: version.id },
    });
  };

  return (
    <section className="mx-auto grid min-w-0 max-w-[1800px] gap-5 overflow-hidden px-[clamp(12px,2vw,28px)] py-7 text-[#17201d] dark:text-[#edf3ef] max-md:px-0 max-md:py-0">
      <section className="min-w-0 max-w-full overflow-hidden rounded-lg border border-[#d8d7d0] bg-white p-4 dark:border-[#303b35] dark:bg-[#18201c] max-md:rounded-none max-md:border-x-0 max-md:border-t-0 max-md:p-3">
        <div className="flex items-start gap-3 max-md:hidden">
          <div className="min-w-0 flex-1">
            <DocumentNavigation activeTab={documentTab} onChange={onDocumentTabChange} />
          </div>
          <ThemeToggle theme={theme} onChange={onThemeChange} />
        </div>

        <VersionTabs
          activeId={activeVersion(documentTab).id}
          documentType={documentTab}
          nameDraft={versionNameDraft}
          onAdd={() => addVersion(documentTab)}
          onCancelRename={() => setRenamingVersionId(null)}
          onClose={(id) => closeVersion(documentTab, id)}
          onFinishRename={(id) => finishRenamingVersion(documentTab, id)}
          onNameDraftChange={setVersionNameDraft}
          onSelect={(id) => selectVersion(documentTab, id)}
          onStartRename={startRenamingVersion}
          renamingId={renamingVersionId}
          versions={library[documentTab]}
        />

        {documentTab === "cv" ? (
          <CvDocument
            html={cvHtml}
            mobileEditorClass={mobileEditorClass}
            mobilePreviewClass={mobilePreviewClass}
            onChange={(changes) => updateVersion("cv", changes)}
            onPrint={() => printDocument("CV", "<article class=\"stanford-cv\">" + cvHtml + "</article>", stanfordCvPrintStyle)}
            version={cvVersion}
          />
        ) : documentTab === "rirekisho" ? (
          <RirekishoDocument
            data={rirekisho}
            html={rirekishoHtml}
            mobileEditorClass={mobileEditorClass}
            mobilePreviewClass={mobilePreviewClass}
            onFieldChange={updateRirekisho}
            onPhotoChange={updateRirekishoPhoto}
            onPrint={() => printDocument("履歴書", rirekishoHtml)}
            onTitleChange={(title) => updateVersion("rirekisho", { title })}
            version={rirekishoVersion}
          />
        ) : (
          <ShokumuDocument
            data={shokumu}
            experiences={shokumuExperiences}
            html={shokumuHtml}
            mobileEditorClass={mobileEditorClass}
            mobilePreviewClass={mobilePreviewClass}
            onAddExperience={addShokumuExperience}
            onFieldChange={updateShokumu}
            onPrint={() => printDocument("職務経歴書", shokumuHtml)}
            onRemoveExperience={removeShokumuExperience}
            onTitleChange={(title) => updateVersion("shokumu", { title })}
            onUpdateExperience={updateShokumuExperience}
            version={shokumuVersion}
          />
        )}
      </section>
      <DocumentNavigation activeTab={documentTab} mobile onChange={onDocumentTabChange} />
    </section>
  );
}
