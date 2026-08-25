import React, { useEffect, useState } from "react";
import Header from "./components/Header";
import ProfileView from "./components/ProfileView";

const STORAGE_KEY = "shokureki.documents.v1";
const DOCUMENT_TABS = ["cv", "rirekisho", "shokumu"];

function documentTabFromLocation() {
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
  const route = window.location.pathname
    .slice(window.location.pathname.startsWith(basePath) ? basePath.length : 0)
    .replace(/^\/+|\/+$/g, "");
  return DOCUMENT_TABS.includes(route) ? route : "cv";
}

function pathForDocumentTab(tab) {
  const basePath = import.meta.env.BASE_URL;
  return tab === "cv" ? basePath : `${basePath}${tab}/`;
}

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
  const [documentTab, setDocumentTab] = useState(documentTabFromLocation);
  const [mobileViewMode, setMobileViewMode] = useState("edit");

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    const handlePopState = () => setDocumentTab(documentTabFromLocation());
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    const labels = {
      cv: "CV",
      rirekisho: "履歴書",
      shokumu: "職務経歴書",
    };
    document.title = `${labels[documentTab]} — 職歴`;
  }, [documentTab]);

  const selectDocumentTab = (tab) => {
    if (tab === documentTab) return;
    window.history.pushState({ documentTab: tab }, "", pathForDocumentTab(tab));
    setDocumentTab(tab);
  };

  return (
    <main className="app-shell min-h-screen">
      <Header mobileViewMode={mobileViewMode} onMobileViewModeChange={setMobileViewMode} />
      <ProfileView
        documents={documents}
        documentTab={documentTab}
        mobileViewMode={mobileViewMode}
        onDocumentTabChange={selectDocumentTab}
        onDocumentsChange={setDocuments}
      />
    </main>
  );
}
