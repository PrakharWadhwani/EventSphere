import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';

export const StudentLogin = () => {
  const { loginWithGoogleToken, simulatedLogin } = useAuth();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState('');
  const [testEmail, setTestEmail] = useState('');

  const handleGoogleSuccess = (credentialResponse) => {
    setErrorMessage('');
    try {
      if (credentialResponse.credential) {
        const decoded = jwtDecode(credentialResponse.credential);
        loginWithGoogleToken(decoded, 'student');
        navigate('/onboarding');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to authenticate with Google.');
    }
  };

  const handleSimulatedSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    try {
      simulatedLogin(testEmail, testEmail.split('@')[0], 'student');
      navigate('/onboarding');
    } catch (err) {
      setErrorMessage(err.message);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-slate-900/80 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        {/* Glow effect background */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Card Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 mb-4 shadow-lg shadow-indigo-500/30">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">
            Welcome to EventSphere
          </h1>
          <p className="text-sm text-slate-400">
            Discover and participate in exclusive KIIT campus events.
          </p>
        </div>

        {/* Domain Restriction Notice */}
        <div className="mb-6 p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
          <p className="text-xs text-indigo-200 leading-relaxed">
            Authentication is strictly restricted to valid <span className="font-semibold text-white">@kiit.ac.in</span> institutional email addresses.
          </p>
        </div>

        {/* Error Banner */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 animate-shake">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <p className="text-xs text-rose-300 font-medium leading-relaxed">
              {errorMessage}
            </p>
          </div>
        )}

        {/* Google OAuth Section */}
        <div className="space-y-4">
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setErrorMessage('Google Sign In was cancelled or failed.')}
              useOneTap
              theme="filled_black"
              shape="pill"
              text="signin_with"
            />
          </div>

          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <span className="relative px-3 bg-slate-900 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Or Instant KIIT Portal Sign-In
            </span>
          </div>

          {/* Quick KIIT Email Test Sign In */}
          <form onSubmit={handleSimulatedSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Enter your KIIT Roll / Institutional Email
              </label>
              <input
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
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 group transition-all"
            >
              Sign in with KIIT Account
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </div>

        {/* Footer Link */}
        <p className="mt-8 text-center text-xs text-slate-500">
          Are you a Society Lead or Admin?{' '}
          <a href="/admin/login" className="text-indigo-400 hover:underline font-medium">
            Admin Portal Login
          </a>
        </p>
      </div>
    </div>
  );
};
