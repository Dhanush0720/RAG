import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Scale, Mail, Lock, Eye, EyeOff, AlertCircle, Loader2, ShieldCheck, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

const Login = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const result = await login(form.email, form.password);
    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-slate-50 dark:bg-[#0b0f19] px-4 py-12 overflow-hidden bg-grid-pattern">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-brand-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 via-brand-500 to-indigo-500 flex items-center justify-center text-white mb-4 shadow-glow">
            <Scale size={28} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Welcome back to LexiRAG
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 max-w-xs">
            Multilingual legal intelligence & retrieval platform
          </p>
        </div>

        {/* Login Card */}
        <div className="card p-8 shadow-xl">
          {error && (
            <div className="flex items-center gap-2.5 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl px-3.5 py-3 mb-6">
              <AlertCircle size={18} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2 block">
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
                  placeholder="advocate@court.gov.in"
                  className="input-field !pl-11"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 block">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 hover:underline transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  required
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-sm font-semibold tracking-wide"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Platform</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Registration link */}
          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Don't have an account yet?{" "}
              <Link
                to="/register"
                className="font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 hover:underline transition-colors"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>

        {/* Security badge */}
        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-400 dark:text-slate-500">
          <ShieldCheck size={14} className="text-brand-500" />
          <span>AES-256 Encrypted &bull; Audited Legal RAG &bull; Role-Based Access</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
