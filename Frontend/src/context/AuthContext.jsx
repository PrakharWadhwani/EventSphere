import React, { createContext, useContext, useState, useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('eventsphere_user');
    return savedUser
      ? JSON.parse(savedUser)
      : {
          name: '',
          email: '',
          role: 'student', // 'student' | 'admin'
          interests: [],
        };
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('eventsphere_auth') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('eventsphere_user', JSON.stringify(user));
    localStorage.setItem('eventsphere_auth', isAuthenticated ? 'true' : 'false');
  }, [user, isAuthenticated]);

  /**
   * Validates @kiit.ac.in domain email and sets up user session.
   * Throws Error if domain is invalid.
   */
  const loginWithGoogleToken = (decodedTokenPayload, targetRole = 'student') => {
    const email = decodedTokenPayload?.email || '';
    if (!email.toLowerCase().endsWith('@kiit.ac.in')) {
      throw new Error('Access Restricted: Only @kiit.ac.in Google accounts are allowed.');
    }

    const newUser = {
      name: decodedTokenPayload.name || email.split('@')[0],
      email: email,
      role: targetRole,
      interests: user.interests || [],
    };

    setUser(newUser);
    setIsAuthenticated(true);
    return newUser;
  };

  /**
   * Helper for simulated sign-in when Google Client ID is not configured in local dev environment
   */
  const simulatedLogin = (email, name = 'KIITian User', targetRole = 'student') => {
    if (!email.toLowerCase().endsWith('@kiit.ac.in')) {
      throw new Error('Access Restricted: Only @kiit.ac.in Google accounts are allowed.');
    }

    const newUser = {
      name: name || email.split('@')[0],
      email: email,
      role: targetRole,
      interests: user.interests || [],
    };

    setUser(newUser);
    setIsAuthenticated(true);
    return newUser;
  };

  const updateInterests = (interestsArray) => {
    setUser((prev) => ({ ...prev, interests: interestsArray }));
  };

  const toggleRole = () => {
    setUser((prev) => ({
      ...prev,
      role: prev.role === 'admin' ? 'student' : 'admin',
    }));
  };

  const logout = () => {
    setUser({ name: '', email: '', role: 'student', interests: [] });
    setIsAuthenticated(false);
    localStorage.removeItem('eventsphere_user');
    localStorage.removeItem('eventsphere_auth');
  };

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'mock-google-client-id';

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <AuthContext.Provider
        value={{
          user,
          name: user.name,
          email: user.email,
          role: user.role,
          interests: user.interests,
          isAuthenticated,
          loginWithGoogleToken,
          simulatedLogin,
          updateInterests,
          toggleRole,
          logout,
        }}
      >
        {children}
      </AuthContext.Provider>
    </GoogleOAuthProvider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
