import type { AuthSession, SessionUser } from "@/lib/auth";

export const SESSION_STORAGE_KEY = "user";
export const TOKEN_STORAGE_KEY = "token";
export const SESSION_EVENT = "handcrafted-haven:session-change";

export type ClientSession = AuthSession | null;

function isSessionUser(value: unknown): value is SessionUser {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.email === "string" &&
    typeof candidate.name === "string" &&
    (candidate.role === "user" || candidate.role === "seller")
  );
}

export function readClientSession(): ClientSession {
  if (typeof window === "undefined") {
    return null;
  }

  const token = window.localStorage.getItem(TOKEN_STORAGE_KEY);
  const rawUser = window.localStorage.getItem(SESSION_STORAGE_KEY);

  if (!token || !rawUser) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawUser) as unknown;

    if (!isSessionUser(parsed)) {
      return null;
    }

    return {
      token,
      user: parsed,
    };
  } catch {
    return null;
  }
}

export function writeClientSession(session: ClientSession) {
  if (typeof window === "undefined") {
    return;
  }

  if (!session) {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
  } else {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, session.token);
    window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session.user));
  }

  window.dispatchEvent(new CustomEvent(SESSION_EVENT));
}
