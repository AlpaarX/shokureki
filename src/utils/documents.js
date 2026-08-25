export function splitText(sourceText) {
  return String(sourceText || "")
    .split(/[.\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function extractCandidateSummary(sourceText) {
  const lines = splitText(sourceText);
  return lines[0] || "Backend engineer focused on reliable web services and pragmatic product delivery.";
}

export function extractSkills(sourceText) {
  const knownSkills = [
    "PHP",
    "Laravel",
    "Python",
    "Django",
    "FastAPI",
    "React",
    "Vue.js",
    "PostgreSQL",
    "MySQL",
    "Redis",
    "AWS",
    "GCP",
    "Docker",
    "Kubernetes",
  ];
  const lowerText = String(sourceText || "").toLowerCase();
  return knownSkills.filter((skill) => lowerText.includes(skill.toLowerCase()));
}

export function generateEnglishCv(sourceText) {
  const summary = extractCandidateSummary(sourceText);
  const skills = extractSkills(sourceText);
  const details = splitText(sourceText).slice(1);

  return [
    "# [Your Name]",
    "",
    "[+81-xx-xxxx-xxxx] | [your.email@example.com] | [LinkedIn / GitHub] | Kanagawa, Japan",
    "",
    "## PROFESSIONAL SUMMARY",
    summary,
    "",
    "## EXPERIENCE",
    "### [Company Name] | Tokyo, Japan",
    "Backend Engineer | [Start Date] – Present",
    "- Designed and maintained backend services for production web applications.",
    "- Improved API reliability, database performance, and deployment workflows.",
    "- Collaborated with product, design, and operations teams to ship user-facing features.",
    "",
    "## SELECTED IMPACT",
    ...(details.length ? details.map((detail) => `- ${detail}`) : [
      "- Builds maintainable services with clear operational ownership.",
      "- Communicates tradeoffs clearly across engineering and business stakeholders.",
    ]),
    "",
    "## EDUCATION",
    "### [School / University] | [Location]",
    "[Degree / Field of Study] | [Graduation Date]",
    "",
    "## SKILLS & LANGUAGES",
    `- **Technical:** ${skills.length ? skills.join(", ") : "Backend engineering, API design, database design, cloud services, product collaboration"}`,
    "- **Languages:** English (Professional), Japanese ([Level])",
  ].join("\n");
}

export function generateRirekishoData(sourceText) {
  const summary = extractCandidateSummary(sourceText);
  const skills = extractSkills(sourceText);

  return {
    date: new Date().toLocaleDateString("ja-JP-u-ca-japanese", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    name: "",
    furigana: "",
    birthDate: "",
    gender: "",
    photoDataUrl: "",
    postalCode: "",
    addressFurigana: "",
    address: "神奈川県 / 東京都 / リモート勤務可",
    phone: "",
    email: "",
    desiredRole: "バックエンドエンジニア",
    summary,
    skills: skills.length ? skills.join("、") : "API設計、バックエンド開発、データベース設計、クラウド運用、プロダクト開発",
    education: "YYYY年 MM月  [学校名] 卒業",
    workHistory: [
      "YYYY年 MM月  [会社名] 入社",
      "バックエンドエンジニアとしてWebアプリケーションの設計、開発、運用を担当",
      "現在に至る",
    ].join("\n"),
    certifications: "",
    motivation: "貴社のプロダクト開発において、バックエンド領域の設計・実装・運用改善の経験を活かしたいと考え志望いたしました。",
    selfPr: "要件整理から実装、運用改善まで一貫して担当できます。保守性、信頼性、チーム内での明確なコミュニケーションを重視し、長期的に価値を出せる開発を心がけています。",
    requests: "貴社規定に従います。",
  };
}

export function generateShokumuKeirekishoData(sourceText) {
  const summary = extractCandidateSummary(sourceText);
  const skills = extractSkills(sourceText);
  const details = splitText(sourceText).slice(1);
  const skillText = skills.length
    ? skills.join("、")
    : "バックエンド開発、API設計、データベース設計、クラウド運用、保守改善";
  const achievementItems = details.length ? details : [
    "保守性を重視した実装と運用改善により、継続的な開発を支援",
    "関係者と要件・優先度を整理し、安定したリリースに貢献",
  ];

  const experience = {
    period: "YYYY年MM月 - 現在",
    company: "[会社名]",
    business: "[事業内容]",
    employmentType: "[正社員 / 契約社員 / 業務委託]",
    role: "バックエンドエンジニア",
    responsibilities: [
      "WebアプリケーションのAPI設計、開発、保守運用",
      "データベース設計、パフォーマンス改善、障害調査",
      "チーム内の設計レビュー、コードレビュー、開発プロセス改善",
    ].join("\n"),
    achievements: achievementItems.join("\n"),
    technologies: skillText,
  };

  return {
    date: new Date().toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    name: "",
    summary,
    skills: [
      skillText,
      "Webアプリケーションのバックエンド設計、実装、運用",
      "要件整理、技術選定、既存システムの改善",
      "プロダクト、デザイン、ビジネス側との連携",
    ].join("\n"),
    ...experience,
    experiences: [experience],
    selfPr: "要件整理から設計、実装、運用改善まで一貫して担当できます。保守性と信頼性を重視し、事業やプロダクトの目的に沿った現実的な技術判断を行います。",
    certifications: [
      "[資格名]",
      "日本語：[レベル]",
      "英語：[レベル]",
    ].join("\n"),
  };
}

export function generateCoverLetter(sourceText, job) {
  const summary = extractCandidateSummary(sourceText);
  const sourceSkills = extractSkills(sourceText);
  const jobSkills = job?.skills || [];
  const matchedSkills = jobSkills.filter((skill) =>
    sourceSkills.some((sourceSkill) => sourceSkill.toLowerCase() === skill.toLowerCase()),
  );
  const skillLine = matchedSkills.length
    ? `My experience with ${matchedSkills.join(", ")} aligns closely with the stack your team is using.`
    : `My backend engineering background maps well to the responsibilities described for this role.`;

  return [
    `Dear ${job?.company || "[Company]"} Hiring Team,`,
    "",
    `I am writing to express my interest in the ${job?.title || "[Role]"} position. ${summary}`,
    "",
    `${skillLine} I am especially interested in this opportunity because it combines practical product engineering with the chance to build reliable systems that support real users.`,
    "",
    `In my recent work, I have focused on designing maintainable backend services, improving API quality, and collaborating closely with cross-functional teams. I would bring a pragmatic engineering style, clear communication, and ownership from implementation through operation.`,
    "",
    `Thank you for considering my application. I would welcome the opportunity to discuss how my experience can contribute to ${job?.company || "your team"}.`,
    "",
    "Sincerely,",
    "[Your Name]",
  ].join("\n");
}
