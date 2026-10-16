// FRONTEND MOCK FOR PRESENTATIONS ONLY. This is NOT real security:
// in mock mode the "check" runs in the browser against mocks/mockUsers.js.
// Real authentication (hashed passwords, tokens) is done by the FastAPI backend in Phase 2.
import apiClient, { USE_MOCK, mockDelay } from './apiClient';
import { mockUsers } from '../mocks/mockUsers';

const INVALID_LOGIN_MESSAGE = 'Invalid email or password';

// Returns { user } where user = { id, name, email, role }.
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
    const user = { id: match.id, name: match.name, email: match.email, role: match.role };
    return { user };
  }

  // Phase 2: endpoint to be built in FastAPI.
  const response = await apiClient.post('/api/auth/login', { email, password });
  return response.data;
}
