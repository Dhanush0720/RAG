import React, { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Scale, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const { resetPassword } = useAuth();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Password strength calculation
  const getStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strength = getStrength(password);
  const strengthLabels = ["Weak", "Fair", "Good", "Strong"];
  const strengthColors = ["bg-red-500", "bg-amber-500", "bg-blue-500", "bg-emerald-500"];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Invalid or missing password reset token. Please request a new link.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please verify both fields.");
      return;
    }

    setLoading(true);
    const res = await resetPassword(token, password);
    setLoading(false);

    if (res.success) {
      setSuccess(true);
    } else {
      setError(res.error || "Failed to reset password. The link may have expired.");
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-slate-50 dark:bg-[#0b0f19] px-4 py-12 overflow-hidden bg-grid-pattern">
      {/* Background ambient decorative glow */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-brand-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <Link to="/" className="group flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 via-brand-500 to-indigo-500 flex items-center justify-center text-white shadow-glow group-hover:scale-105 transition-transform duration-200">
              <Scale size={24} />
            </div>
            <span className="font-bold text-2xl tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              LexiRAG
            </span>
          </Link>
          <p className="text-sm text-slate-500 dark:text-slate-400">Set a new, secure password for your account</p>
        </div>

        {/* Card */}
        <div className="card p-8 shadow-xl">
          {success ? (
            <div className="text-center py-4 space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 size={32} />
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Password Reset Complete!</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                  Your password has been securely updated. You can now sign in with your new credentials.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="btn-primary w-full py-3"
                >
                  <span>Sign In Now</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          ) : !token ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
                <AlertCircle size={32} />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Invalid Reset Link</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                This password reset link is missing a valid security token or has already been used.
              </p>
              <div className="pt-2">
                <Link to="/forgot-password" className="btn-primary w-full py-2.5">
                  Request New Link
                </Link>
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Reset Password</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Choose a strong password with at least 8 characters.
                </p>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl px-3.5 py-3 mb-5">
                  <AlertCircle size={18} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2 block">
                    New Password
                  </label>
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
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {/* Password strength meter */}
                  {password.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <div className="flex gap-1 h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        {[1, 2, 3, 4].map((step) => (
                          <div
                            key={step}
                            className={`h-full flex-1 transition-all duration-300 ${
                              strength >= step ? strengthColors[strength - 1] : "opacity-0"
                            }`}
                          />
                        ))}
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-400">
                        <span>Strength: {strengthLabels[Math.max(0, strength - 1)]}</span>
                        <span>Min. 8 characters</span>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2 block">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock
                      size={18}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none"
                    />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      placeholder="••••••••••••"
                      className="input-field !pl-11 !pr-11"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2">
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Updating password...</span>
                    </>
                  ) : (
                    <span>Update Password</span>
                  )}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
                <Link
                  to="/login"
                  className="text-sm text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                >
                  Cancel and return to Sign In
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
