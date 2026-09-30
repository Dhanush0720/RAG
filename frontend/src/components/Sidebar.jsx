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
  X,
  Sparkles,
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

const Sidebar = ({ mobileOpen, onCloseMobile }) => {
  const { user } = useAuth();

  const navContent = (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800/80">
      {/* Brand Header */}
      <div className="px-5 h-16 flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-indigo-500 flex items-center justify-center text-white shadow-sm font-bold text-sm">
            <Scale size={18} />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              LexiRAG
            </span>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold -mt-1">
              Legal AI Core
            </span>
          </div>
        </div>

        {/* Mobile close button */}
        {mobileOpen && (
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Navigation items */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => mobileOpen && onCloseMobile && onCloseMobile()}
            className={({ isActive }) =>
              `group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-r from-brand-500/10 to-indigo-500/10 dark:from-brand-500/20 dark:to-indigo-500/20 text-brand-600 dark:text-brand-300 font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={18}
                  className={`transition-colors duration-200 ${
                    isActive
                      ? "text-brand-600 dark:text-brand-400"
                      : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                  }`}
                />
                <span className="flex-1">{label}</span>
                {isActive && (
                  <span className="w-1.5 h-4 rounded-full bg-brand-600 dark:bg-brand-400 shadow-glow" />
                )}
              </>
            )}
          </NavLink>
        ))}

        {user?.role === "admin" && (
          <div className="pt-2">
            <div className="px-3 pb-1 text-[11px] uppercase tracking-wider font-semibold text-slate-400">
              Administration
            </div>
            <NavLink
              to="/admin"
              onClick={() => mobileOpen && onCloseMobile && onCloseMobile()}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-brand-500/10 dark:bg-brand-500/20 text-brand-600 dark:text-brand-300 font-semibold"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60"
                }`
              }
            >
              <Shield size={18} className="text-amber-500" />
              <span>Admin Console</span>
            </NavLink>
          </div>
        )}
      </nav>

      {/* Footer Legal Disclaimer Notice */}
      <div className="p-4 border-t border-slate-200/80 dark:border-slate-800/80 shrink-0">
        <div className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/50 dark:border-slate-800/50 text-[11px] leading-relaxed text-slate-400">
          <Sparkles size={14} className="text-brand-500 shrink-0 mt-0.5" />
          <span>AI-assisted legal platform. Always verify with statutory sources.</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 h-screen sticky top-0 z-20">
        {navContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          {/* Sliding Drawer */}
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 animate-slideRight">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
