import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

export interface GradeBoundary {
  letter: string;
  min: number;
  max: number;
  gpa: number;
}

export interface Settings {
  gpaFormat: "4.0" | "percentage";
  gradeBoundaries: GradeBoundary[];
}

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
  getLetterGrade: (percentage: number) => string;
  getGPAFromPercentage: (percentage: number) => number;
  isLoading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

const STORAGE_KEY = "@app_settings";

const DEFAULT_GRADE_BOUNDARIES: GradeBoundary[] = [
  { letter: "A+", min: 95, max: 100, gpa: 4.0 },
  { letter: "A", min: 90, max: 94, gpa: 4.0 },
  { letter: "A-", min: 85, max: 89, gpa: 3.7 },
  { letter: "B+", min: 80, max: 84, gpa: 3.3 },
  { letter: "B", min: 75, max: 79, gpa: 3.0 },
  { letter: "B-", min: 70, max: 74, gpa: 2.7 },
  { letter: "C+", min: 65, max: 69, gpa: 2.3 },
  { letter: "C", min: 60, max: 64, gpa: 2.0 },
  { letter: "C-", min: 55, max: 59, gpa: 1.7 },
  { letter: "D+", min: 50, max: 54, gpa: 1.3 },
  { letter: "D", min: 45, max: 49, gpa: 1.0 },
  { letter: "F", min: 0, max: 44, gpa: 0.0 },
];

const DEFAULT_SETTINGS: Settings = {
  gpaFormat: "4.0",
  gradeBoundaries: DEFAULT_GRADE_BOUNDARIES,
};

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // Load settings from AsyncStorage on mount
  useEffect(() => {
    loadSettings();
  }, []);

  // Save to AsyncStorage whenever settings change
  useEffect(() => {
    if (!isLoading) {
      saveSettings();
    }
  }, [settings]);

  const loadSettings = async () => {
    try {
      const storedData = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedData) {
        const parsedSettings = JSON.parse(storedData);
        setSettings({ ...DEFAULT_SETTINGS, ...parsedSettings });
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
  };

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const getLetterGrade = (percentage: number): string => {
    const boundary = settings.gradeBoundaries.find(
      (b) => percentage >= b.min && percentage <= b.max
    );
    return boundary ? boundary.letter : "F";
  };

  const getGPAFromPercentage = (percentage: number): number => {
    const boundary = settings.gradeBoundaries.find(
      (b) => percentage >= b.min && percentage <= b.max
    );
    return boundary ? boundary.gpa : 0.0;
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        getLetterGrade,
        getGPAFromPercentage,
        isLoading,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
