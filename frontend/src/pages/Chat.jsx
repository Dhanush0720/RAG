import React, { useEffect, useState, useRef } from "react";
import { Send, FileText } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout.jsx";
import { Loading, EmptyState } from "../components/StateViews.jsx";
import api, { getErrorMessage } from "../services/api.js";
import { useLocation } from "react-router-dom";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "te", label: "Telugu" },
  { code: "hi", label: "Hindi" },
];

const Chat = () => {
  const location = useLocation();
  const [documents, setDocuments] = useState([]);
  const [documentId, setDocumentId] = useState(location.state?.documentId || "");
  const [language, setLanguage] = useState("en");
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef();

  useEffect(() => {
    api.get("/documents").then((res) => {
      const indexed = res.data.documents.filter((d) => d.status === "indexed");
      setDocuments(indexed);
      if (!documentId && indexed.length) setDocumentId(indexed[0]._id);
    });
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startConversation = async () => {
    if (!documentId) return;
    setError("");
    try {
      const { data } = await api.post("/chat/conversations", { documentId, language });
      setConversation(data.conversation);
      setMessages([]);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !conversation) return;
    const userMsg = { role: "user", content: input, _id: Date.now() };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setSending(true);
    setError("");
    try {
      const { data } = await api.post("/chat/message", {
        conversationId: conversation._id,
        content: userMsg.content,
        language,
      });
      setMessages((m) => [...m, data.message]);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSending(false);
    }
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-semibold mb-1">AI Chat</h1>
      <p className="text-slate-400 text-sm mb-6">Ask questions about a specific document, with citations.</p>

      {documents.length === 0 ? (
        <EmptyState title="No indexed documents" subtitle="Upload and wait for a document to finish indexing before chatting." />
      ) : (
        <div className="grid md:grid-cols-4 gap-4">
          <div className="card p-4 md:col-span-1 h-fit space-y-3">
            <div>
              <label className="text-xs font-medium text-slate-400">Document</label>
              <select className="input-field mt-1" value={documentId} onChange={(e) => setDocumentId(e.target.value)}>
                {documents.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400">Response language</label>
              <select className="input-field mt-1" value={language} onChange={(e) => setLanguage(e.target.value)}>
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>
            <button onClick={startConversation} className="btn-primary w-full text-sm">
              {conversation ? "Restart chat" : "Start chat"}
            </button>
          </div>

          <div className="card md:col-span-3 flex flex-col h-[65vh]">
            {!conversation ? (
              <EmptyState title="Start a conversation" subtitle="Select a document and click Start chat." />
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 && (
                    <p className="text-sm text-slate-400 text-center mt-10">
                      Try: "Summarize this agreement" or "What are the payment terms?"
                    </p>
                  )}
                  {messages.map((m) => (
                    <div key={m._id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                          m.role === "user"
                            ? "bg-brand-600 text-white"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                        }`}
                      >
                        {m.content}
                        {m.citations?.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-slate-200/50 dark:border-slate-700/50 space-y-1">
                            {m.citations.map((c, i) => (
                              <div key={i} className="flex items-center gap-1.5 text-xs opacity-75">
                                <FileText size={12} />
                                Page {c.page ?? "?"}, Chunk {c.chunkIndex}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {sending && <p className="text-xs text-slate-400">Assistant is thinking...</p>}
                  <div ref={bottomRef} />
                </div>
                {error && <p className="text-xs text-red-500 px-4 pb-1">{error}</p>}
                <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex gap-2">
                  <input
                    className="input-field flex-1"
                    placeholder="Ask a question about this document..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  />
                  <button onClick={handleSend} disabled={sending} className="btn-primary px-3">
                    <Send size={16} />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Chat;
