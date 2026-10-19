import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { api, getToken, setToken } from '../api/client';
import { followSociety, unfollowSociety } from '../api/events';

const AuthContext = createContext(null);

export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [config, setConfig] = useState({ devLoginEnabled: true, interestTags: [] });
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from a stored token on first load.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const cfg = await api('/auth/config');
        if (!cancelled) setConfig(cfg);
      } catch {
        // Backend down; pages will surface the error when they fetch.
      }
      if (getToken()) {
        try {
          const { user: me } = await api('/auth/me');
          if (!cancelled) setUser(me);
        } catch {
          setToken(null);
        }
      }
      if (!cancelled) setIsLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const finishLogin = ({ token, user: me }) => {
    setToken(token);
    setUser(me);
    return me;
  };

  /** Google ID token login. The server verifies the token and the @kiit.ac.in domain. */
  const loginWithGoogle = async (credential, { asAdmin = false, societyId } = {}) =>
    finishLogin(await api('/auth/google', { method: 'POST', body: { credential, asAdmin, societyId } }));

  /** Email-only login, available when the server has dev login enabled. */
  const devLogin = async (email, { asAdmin = false, societyId, name } = {}) => {
    if (!email.toLowerCase().trim().endsWith('@kiit.ac.in')) {
      throw new Error('Access Restricted: Only @kiit.ac.in accounts are allowed.');
    }
    return finishLogin(await api('/auth/dev-login', { method: 'POST', body: { email, name, asAdmin, societyId } }));
  };

  /** PATCH /auth/me with { interests?, name? }. */
  const updateProfile = async (changes) => {
    const { user: me } = await api('/auth/me', { method: 'PATCH', body: changes });
    setUser(me);
    return me;
  };

  const updateInterests = (interests) => updateProfile({ interests });

  const toggleFollow = useCallback(
    async (societyId) => {
      const isFollowing = user?.following?.includes(societyId);
      const res = isFollowing ? await unfollowSociety(societyId) : await followSociety(societyId);
      setUser(res.user);
      return res;
    },
    [user]
  );

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    config,
    isLoading,
    isAuthenticated: !!user,
    name: user?.name || '',
    email: user?.email || '',
    isAdmin: !!user?.isAdmin,
    interests: user?.interests || [],
    following: user?.following || [],
    loginWithGoogle,
    devLogin,
    updateInterests,
    updateProfile,
    toggleFollow,
    logout,
  };

  const content = <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
  return GOOGLE_CLIENT_ID ? <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>{content}</GoogleOAuthProvider> : content;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
