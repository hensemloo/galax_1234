// FRONTEND MOCK FOR PRESENTATIONS ONLY. This is NOT real security:
// the logged-in user is kept in sessionStorage (see services/authService.js) and anyone can
// edit it in DevTools.
// Phase 2 replaces this with tokens issued by the FastAPI backend.
import { createContext, useContext, useState } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Read sessionStorage once on start-up so a page refresh keeps the session.
  const [user, setUser] = useState(authService.getStoredUser);

  async function login(email, password) {
    const { user: loggedInUser } = await authService.login(email, password);
    authService.storeUser(loggedInUser);
    setUser(loggedInUser);
    return loggedInUser;
  }

  // Clearing the user is enough: ProtectedRoute sees no user and redirects to /login.
  function logout() {
    authService.storeUser(null);
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
