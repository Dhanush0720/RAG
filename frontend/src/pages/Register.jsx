import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Scale, User, Mail, Lock, Eye, EyeOff, Globe, Briefcase, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

const Register = () => {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
    preferredLanguage: "en",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    const result = await register(form);
    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-slate-50 dark:bg-[#0b0f19] px-4 py-12 overflow-hidden bg-grid-pattern">
      {/* Ambient background decorative glow */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-brand-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 via-brand-500 to-indigo-500 flex items-center justify-center text-white mb-4 shadow-glow">
            <Scale size={28} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Create your account
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
            Join LexiRAG for intelligent multilingual legal analysis
          </p>
        </div>

        {/* Form Card */}
        <div className="card p-8 shadow-xl">
          {error && (
            <div className="flex items-center gap-2.5 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl px-3.5 py-3 mb-6">
              <AlertCircle size={18} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5 block">
                Full Name
              </label>
              <div className="relative">
                <User
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none"
                />
                <input
                  required
                  placeholder="Adv. Rajesh Sharma"
                  className="input-field !pl-11"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5 block">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none"
                />
                <input
                  type="email"
                  required
                  placeholder="name@organization.com"
                  className="input-field !pl-11"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5 block">
                Password <span className="normal-case text-[11px] text-slate-400 font-normal">(min. 8 characters)</span>
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  placeholder="••••••••••••"
                  className="input-field !pl-11 !pr-11"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Role & Language */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                  <Briefcase size={13} />
                  <span>Role</span>
                </label>
                <select
                  className="input-field cursor-pointer"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  disabled={loading}
                >
                  <option value="student">Student / General</option>
                  <option value="legal_professional">Legal Professional</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                  <Globe size={13} />
                  <span>Language</span>
                </label>
                <select
                  className="input-field cursor-pointer"
                  value={form.preferredLanguage}
                  onChange={(e) => setForm({ ...form, preferredLanguage: e.target.value })}
                  disabled={loading}
                >
                  <option value="en">English</option>
                  <option value="te">Telugu (తెలుగు)</option>
                  <option value="hi">Hindi (हिन्दी)</option>
                </select>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 mt-4 text-sm font-semibold tracking-wide"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Registering account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Sign in link */}
          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 hover:underline transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
