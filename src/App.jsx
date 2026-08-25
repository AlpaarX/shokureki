import React, { useEffect, useState } from "react";
import ProfileView from "./components/ProfileView";

const STORAGE_KEY = "shokureki.documents.v1";

function loadDocuments() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

export default function App() {
  const [documents, setDocuments] = useState(loadDocuments);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
  }, [documents]);

  return (
    <main className="min-h-screen">
      <header className="border-b border-[#d8d7d0] bg-white px-[clamp(16px,3vw,40px)] py-4">
        <div className="mx-auto flex max-w-[1800px] items-baseline gap-3">
          <h1 className="text-xl font-bold tracking-tight text-[#173b36]">Shokureki</h1>
          <p className="text-sm text-[#747a76]">Application documents</p>
        </div>
      </header>
      <ProfileView documents={documents} onDocumentsChange={setDocuments} />
    </main>
  );
}
