import React, { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import { ErrorBanner, Spinner } from '../../components/Spinner';

export const StudentLogin = () => {
  const { loginWithGoogle, devLogin, config, googleClientId, isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [errorMessage, setErrorMessage] = useState('');
  const [testEmail, setTestEmail] = useState('');
  const [busy, setBusy] = useState(false);

  const goNext = (me) => {
    const from = location.state?.from?.pathname;
    navigate(me.onboarded ? from || '/home' : '/onboarding', { replace: true });
  };

  if (isLoading) return <Spinner />;
  if (isAuthenticated) return <Navigate to={user.onboarded ? '/home' : '/onboarding'} replace />;

  const run = async (fn) => {
    setErrorMessage('');
    setBusy(true);
    try {
      goNext(await fn());
    } catch (err) {
      setErrorMessage(err.message || 'Failed to sign in.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-0 sm:px-4">
      <div className="max-w-md w-full bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center mb-8 relative">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 mb-4 shadow-lg shadow-indigo-500/30">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">Welcome to EventSphere</h1>
          <p className="text-sm text-slate-400">Every KIIT society event, workshop and fest in one place.</p>
        </div>

        <div className="mb-6 p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-start gap-3 relative">
          <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
          <p className="text-xs text-indigo-200 leading-relaxed">
            Sign-in is restricted to <span className="font-semibold text-white">@kiit.ac.in</span> institutional accounts.
          </p>
        </div>

        <div className="mb-6 relative">
          <ErrorBanner message={errorMessage} />
        </div>

        <div className="space-y-4 relative">
          {googleClientId && (
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={({ credential }) => run(() => loginWithGoogle(credential))}
                onError={() => setErrorMessage('Google Sign In was cancelled or failed.')}
                hosted_domain="kiit.ac.in"
                theme="filled_black"
                shape="pill"
                text="signin_with"
              />
            </div>
          )}

          {config.devLoginEnabled && (
            <>
              {googleClientId && (
                <div className="relative my-6 text-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-800" />
                  </div>
                  <span className="relative px-3 bg-slate-900 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Or demo sign-in
                  </span>
                </div>
              )}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  run(() => devLogin(testEmail));
                }}
                className="space-y-3"
              >
                <div>
                  <label htmlFor="student-email" className="block text-xs font-medium text-slate-400 mb-1">
                    KIIT email
                  </label>
                  <input
                    id="student-email"
                    type="email"
                    required
                    placeholder="21051234@kiit.ac.in"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={busy}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 group transition-all disabled:opacity-60"
                >
                  {busy ? 'Signing in…' : 'Sign in with KIIT email'}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            </>
          )}

          {!googleClientId && !config.devLoginEnabled && (
            <p className="text-xs text-slate-400 text-center">Login is not configured on this server.</p>
          )}
        </div>

        <p className="mt-8 text-center text-xs text-slate-500 relative">
          Are you a society representative?{' '}
          <Link to="/admin/login" className="text-indigo-400 hover:underline font-medium">
            Society portal login
          </Link>
        </p>
      </div>
    </div>
  );
};
