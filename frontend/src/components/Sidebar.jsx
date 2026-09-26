import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Upload,
  MessageSquare,
  FileStack,
  ClipboardCheck,
  BarChart3,
  Scale,
  Settings,
  Shield,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/documents", label: "My Documents", icon: FileText },
  { to: "/upload", label: "Upload Document", icon: Upload },
  { to: "/chat", label: "AI Chat", icon: MessageSquare },
  { to: "/summarize", label: "Summarization", icon: FileStack },
  { to: "/review", label: "Document Review", icon: ClipboardCheck },
  { to: "/evaluation", label: "Evaluation", icon: BarChart3 },
  { to: "/bias-fairness", label: "Bias & Fairness", icon: Scale },
  { to: "/settings", label: "Settings", icon: Settings },
];

const Sidebar = () => {
  const { user } = useAuth();

  return (
    <aside className="hidden md:flex flex-col w-60 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 h-screen sticky top-0">
      <div className="px-5 py-5 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
        <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold text-sm">
          LR
        </div>
        <span className="font-semibold text-lg tracking-tight">LexiRAG</span>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
        {user?.role === "admin" && (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`
            }
          >
            <Shield size={18} />
            Admin
          </NavLink>
        )}
      </nav>
      <div className="p-4 text-xs text-slate-400 border-t border-slate-200 dark:border-slate-800">
        AI-assisted tool. Not a substitute for professional legal advice.
      </div>
    </aside>
  );
};

export default Sidebar;
