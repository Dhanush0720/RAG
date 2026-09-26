import React, { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout.jsx";
import { EmptyState } from "../components/StateViews.jsx";
import api, { getErrorMessage } from "../services/api.js";
import { useLocation } from "react-router-dom";

const PRIORITY_COLORS = {
  high: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  low: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
};

const Review = () => {
  const location = useLocation();
  const [documents, setDocuments] = useState([]);
  const [documentId, setDocumentId] = useState(location.state?.documentId || "");
  const [review, setReview] = useState(null);
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
    setReview(null);
    try {
      const { data } = await api.post("/reviews/generate", { documentId });
      setReview(data.review);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-semibold mb-1">Document Review</h1>
      <p className="text-slate-400 text-sm mb-6">
        AI-assisted clause detection. This is not a substitute for professional legal review.
      </p>

      {documents.length === 0 ? (
        <EmptyState title="No indexed documents" subtitle="Upload a document and wait for indexing to finish." />
      ) : (
        <>
          <div className="card p-4 mb-6 flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[200px]">
              <label className="text-xs font-medium text-slate-400">Document</label>
              <select className="input-field mt-1" value={documentId} onChange={(e) => setDocumentId(e.target.value)}>
                {documents.map((d) => (
                  <option key={d._id} value={d._id}>{d.title}</option>
                ))}
              </select>
            </div>
            <button onClick={handleGenerate} disabled={loading || !documentId} className="btn-primary text-sm">
              {loading ? "Analyzing..." : "Run Review"}
            </button>
          </div>

          {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

          {review && (
            <div className="space-y-4">
              {review.findings.length === 0 ? (
                <EmptyState title="No findings extracted" subtitle="The model didn't extract structured findings for this document." />
              ) : (
                review.findings.map((f, i) => (
                  <div key={i} className="card p-4">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-slate-400">{f.category}</span>
                          {f.uncertain && (
                            <span className="badge bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 gap-1">
                              <AlertTriangle size={10} /> Requires further review
                            </span>
                          )}
                        </div>
                        <p className="font-medium">{f.title}</p>
                      </div>
                      <span className={`badge ${PRIORITY_COLORS[f.priority] || PRIORITY_COLORS.medium}`}>
                        {f.priority} priority
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">{f.explanation}</p>
                    {f.supportingText && (
                      <blockquote className="mt-2 text-xs text-slate-400 border-l-2 border-slate-200 dark:border-slate-700 pl-3 italic">
                        "{f.supportingText}"
                      </blockquote>
                    )}
                    {f.sourcePage && <p className="text-xs text-slate-400 mt-2">Source: page {f.sourcePage}</p>}
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
};

export default Review;
