// FRONTEND MOCK FOR PRESENTATIONS ONLY. This is NOT real security:
// in mock mode the "check" runs in the browser against mocks/mockUsers.js,
// and the logged-in user is kept in sessionStorage (anyone can edit it in DevTools).
// Real authentication (hashed passwords, tokens) is done by the FastAPI backend later.
import apiClient, { USE_MOCK, mockDelay } from './apiClient';
import { mockUsers } from '../mocks/mockUsers';

const INVALID_LOGIN_MESSAGE = 'Email or password is incorrect.';
const STORAGE_KEY = 'cocoacheck.user';

// The user saved after login, or null. Used by AuthContext on start-up and by mock services
// (so mock data can be limited to the logged-in officer, like the backend will do).
export function getStoredUser() {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

// Save (or clear, with null) the logged-in user.
export function storeUser(user) {
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

// Returns { user } where user = { id, name, staffId, email, role }.
export async function login(email, password) {
  if (USE_MOCK) {
    await mockDelay(600);

    const match = mockUsers.find(
      (mockUser) =>
        mockUser.email.toLowerCase() === email.trim().toLowerCase() &&
        mockUser.password === password
    );

    if (!match) {
      throw new Error(INVALID_LOGIN_MESSAGE);
    }

    // Never pass the password on to the rest of the app.
    const user = {
      id: match.id,
      name: match.name,
      staffId: match.staffId,
      email: match.email,
      role: match.role,
    };
    return { user };
  }

  // Backend later: POST /auth/login (draft API in CLAUDE.md section 11).
  const response = await apiClient.post('/auth/login', { email, password });
  return response.data;
}
