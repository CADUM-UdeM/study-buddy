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

export interface PomodoroStudyRecord {
  id: string;
  courseId: string;
  studyMinutes: number;
  startedAt: string;
  endedAt: string;
  completed: boolean;
}

interface PomodoroStudyContextType {
  records: PomodoroStudyRecord[];
  isLoading: boolean;
  addRecord: (
    record: Omit<PomodoroStudyRecord, "id">,
  ) => PomodoroStudyRecord;
  updateRecord: (id: string, updates: Partial<Omit<PomodoroStudyRecord, "id">>
  ) => (PomodoroStudyRecord | undefined)
  deleteRecord: (id: string) => void;
}

const PomodoroStudyContext = createContext<PomodoroStudyContextType | undefined>(
  undefined,
);

const STORAGE_KEY = "@pomodoro_study_records";

export function PomodoroStudyProvider({ children }: { children: ReactNode }) {
  const [records, setRecords] = useState<PomodoroStudyRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const persist = useCallback(async (nextRecords: PomodoroStudyRecord[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextRecords));
    } catch (error) {
      console.log("Impossible de sauvegarder les sessions pomodoro:", error);
    }
  }, []);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (!stored) return;
        const parsed = JSON.parse(stored) as PomodoroStudyRecord[];
        setRecords(Array.isArray(parsed) ? parsed : []);
      })
      .catch((error) => {
        console.log("Impossible de charger les sessions pomodoro:", error);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const addRecord = useCallback(
    (record: Omit<PomodoroStudyRecord, "id">) => {
      const nextRecord: PomodoroStudyRecord = {
        ...record,
        id: Date.now().toString(),
      };

      setRecords((prev) => {
        const next = [...prev, nextRecord];
        persist(next);
        return next;
      });

      return nextRecord;
    },
    [persist],
  );

  const updateRecord = useCallback(
     (id: string, updates: Partial<Omit<PomodoroStudyRecord, "id">>) => {
         let updatedRecord: PomodoroStudyRecord | undefined;

         setRecords((prev) => {
             const next = prev.map((record) => {
                 if (record.id === id) {
                     updatedRecord = { ...record, ...updates };
                     return updatedRecord;
                 }
                 return record;
             });

             persist(next);
             return next;
         });

         return updatedRecord;
     },
     [persist],
  );

  const deleteRecord = useCallback(
    (id: string) => {
      setRecords((prev) => {
        const next = prev.filter((record) => record.id !== id);
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const value = useMemo(
    () => ({
      records,
      isLoading,
      addRecord,
      updateRecord,
      deleteRecord,
    }),
    [addRecord, updateRecord, deleteRecord, isLoading, records],
  );

  return (
    <PomodoroStudyContext.Provider value={value}>
      {children}
    </PomodoroStudyContext.Provider>
  );
}

export function usePomodoroStudy() {
  const context = useContext(PomodoroStudyContext);
  if (!context) {
    throw new Error("usePomodoroStudy must be used within PomodoroStudyProvider");
  }
  return context;
}
