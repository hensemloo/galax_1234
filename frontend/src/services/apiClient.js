import axios from 'axios';

// Mock switch. Mock mode is the DEFAULT, so the app works after a fresh `git pull` even without
// a .env file (the backend is not built yet). Set VITE_USE_MOCK=false in .env to call the real
// FastAPI backend instead.
export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

// Pretends to wait for the network so loading states can be seen in mock mode.
export function mockDelay(ms = 400) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const FALLBACK_MESSAGE = 'Something went wrong. Please try again.';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000,
});

// LATER (Phase 2): request interceptor to attach the auth token

// FastAPI sends errors as { detail: "message" }, or for validation errors (422)
// as { detail: [{ msg: "..." }, ...] }. Turn either into one readable sentence.
function getUserMessage(error) {
  const detail = error.response?.data?.detail;

  if (typeof detail === 'string' && detail.trim()) {
    return detail;
  }

  if (Array.isArray(detail)) {
    const messages = detail.map((item) => item?.msg).filter(Boolean);
    if (messages.length > 0) {
      return messages.join(' ');
    }
  }

  return FALLBACK_MESSAGE;
}

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    error.userMessage = getUserMessage(error);
    return Promise.reject(error);
  }
);

export default apiClient;
