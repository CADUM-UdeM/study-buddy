import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export interface PlannedStudySession {
  id: string;
  courseId?: string;
  description?: string;
  startDateTime: string;
  endDateTime: string;
}

interface PlannedStudyContextType {
  plannedSessions: PlannedStudySession[];
  isLoading: boolean;
  addPlannedSession: (
    session: Omit<PlannedStudySession, "id">,
  ) => PlannedStudySession;
  updatePlannedSession: (
    id: string,
    updates: Partial<Omit<PlannedStudySession, "id">>,
  ) => void;
  deletePlannedSession: (id: string) => void;
}

const PlannedStudyContext = createContext<PlannedStudyContextType | undefined>(
  undefined,
);

const STORAGE_KEY = "@planned_study_sessions";

function migrateSession(raw: Record<string, unknown>): PlannedStudySession {
  const legacyTitle =
    typeof raw.title === "string" ? raw.title.trim() : undefined;
  const legacyNotes =
    typeof raw.notes === "string" ? raw.notes.trim() : undefined;

  let description =
    typeof raw.description === "string" ? raw.description.trim() : undefined;

  if (!description && legacyNotes) {
    description = legacyNotes;
  } else if (
    !description &&
    legacyTitle &&
    legacyTitle !== "Séance d'étude"
  ) {
    description = legacyTitle;
  }

  return {
    id: String(raw.id),
    courseId:
      typeof raw.courseId === "string" && raw.courseId.length > 0
        ? raw.courseId
        : undefined,
    description: description || undefined,
    startDateTime: String(raw.startDateTime),
    endDateTime: String(raw.endDateTime),
  };
}

export function PlannedStudyProvider({ children }: { children: ReactNode }) {
  const [plannedSessions, setPlannedSessions] = useState<
    PlannedStudySession[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPlannedSessions();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      savePlannedSessions();
    }
  }, [plannedSessions, isLoading]);

  const loadPlannedSessions = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Record<string, unknown>[];
        setPlannedSessions(parsed.map(migrateSession));
      }
    } catch (error) {
      console.error("Failed to load planned study sessions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const savePlannedSessions = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(plannedSessions));
    } catch (error) {
      console.error("Failed to save planned study sessions:", error);
    }
  };

  const addPlannedSession = useCallback(
    (session: Omit<PlannedStudySession, "id">) => {
      const newSession: PlannedStudySession = {
        ...session,
        id: Date.now().toString(),
      };
      setPlannedSessions((prev) => [...prev, newSession]);
      return newSession;
    },
    [],
  );

  const updatePlannedSession = useCallback(
    (id: string, updates: Partial<Omit<PlannedStudySession, "id">>) => {
      setPlannedSessions((prev) =>
        prev.map((session) =>
          session.id === id ? { ...session, ...updates } : session,
        ),
      );
    },
    [],
  );

  const deletePlannedSession = useCallback((id: string) => {
    setPlannedSessions((prev) => prev.filter((session) => session.id !== id));
  }, []);

  const value = useMemo(
    () => ({
      plannedSessions,
      isLoading,
      addPlannedSession,
      updatePlannedSession,
      deletePlannedSession,
    }),
    [
      plannedSessions,
      isLoading,
      addPlannedSession,
      updatePlannedSession,
      deletePlannedSession,
    ],
  );

  return (
    <PlannedStudyContext.Provider value={value}>
      {children}
    </PlannedStudyContext.Provider>
  );
}

export function usePlannedStudy() {
  const context = useContext(PlannedStudyContext);
  if (context === undefined) {
    throw new Error(
      "usePlannedStudy must be used within a PlannedStudyProvider",
    );
  }
  return context;
}
