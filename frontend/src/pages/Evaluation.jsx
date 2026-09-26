import React, { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout.jsx";
import { EmptyState } from "../components/StateViews.jsx";
import api, { getErrorMessage } from "../services/api.js";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const EXPERIMENTS = [
  { value: "C_multilingual_summary_quality", label: "C: Multilingual Summary Quality (runs now)" },
  { value: "A_baseline_vs_rag", label: "A: Baseline LLM vs RAG (scaffolded)" },
  { value: "B_retrieval_by_language", label: "B: Retrieval Performance by Language (scaffolded)" },
  { value: "D_hallucination_factuality", label: "D: Hallucination & Factuality (scaffolded)" },
  { value: "F_embedding_model_comparison", label: "F: Embedding Model Comparison (scaffolded)" },
];

const Evaluation = () => {
  const [experiment, setExperiment] = useState(EXPERIMENTS[0].value);
  const [language, setLanguage] = useState("te");
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");

  const loadResults = () => {
    api.get("/evaluation/results", { params: { experimentName: experiment } }).then((res) => setResults(res.data.results));
  };

  useEffect(() => {
    loadResults();
  }, [experiment]);

  const handleRun = async () => {
    setRunning(true);
    setError("");
    try {
      await api.post("/evaluation/run", { experimentName: experiment, language });
      loadResults();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setRunning(false);
    }
  };

  const chartData = results
    .filter((r) => !r.metricName.startsWith("error_"))
    .slice(0, 15)
    .map((r) => ({ name: r.metricName.replace(/_/g, " ").slice(0, 20), value: r.metricValue }));

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-semibold mb-1">Evaluation</h1>
      <p className="text-slate-400 text-sm mb-6">
        Multilingual benchmark evaluation against a local, FLORES-style sample dataset (not the official FLORES benchmark).
      </p>

      <div className="card p-4 mb-6 flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[220px]">
          <label className="text-xs font-medium text-slate-400">Experiment</label>
          <select className="input-field mt-1" value={experiment} onChange={(e) => setExperiment(e.target.value)}>
            {EXPERIMENTS.map((e) => (
              <option key={e.value} value={e.value}>{e.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-400">Target language</label>
          <select className="input-field mt-1" value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="te">Telugu</option>
            <option value="hi">Hindi</option>
          </select>
        </div>
        <button onClick={handleRun} disabled={running} className="btn-primary text-sm">
          {running ? "Running..." : "Run Evaluation"}
        </button>
      </div>

      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

      {results.length === 0 ? (
        <EmptyState title="No results yet" subtitle="Run an evaluation to see metrics here." />
      ) : (
        <div className="card p-5">
          <h2 className="font-semibold mb-4 text-sm">Metric results</h2>
          <div className="h-64 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#3452f0" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
            {results.map((r) => (
              <div key={r._id} className="py-2 flex justify-between gap-4">
                <span className="text-slate-500">{r.metricName}</span>
                <span className="font-medium">{r.metricValue}</span>
                <span className="text-xs text-slate-400 truncate max-w-[200px]">{r.evaluationMethod}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Evaluation;
