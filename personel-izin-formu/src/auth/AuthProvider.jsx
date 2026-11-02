import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { request, session } from '../api/client';
import { LOGIN, ME } from '../api/operations';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  const logout = useCallback(() => {
    session.token = null;
    setUser(null);
  }, []);

  // Reloads the signed-in user (e.g. after a request changes the balance).
  const refresh = useCallback(async () => {
    if (!session.token) {
      setUser(null);
      return null;
    }
    try {
      const { me } = await request(ME);
      setUser(me);
      if (!me) session.token = null;
      return me;
    } catch {
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    refresh().finally(() => setReady(true));
    window.addEventListener('auth:expired', logout);
    return () => window.removeEventListener('auth:expired', logout);
  }, [refresh, logout]);

  const login = useCallback(async (username, password) => {
    const { login: result } = await request(LOGIN, { username, password });
    session.token = result.token;
    setUser(result.user);
    return result.user;
  }, []);

  const value = useMemo(() => ({ user, ready, login, logout, refresh }), [user, ready, login, logout, refresh]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
