import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Scale, Mail, ArrowLeft, CheckCircle2, AlertCircle, Loader2, Sparkles, ExternalLink } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

const ForgotPassword = () => {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successData, setSuccessData] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setError("");
    setLoading(true);

    const res = await forgotPassword(email);
    setLoading(false);

    if (res.success) {
      setSuccessData(res);
    } else {
      setError(res.error || "Failed to process password reset. Please try again.");
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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-900/30 border border-brand-200/50 dark:border-brand-800/50 text-xs font-semibold text-brand-600 dark:text-brand-300">
            <Sparkles size={12} />
            <span>Account Security</span>
          </div>
        </div>

        {/* Card */}
        <div className="card p-8 shadow-xl">
          {successData ? (
            <div className="text-center py-4 space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 size={32} />
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Check your email</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  We've sent a password reset link to <strong className="text-slate-800 dark:text-slate-200">{email}</strong>.
                  The link will expire in 1 hour.
                </p>
              </div>

              {/* Dev/Simulated fallback banner if SMTP is not configured */}
              {successData.simulated && successData.resetUrl && (
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-left text-xs space-y-2">
                  <div className="font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                    <Sparkles size={14} />
                    <span>Local / Development Simulation</span>
                  </div>
                  <p className="text-amber-700 dark:text-amber-400">
                    SMTP server is not yet configured, so the reset link was simulated. You can test directly:
                  </p>
                  <a
                    href={successData.resetUrl}
                    className="inline-flex items-center gap-1 text-brand-600 dark:text-brand-400 font-semibold underline break-all hover:text-brand-700"
                  >
                    <span>Click here to reset password</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              )}

              <div className="pt-2 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => setSuccessData(null)}
                  className="btn-secondary w-full text-xs font-semibold"
                >
                  Resend another email
                </button>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 text-sm text-brand-600 dark:text-brand-400 font-medium hover:underline pt-2"
                >
                  <ArrowLeft size={16} />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Forgot password?</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  No worries! Enter your email address and we'll send you instructions to reset your password.
                </p>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl px-3.5 py-3 mb-5">
                  <AlertCircle size={18} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
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
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Sending reset link...</span>
                    </>
                  ) : (
                    <span>Send Reset Link</span>
                  )}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                >
                  <ArrowLeft size={16} />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
