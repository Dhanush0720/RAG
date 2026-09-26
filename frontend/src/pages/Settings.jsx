import React from "react";
import DashboardLayout from "../components/DashboardLayout.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

const Settings = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-semibold mb-6">Settings</h1>

      <div className="card p-6 max-w-lg space-y-4">
        <div>
          <p className="text-xs text-slate-400">Name</p>
          <p className="font-medium">{user?.name}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Email</p>
          <p className="font-medium">{user?.email}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Role</p>
          <p className="font-medium capitalize">{user?.role?.replace("_", " ")}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Preferred language</p>
          <p className="font-medium uppercase">{user?.preferredLanguage}</p>
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          <div>
            <p className="text-sm font-medium">Theme</p>
            <p className="text-xs text-slate-400">Switch between light and dark mode.</p>
          </div>
          <button onClick={toggleTheme} className="btn-secondary text-sm">
            {theme === "dark" ? "Switch to Light" : "Switch to Dark"}
          </button>
        </div>
      </div>

      <div className="card p-6 max-w-lg mt-6">
        <p className="text-sm font-medium mb-2">Privacy notice</p>
        <p className="text-xs text-slate-400 leading-relaxed">
          LexiRAG is an AI-assisted legal review and research tool. It does not provide legal advice, and
          outputs should be verified by a qualified professional before being relied upon. Uploaded documents
          are not used to train AI models without explicit, separately documented authorization.
        </p>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
