import React, { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout.jsx";
import { EmptyState } from "../components/StateViews.jsx";
import api, { getErrorMessage } from "../services/api.js";
import { useLocation } from "react-router-dom";

const SUMMARY_TYPES = [
  { value: "executive", label: "Executive Summary" },
  { value: "detailed", label: "Detailed Summary" },
  { value: "simple_language", label: "Simple Language Summary" },
  { value: "key_clauses", label: "Key Clauses Summary" },
  { value: "obligations", label: "Obligations Summary" },
  { value: "risk_review", label: "Risk Review Summary" },
  { value: "multilingual", label: "Multilingual Summary" },
];

const Summarize = () => {
  const location = useLocation();
  const [documents, setDocuments] = useState([]);
  const [documentId, setDocumentId] = useState(location.state?.documentId || "");
  const [summaryType, setSummaryType] = useState("executive");
  const [language, setLanguage] = useState("en");
  const [length, setLength] = useState("medium");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/documents").then((res) => {
      const indexed = res.data.documents.filter((d) => d.status === "indexed");
      setDocuments(indexed);
      if (!documentId && indexed.length) setDocumentId(indexed[0]._id);
    });
  }, []);

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const { data } = await api.post("/summaries/generate", { documentId, summaryType, language, length });
      setResult(data.summary);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-semibold mb-1">Summarization</h1>
      <p className="text-slate-400 text-sm mb-6">Generate grounded summaries with source page references.</p>

      {documents.length === 0 ? (
        <EmptyState title="No indexed documents" subtitle="Upload a document and wait for indexing to finish." />
      ) : (
        <div className="grid md:grid-cols-4 gap-4">
          <div className="card p-4 md:col-span-1 h-fit space-y-3">
            <div>
              <label className="text-xs font-medium text-slate-400">Document</label>
              <select className="input-field mt-1" value={documentId} onChange={(e) => setDocumentId(e.target.value)}>
                {documents.map((d) => (
                  <option key={d._id} value={d._id}>{d.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400">Summary type</label>
              <select className="input-field mt-1" value={summaryType} onChange={(e) => setSummaryType(e.target.value)}>
                {SUMMARY_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400">Language</label>
              <select className="input-field mt-1" value={language} onChange={(e) => setLanguage(e.target.value)}>
                <option value="en">English</option>
                <option value="te">Telugu</option>
                <option value="hi">Hindi</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400">Length</label>
              <select className="input-field mt-1" value={length} onChange={(e) => setLength(e.target.value)}>
                <option value="short">Short</option>
                <option value="medium">Medium</option>
                <option value="long">Long</option>
              </select>
            </div>
            <button onClick={handleGenerate} disabled={loading || !documentId} className="btn-primary w-full text-sm">
              {loading ? "Generating..." : "Generate Summary"}
            </button>
          </div>

          <div className="card md:col-span-3 p-6 min-h-[300px]">
            {error && <p className="text-sm text-red-500 mb-3">{error}</p>}
            {!result && !loading && !error && (
              <EmptyState title="No summary yet" subtitle="Configure the options and click Generate Summary." />
            )}
            {loading && <p className="text-sm text-slate-400">Generating summary from document evidence...</p>}
            {result && (
              <div>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{result.content}</p>
                {result.sourceReferences?.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-medium text-slate-400 mb-1">Source pages</p>
                    <div className="flex flex-wrap gap-1.5">
                      {result.sourceReferences.map((r, i) => (
                        <span key={i} className="badge bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          p.{r.page}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Summarize;
