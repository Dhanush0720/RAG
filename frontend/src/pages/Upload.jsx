import React, { useState, useRef } from "react";
import { UploadCloud, File as FileIcon, X } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout.jsx";
import api, { getErrorMessage } from "../services/api.js";
import { useNavigate } from "react-router-dom";

const Upload = () => {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [language, setLanguage] = useState("auto");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const inputRef = useRef();
  const navigate = useNavigate();

  const handleFile = (f) => {
    if (!f) return;
    const validExt = [".pdf", ".docx", ".txt"];
    if (!validExt.some((ext) => f.name.toLowerCase().endsWith(ext))) {
      setError("Unsupported file type. Please upload a PDF, DOCX, or TXT file.");
      return;
    }
    if (f.size > 25 * 1024 * 1024) {
      setError("File exceeds 25MB limit.");
      return;
    }
    setError("");
    setFile(f);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError("");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("language", language);
    formData.append("title", file.name);

    try {
      await api.post("/documents/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (evt) => setProgress(Math.round((evt.loaded * 100) / evt.total)),
      });
      navigate("/documents");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-semibold mb-1">Upload Document</h1>
      <p className="text-slate-400 text-sm mb-6">Supported formats: PDF, DOCX, TXT (max 25MB).</p>

      <div className="card p-6 max-w-2xl">
        {error && (
          <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-lg px-3 py-2 mb-4">
            {error}
          </div>
        )}

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            handleFile(e.dataTransfer.files[0]);
          }}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
            dragging ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20" : "border-slate-300 dark:border-slate-700"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.docx,.txt"
            className="hidden"
            onChange={(e) => handleFile(e.target.files[0])}
          />
          {file ? (
            <div className="flex items-center justify-center gap-3">
              <FileIcon className="text-brand-600" />
              <span className="text-sm font-medium">{file.name}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                }}
              >
                <X size={16} className="text-slate-400 hover:text-red-500" />
              </button>
            </div>
          ) : (
            <>
              <UploadCloud className="mx-auto mb-3 text-slate-400" size={32} />
              <p className="text-sm font-medium">Drag & drop your document here</p>
              <p className="text-xs text-slate-400 mt-1">or click to browse</p>
            </>
          )}
        </div>

        <div className="mt-4">
          <label className="text-sm font-medium mb-1 block">Document language</label>
          <select className="input-field" value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="auto">Auto-detect</option>
            <option value="en">English</option>
            <option value="te">Telugu</option>
            <option value="hi">Hindi</option>
          </select>
        </div>

        {uploading && (
          <div className="mt-4">
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
              <div className="bg-brand-600 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-xs text-slate-400 mt-1">{progress}% uploaded</p>
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="btn-primary w-full mt-5"
        >
          {uploading ? "Uploading..." : "Upload & Process"}
        </button>
      </div>
    </DashboardLayout>
  );
};

export default Upload;
