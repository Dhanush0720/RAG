import React, { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout.jsx";
import { EmptyState } from "../components/StateViews.jsx";
import api, { getErrorMessage } from "../services/api.js";
import { Info } from "lucide-react";

const ALL_LANGS = [
  { code: "en", label: "English" },
  { code: "te", label: "Telugu" },
  { code: "hi", label: "Hindi" },
];

const BiasFairness = () => {
  const [documents, setDocuments] = useState([]);
  const [documentId, setDocumentId] = useState("");
  const [languages, setLanguages] = useState(["en", "te", "hi"]);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/documents").then((res) => {
      const indexed = res.data.documents.filter((d) => d.status === "indexed");
      setDocuments(indexed);
      if (indexed.length) setDocumentId(indexed[0]._id);
    });
  }, []);

  const toggleLang = (code) => {
    setLanguages((prev) => (prev.includes(code) ? prev.filter((l) => l !== code) : [...prev, code]));
  };

  const runAudit = async () => {
    setRunning(true);
    setError("");
    setResult(null);
    try {
      const { data } = await api.post("/audits/run", { documentId, languages, auditType: "cross_language_consistency" });
      setResult(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setRunning(false);
    }
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-semibold mb-1">Bias & Fairness Auditing</h1>
      <p className="text-slate-400 text-sm mb-6">
        Compares generated output quality across languages for the same document.
      </p>

      {documents.length === 0 ? (
        <EmptyState title="No indexed documents" subtitle="Upload a document and wait for indexing to finish." />
      ) : (
        <>
          <div className="card p-4 mb-6 space-y-3">
            <div>
              <label className="text-xs font-medium text-slate-400">Document</label>
              <select className="input-field mt-1" value={documentId} onChange={(e) => setDocumentId(e.target.value)}>
                {documents.map((d) => (
                  <option key={d._id} value={d._id}>{d.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1 block">Languages to compare</label>
              <div className="flex gap-2">
                {ALL_LANGS.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => toggleLang(l.code)}
                    className={`px-3 py-1.5 rounded-lg text-sm border ${
                      languages.includes(l.code)
                        ? "bg-brand-600 text-white border-brand-600"
                        : "border-slate-300 dark:border-slate-700 text-slate-500"
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={runAudit} disabled={running || languages.length < 2} className="btn-primary text-sm">
              {running ? "Auditing..." : "Run Audit"}
            </button>
            {languages.length < 2 && <p className="text-xs text-amber-500">Select at least 2 languages to compare.</p>}
          </div>

          {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

          {result && (
            <div className="space-y-4">
              <div className="card p-4">
                <h2 className="font-semibold text-sm mb-2">Overall finding</h2>
                <p className="text-sm text-slate-600 dark:text-slate-300">{result.summary}</p>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                {result.results.map((r) => (
                  <div key={r.language} className="card p-4">
                    <p className="text-xs font-medium text-slate-400 uppercase mb-2">{r.language}</p>
                    {Object.entries(r.metricValues || {}).map(([k, v]) => (
                      <div key={k} className="flex justify-between text-sm py-1">
                        <span className="text-slate-500">{k.replace(/_/g, " ")}</span>
                        <span className="font-medium">{String(v ?? "—")}</span>
                      </div>
                    ))}
                    {r.findings?.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <p className="text-xs text-slate-400 mb-1">Notable gaps</p>
                        <ul className="text-xs list-disc list-inside text-slate-500 space-y-0.5">
                          {r.findings.map((f, i) => (
                            <li key={i}>{f}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="card p-4 flex gap-3 bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-900">
                <Info size={18} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-700 dark:text-amber-300 mb-1">Limitations</p>
                  <ul className="text-xs text-amber-700/80 dark:text-amber-300/70 list-disc list-inside space-y-0.5">
                    {result.limitations.map((l, i) => (
                      <li key={i}>{l}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
};

export default BiasFairness;
