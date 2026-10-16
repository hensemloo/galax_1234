// FRONTEND MOCK FOR PRESENTATIONS ONLY. This is NOT real security:
// the logged-in user is kept in sessionStorage and anyone can edit it in DevTools.
// Phase 2 replaces this with tokens issued by the FastAPI backend.
import { createContext, useContext, useState } from 'react';
import * as authService from '../services/authService';

const STORAGE_KEY = 'cocoacheck.user';

const AuthContext = createContext(null);

function readStoredUser() {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function storeUser(user) {
  try {
    if (user) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Storage can be blocked (e.g. private mode). The session then lasts until refresh.
  }
}

export function AuthProvider({ children }) {
  // Read sessionStorage once on start-up so a page refresh keeps the session.
  const [user, setUser] = useState(readStoredUser);

  async function login(email, password) {
    const { user: loggedInUser } = await authService.login(email, password);
    storeUser(loggedInUser);
    setUser(loggedInUser);
    return loggedInUser;
  }

  // Clearing the user is enough: ProtectedRoute sees no user and redirects to /login.
  function logout() {
    storeUser(null);
    setUser(null);
  }

  return <AuthContext value={{ user, login, logout }}>{children}</AuthContext>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return context;
}
