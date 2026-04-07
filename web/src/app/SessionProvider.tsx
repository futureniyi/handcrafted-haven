"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { AuthSession, SessionUser } from "@/lib/auth";
import {
  SESSION_EVENT,
  readClientSession,
  writeClientSession,
  type ClientSession,
} from "@/src/lib/session";

type SessionContextValue = {
  session: ClientSession;
  user: SessionUser | null;
  isAuthenticated: boolean;
  isSeller: boolean;
  isLoading: boolean;
  setSession: (nextSession: AuthSession) => void;
  clearSession: () => Promise<void>;
  updateSessionUser: (updates: Partial<SessionUser>) => void;
  refreshSession: () => Promise<ClientSession>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

type SessionProviderProps = {
  children: ReactNode;
  initialSession: ClientSession;
};

export default function SessionProvider({
  children,
  initialSession,
}: SessionProviderProps) {
  const [session, setSessionState] = useState<ClientSession>(initialSession);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    writeClientSession(initialSession);
    setSessionState(initialSession);
  }, [initialSession]);

  useEffect(() => {
    function syncFromStorage() {
      setSessionState(readClientSession());
    }

    window.addEventListener("storage", syncFromStorage);
    window.addEventListener(SESSION_EVENT, syncFromStorage);

    return () => {
      window.removeEventListener("storage", syncFromStorage);
      window.removeEventListener(SESSION_EVENT, syncFromStorage);
    };
  }, []);

  function setSession(nextSession: AuthSession) {
    writeClientSession(nextSession);
    setSessionState(nextSession);
  }

  async function clearSession() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
    } finally {
      writeClientSession(null);
      setSessionState(null);
    }
  }

  function updateSessionUser(updates: Partial<SessionUser>) {
    setSessionState((current) => {
      if (!current) {
        return current;
      }

      const nextSession = {
        ...current,
        user: {
          ...current.user,
          ...updates,
        },
      };

      writeClientSession(nextSession);
      return nextSession;
    });
  }

  async function refreshSession() {
    try {
      setIsLoading(true);

      const response = await fetch("/api/auth/session", {
        cache: "no-store",
      });
      const data = (await response.json()) as { session?: AuthSession | null };
      const nextSession = response.ok ? data.session || null : null;
      writeClientSession(nextSession);
      setSessionState(nextSession);
      return nextSession;
    } catch {
      writeClientSession(null);
      setSessionState(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <SessionContext.Provider
      value={{
        session,
        user: session?.user || null,
        isAuthenticated: Boolean(session?.user),
        isSeller: session?.user?.role === "seller",
        isLoading,
        setSession,
        clearSession,
        updateSessionUser,
        refreshSession,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error("useSession must be used within SessionProvider");
  }

  return context;
}
