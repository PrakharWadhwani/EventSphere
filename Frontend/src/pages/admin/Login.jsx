import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { useAuth } from '../../context/AuthContext';
import { Shield, AlertCircle, ArrowRight, Lock } from 'lucide-react';

export const AdminLogin = () => {
  const { loginWithGoogleToken, simulatedLogin } = useAuth();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState('');
  const [testEmail, setTestEmail] = useState('');

  const handleGoogleSuccess = (credentialResponse) => {
    setErrorMessage('');
    try {
      if (credentialResponse.credential) {
        const decoded = jwtDecode(credentialResponse.credential);
        loginWithGoogleToken(decoded, 'admin');
        navigate('/admin/create-event');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to authenticate admin session.');
    }
  };

  const handleSimulatedSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    try {
      simulatedLogin(testEmail, testEmail.split('@')[0], 'admin');
      navigate('/admin/create-event');
    } catch (err) {
      setErrorMessage(err.message);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-slate-900/90 border border-indigo-500/30 rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        {/* Admin Glow Effect */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Card Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 mb-4 shadow-lg shadow-amber-500/20">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white mb-2">
            Society & Admin Portal
          </h1>
          <p className="text-xs text-slate-400">
            Publish and manage official KIIT campus events.
          </p>
        </div>

        {/* Restriction Banner */}
        <div className="mb-6 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
          <Lock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-200 leading-relaxed">
            Requires <span className="font-semibold text-white">@kiit.ac.in</span> credentials. Logging in grants administrative access to create events.
          </p>
        </div>

        {/* Error Banner */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3">
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
              Or Instant Admin Portal Sign-In
            </span>
          </div>

          {/* Quick Admin Test Sign In */}
          <form onSubmit={handleSimulatedSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Enter your KIIT Society / Admin Email
              </label>
              <input
                type="email"
                required
                placeholder="societyhead@kiit.ac.in"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-indigo-600 hover:from-amber-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 group transition-all"
            >
              Access Event Creator Form
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </div>

        {/* Footer Link */}
        <p className="mt-8 text-center text-xs text-slate-500">
          Looking for student feeds?{' '}
          <a href="/login" className="text-amber-400 hover:underline font-medium">
            Student Portal Login
          </a>
        </p>
      </div>
    </div>
  );
};
