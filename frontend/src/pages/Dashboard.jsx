import React, { useEffect, useState } from "react";
import { FileText, FileStack, MessageSquare, Globe } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout.jsx";
import { Loading, ErrorState } from "../components/StateViews.jsx";
import { StatusBadge } from "../components/StateViews.jsx";
import api, { getErrorMessage } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { Link } from "react-router-dom";

const StatCard = ({ icon: Icon, label, value }) => (
  <div className="card p-4 flex items-center gap-3">
    <div className="w-10 h-10 rounded-lg bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-300 flex items-center justify-center">
      <Icon size={20} />
    </div>
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/documents")
      .then((res) => setDocuments(res.data.documents))
      .catch((err) => setError(getErrorMessage(err)));
  }, []);

  if (error) return <DashboardLayout><ErrorState message={error} /></DashboardLayout>;
  if (!documents) return <DashboardLayout><Loading label="Loading dashboard..." /></DashboardLayout>;

  const totalDocs = documents.length;
  const languages = new Set(documents.map((d) => d.detectedLanguage).filter(Boolean));
  const recent = documents.slice(0, 5);

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-semibold mb-1">Welcome back, {user?.name?.split(" ")[0]}</h1>
      <p className="text-slate-400 text-sm mb-6">Here's what's happening with your documents.</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard icon={FileText} label="Total Documents" value={totalDocs} />
        <StatCard icon={FileStack} label="Indexed" value={documents.filter((d) => d.status === "indexed").length} />
        <StatCard icon={MessageSquare} label="Processing" value={documents.filter((d) => d.status === "processing").length} />
        <StatCard icon={Globe} label="Languages Used" value={languages.size || "—"} />
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Recent Documents</h2>
          <Link to="/documents" className="text-sm text-brand-600 font-medium">
            View all
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="text-sm text-slate-400">No documents uploaded yet. Head to Upload to get started.</p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recent.map((doc) => (
              <div key={doc._id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{doc.title}</p>
                  <p className="text-xs text-slate-400">{new Date(doc.createdAt).toLocaleString()}</p>
                </div>
                <StatusBadge status={doc.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
