import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

export interface Session {
  id: string;
  name: string;
  isActive: boolean;
}

interface SessionsContextType {
  sessions: Session[];
  activeSession: Session | null;
  addSession: (name: string) => void;
  updateSession: (id: string, name: string) => void;
  deleteSession: (id: string) => void;
  setActiveSession: (id: string) => void;
  isLoading: boolean;
}

const SessionsContext = createContext<SessionsContextType | undefined>(
  undefined
);

const STORAGE_KEY = "@sessions_data";
const ACTIVE_SESSION_KEY = "@active_session_id";

export function SessionsProvider({ children }: { children: ReactNode }) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load sessions from AsyncStorage on mount
  useEffect(() => {
    loadSessions();
  }, []);

  // Save to AsyncStorage whenever sessions change
  useEffect(() => {
    if (!isLoading) {
      saveSessions();
    }
  }, [sessions]);

  // Save active session ID whenever it changes
  useEffect(() => {
    if (!isLoading && activeSessionId !== null) {
      AsyncStorage.setItem(ACTIVE_SESSION_KEY, activeSessionId);
    }
  }, [activeSessionId, isLoading]);

  const loadSessions = async () => {
    try {
      const [storedSessions, storedActiveId] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEY),
        AsyncStorage.getItem(ACTIVE_SESSION_KEY),
      ]);

      if (storedSessions) {
        const parsedSessions = JSON.parse(storedSessions);
        setSessions(parsedSessions);

        // Set active session
        if (storedActiveId && parsedSessions.find((s: Session) => s.id === storedActiveId)) {
          setActiveSessionId(storedActiveId);
        } else if (parsedSessions.length > 0) {
          // If no active session stored, use the first one or find one marked as active
          const active = parsedSessions.find((s: Session) => s.isActive) || parsedSessions[0];
          setActiveSessionId(active.id);
        }
      } else {
        // Initialize with default session
        const defaultSession: Session = {
          id: Date.now().toString(),
          name: "Session 1",
          isActive: true,
        };
        setSessions([defaultSession]);
        setActiveSessionId(defaultSession.id);
      }
    } catch (error) {
      console.error("Failed to load sessions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSessions = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    } catch (error) {
      console.error("Failed to save sessions:", error);
    }
  };

  const addSession = (name: string) => {
    const newSession: Session = {
      id: Date.now().toString(),
      name: name.trim(),
      isActive: false,
    };
    setSessions([...sessions, newSession]);
    // Optionally set as active when created
    setActiveSessionId(newSession.id);
  };

  const updateSession = (id: string, name: string) => {
    setSessions(
      sessions.map((session) =>
        session.id === id ? { ...session, name: name.trim() } : session
      )
    );
  };

  const deleteSession = (id: string) => {
    const remainingSessions = sessions.filter((session) => session.id !== id);
    
    if (remainingSessions.length === 0) {
      // If deleting the last session, create a default one
      const defaultSession: Session = {
        id: Date.now().toString(),
        name: "Session 1",
        isActive: true,
      };
      setSessions([defaultSession]);
      setActiveSessionId(defaultSession.id);
    } else {
      setSessions(remainingSessions);
      // If deleting the active session, switch to the first remaining one
      if (activeSessionId === id) {
        setActiveSessionId(remainingSessions[0].id);
      }
    }
  };

  const setActiveSession = (id: string) => {
    setActiveSessionId(id);
    // Update isActive flags
    setSessions(
      sessions.map((session) => ({
        ...session,
        isActive: session.id === id,
      }))
    );
  };

  const activeSession = sessions.find((s) => s.id === activeSessionId) || null;

  return (
    <SessionsContext.Provider
      value={{
        sessions,
        activeSession,
        addSession,
        updateSession,
        deleteSession,
        setActiveSession,
        isLoading,
      }}
    >
      {children}
    </SessionsContext.Provider>
  );
}

export function useSessions() {
  const context = useContext(SessionsContext);
  if (context === undefined) {
    throw new Error("useSessions must be used within a SessionsProvider");
  }
  return context;
}
