import React, { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';
import { getSocieties } from '../../api/events';
import { Shield, ArrowRight, Lock } from 'lucide-react';
import { ErrorBanner, Spinner } from '../../components/Spinner';

const inputClass =
  'w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all';

export const AdminLogin = () => {
  const { loginWithGoogle, devLogin, config, googleClientId, isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState('');
  const [testEmail, setTestEmail] = useState('');
  const [societies, setSocieties] = useState([]);
  const [societyId, setSocietyId] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getSocieties()
      .then((list) => {
        setSocieties(list);
        setSocietyId((cur) => cur || list[0]?.id || '');
      })
      .catch((err) => setErrorMessage(err.message));
  }, []);

  if (isLoading) return <Spinner />;
  if (isAdmin) return <Navigate to="/admin" replace />;

  const run = async (fn) => {
    setErrorMessage('');
    setBusy(true);
    try {
      await fn();
      navigate('/admin', { replace: true });
    } catch (err) {
      setErrorMessage(err.message || 'Failed to authenticate admin session.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-0 sm:px-4">
      <div className="max-w-md w-full bg-slate-900/90 border border-indigo-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center mb-8 relative">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 mb-4 shadow-lg shadow-amber-500/20">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white mb-2">Society Portal</h1>
          <p className="text-xs text-slate-400">Create, edit and publish your society's events.</p>
        </div>

        <div className="mb-6 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3 relative">
          <Lock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-200 leading-relaxed">
            Only <span className="font-semibold text-white">@kiit.ac.in</span> accounts registered as society
            representatives can publish events.
          </p>
        </div>

        <div className="mb-6 relative">
          <ErrorBanner message={errorMessage} />
        </div>

        <div className="space-y-4 relative">
          {config.devLoginEnabled && (
            <div>
              <label htmlFor="admin-society" className="block text-xs font-medium text-slate-400 mb-1">
                Society you represent
              </label>
              <select
                id="admin-society"
                value={societyId}
                onChange={(e) => setSocietyId(e.target.value)}
                className={inputClass}
              >
                {societies.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {googleClientId && (
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={({ credential }) => run(() => loginWithGoogle(credential, { asAdmin: true, societyId }))}
                onError={() => setErrorMessage('Google Sign In was cancelled or failed.')}
                hosted_domain="kiit.ac.in"
                theme="filled_black"
                shape="pill"
                text="signin_with"
              />
            </div>
          )}

          {config.devLoginEnabled && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                run(() => devLogin(testEmail, { asAdmin: true, societyId }));
              }}
              className="space-y-3"
            >
              <div>
                <label htmlFor="admin-email" className="block text-xs font-medium text-slate-400 mb-1">
                  Society rep email (demo sign-in)
                </label>
                <input
                  id="admin-email"
                  type="email"
                  required
                  placeholder="societyhead@kiit.ac.in"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className={inputClass}
                />
              </div>
              <button
                type="submit"
                disabled={busy || !societyId}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-indigo-600 hover:from-amber-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 group transition-all disabled:opacity-60"
              >
                {busy ? 'Signing in…' : 'Enter society portal'}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          )}
        </div>

        <p className="mt-8 text-center text-xs text-slate-500 relative">
          Looking for events?{' '}
          <Link to="/login" className="text-amber-400 hover:underline font-medium">
            Student login
          </Link>
        </p>
      </div>
    </div>
  );
};
