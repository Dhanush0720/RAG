import React from "react";
import { Sun, Moon, LogOut, Search, Menu, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { useNavigate } from "react-router-dom";

const Navbar = ({ onToggleMobileMenu }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 h-16 flex items-center justify-between px-4 md:px-6 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md transition-colors">
      <div className="flex items-center gap-3 flex-1 max-w-md">
        {/* Mobile menu hamburger toggle button */}
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu size={20} />
        </button>

        <div className="relative w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            className="input-field !pl-10 py-2 text-xs md:text-sm bg-slate-50 dark:bg-slate-950/60"
            placeholder="Search statutes, clauses, documents..."
            onKeyDown={(e) => {
              if (e.key === "Enter") navigate("/documents");
            }}
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Pro / Role Badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-50 dark:bg-brand-950/40 border border-brand-200/50 dark:border-brand-800/50 text-[11px] font-semibold text-brand-600 dark:text-brand-300">
          <Sparkles size={12} />
          <span>Multilingual Legal AI</span>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
          title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
          {theme === "dark" ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
        </button>

        {/* User Info */}
        <div className="hidden sm:flex flex-col items-end leading-tight">
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{user?.name}</span>
          <span className="text-[11px] text-slate-400 font-medium capitalize">
            {user?.role?.replace("_", " ")} &bull; {user?.preferredLanguage?.toUpperCase() || "EN"}
          </span>
        </div>

        {/* User Avatar */}
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white flex items-center justify-center font-bold text-sm shadow-sm">
          {user?.name?.[0]?.toUpperCase() || "U"}
        </div>

        {/* Sign Out */}
        <button
          onClick={() => {
            logout();
            navigate("/login");
          }}
          className="p-2 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          title="Sign out"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
