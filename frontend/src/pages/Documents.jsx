import React, { useEffect, useState } from "react";
import { Trash2, MessageSquare, FileStack, ClipboardCheck } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout.jsx";
import { Loading, ErrorState, EmptyState, StatusBadge } from "../components/StateViews.jsx";
import api, { getErrorMessage } from "../services/api.js";
import { Link, useNavigate } from "react-router-dom";

const Documents = () => {
  const [documents, setDocuments] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const load = () => {
    setError("");
    api
      .get("/documents")
      .then((res) => setDocuments(res.data.documents))
      .catch((err) => setError(getErrorMessage(err)));
  };

  useEffect(() => {
    load();
    // Poll every 5s to reflect background processing status changes.
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this document? This cannot be undone.")) return;
    try {
      await api.delete(`/documents/${id}`);
      setDocuments((docs) => docs.filter((d) => d._id !== id));
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">My Documents</h1>
          <p className="text-slate-400 text-sm">All documents you've uploaded.</p>
        </div>
        <Link to="/upload" className="btn-primary">
          Upload New
        </Link>
      </div>

      {error && <ErrorState message={error} onRetry={load} />}
      {!error && !documents && <Loading />}
      {!error && documents && documents.length === 0 && (
        <EmptyState
          title="No documents yet"
          subtitle="Upload your first legal document to start summarizing, chatting, and reviewing it."
          action={
            <Link to="/upload" className="btn-primary text-sm">
              Upload a document
            </Link>
          }
        />
      )}

      {documents && documents.length > 0 && (
        <div className="card divide-y divide-slate-100 dark:divide-slate-800">
          {documents.map((doc) => (
            <div key={doc._id} className="p-4 flex items-center justify-between gap-4 flex-wrap">
              <div className="min-w-0">
                <p className="font-medium truncate">{doc.title}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {doc.fileType.toUpperCase()} · {doc.pageCount || "?"} pages ·{" "}
                  {new Date(doc.createdAt).toLocaleDateString()}
                  {doc.processingError && (
                    <span className="text-red-500"> · {doc.processingError}</span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <StatusBadge status={doc.status} />
                <button
                  disabled={doc.status !== "indexed"}
                  onClick={() => navigate("/chat", { state: { documentId: doc._id } })}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30"
                  title="Chat"
                >
                  <MessageSquare size={16} />
                </button>
                <button
                  disabled={doc.status !== "indexed"}
                  onClick={() => navigate("/summarize", { state: { documentId: doc._id } })}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30"
                  title="Summarize"
                >
                  <FileStack size={16} />
                </button>
                <button
                  disabled={doc.status !== "indexed"}
                  onClick={() => navigate("/review", { state: { documentId: doc._id } })}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30"
                  title="Review"
                >
                  <ClipboardCheck size={16} />
                </button>
                <button
                  onClick={() => handleDelete(doc._id)}
                  className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default Documents;
