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
  gpaFormat: "4.0" | "4.3" | "percentage";
  gradeBoundaries: GradeBoundary[];
  showStudyTime: boolean;
  showStreak: boolean;
  showGPA: boolean;
  showAverage: boolean;
  showCourseCount: boolean;
  isDarkMode: boolean;
}

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
  updateGradeBoundaries: (boundaries: GradeBoundary[]) => void;
  resetGradeBoundariesToDefault: () => void;
  getLetterGrade: (percentage: number, customBoundaries?: GradeBoundary[]) => string;
  getGPAFromPercentage: (percentage: number, customBoundaries?: GradeBoundary[]) => number;
  isLoading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

const STORAGE_KEY = "@app_settings";

const DEFAULT_GRADE_BOUNDARIES_4_0: GradeBoundary[] = [
  { letter: "A+", min: 90, max: 100, gpa: 4.0 },
  { letter: "A", min: 85, max: 89, gpa: 4.0 },
  { letter: "A-", min: 80, max: 84, gpa: 3.7 },
  { letter: "B+", min: 77, max: 79, gpa: 3.3 },
  { letter: "B", min: 73, max: 76, gpa: 3.0 },
  { letter: "B-", min: 70, max: 72, gpa: 2.7 },
  { letter: "C+", min: 67, max: 69, gpa: 2.3 },
  { letter: "C", min: 63, max: 66, gpa: 2.0 },
  { letter: "C-", min: 60, max: 62, gpa: 1.7 },
  { letter: "D+", min: 57, max: 59, gpa: 1.3 },
  { letter: "D", min: 50, max: 56, gpa: 1.0 },
  { letter: "F", min: 0, max: 49, gpa: 0.0 },
];

const DEFAULT_GRADE_BOUNDARIES_4_3: GradeBoundary[] = [
  { letter: "A+", min: 90, max: 100, gpa: 4.3 },
  { letter: "A", min: 85, max: 89, gpa: 4.0 },
  { letter: "A-", min: 80, max: 84, gpa: 3.7 },
  { letter: "B+", min: 77, max: 79, gpa: 3.3 },
  { letter: "B", min: 73, max: 76, gpa: 3.0 },
  { letter: "B-", min: 70, max: 72, gpa: 2.7 },
  { letter: "C+", min: 67, max: 69, gpa: 2.3 },
  { letter: "C", min: 63, max: 66, gpa: 2.0 },
  { letter: "C-", min: 60, max: 62, gpa: 1.7 },
  { letter: "D+", min: 57, max: 59, gpa: 1.3 },
  { letter: "D", min: 50, max: 56, gpa: 1.0 },
  { letter: "E", min: 35, max: 49, gpa: 0.5 },
  { letter: "F", min: 0, max: 34, gpa: 0.0 },
];

const DEFAULT_SETTINGS: Settings = {
  gpaFormat: "4.3",
  gradeBoundaries: DEFAULT_GRADE_BOUNDARIES_4_3,
  showStudyTime: true,
  showStreak: true,
  showGPA: true,
  showAverage: true,
  showCourseCount: true,
  isDarkMode: true,
};

// Helper function to get boundaries based on GPA format
const getDefaultBoundariesForFormat = (format: string): GradeBoundary[] => {
  switch (format) {
    case "4.3":
      return DEFAULT_GRADE_BOUNDARIES_4_3;
    case "4.0":
    default:
      return DEFAULT_GRADE_BOUNDARIES_4_0;
  }
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
        const mergedSettings = { ...DEFAULT_SETTINGS, ...parsedSettings };

        // Convert percentage format to 4.3 if it's the old default
        if (mergedSettings.gpaFormat === "percentage") {
          mergedSettings.gpaFormat = "4.3";
          mergedSettings.gradeBoundaries = DEFAULT_GRADE_BOUNDARIES_4_3;
        } else {
          // Ensure gradeBoundaries match the current format
          mergedSettings.gradeBoundaries = getDefaultBoundariesForFormat(
            mergedSettings.gpaFormat
          );
        }

        setSettings(mergedSettings);
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
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      // If gpaFormat changed, always update gradeBoundaries to match the format
      if (newSettings.gpaFormat && newSettings.gpaFormat !== prev.gpaFormat) {
        updated.gradeBoundaries = getDefaultBoundariesForFormat(
          newSettings.gpaFormat
        );
      }
      return updated;
    });
  };

  const updateGradeBoundaries = (boundaries: GradeBoundary[]) => {
    setSettings((prev) => ({
      ...prev,
      gradeBoundaries: boundaries,
    }));
  };

  const resetGradeBoundariesToDefault = () => {
    setSettings((prev) => ({
      ...prev,
      gradeBoundaries: getDefaultBoundariesForFormat(prev.gpaFormat),
    }));
  };

  const getLetterGrade = (percentage: number, customBoundaries?: GradeBoundary[]): string => {
    const boundaries = customBoundaries || settings.gradeBoundaries;
    
    // Find exact match first
    const exactMatch = boundaries.find(
      (b) => percentage >= b.min && percentage <= b.max
    );
    if (exactMatch) return exactMatch.letter;
    
    // If no exact match (due to gaps between boundaries), find the nearest boundary
    // Prefer boundaries where percentage is >= min (i.e., the lower boundary of a gap)
    const lowerBoundary = boundaries
      .filter((b) => percentage >= b.min)
      .sort((a, b) => b.min - a.min)[0];
    
    if (lowerBoundary) return lowerBoundary.letter;
    
    // If percentage is below all boundaries, return the lowest boundary's letter
    const lowestBoundary = boundaries.reduce((lowest, current) =>
      current.min < lowest.min ? current : lowest
    );
    
    return lowestBoundary ? lowestBoundary.letter : "F";
  };

  const getGPAFromPercentage = (percentage: number, customBoundaries?: GradeBoundary[]): number => {
    const boundaries = customBoundaries || settings.gradeBoundaries;
    
    // Find exact match first
    const exactMatch = boundaries.find(
      (b) => percentage >= b.min && percentage <= b.max
    );
    if (exactMatch) return exactMatch.gpa;
    
    // If no exact match (due to gaps between boundaries), find the nearest boundary
    // Prefer boundaries where percentage is >= min (i.e., the lower boundary of a gap)
    const lowerBoundary = boundaries
      .filter((b) => percentage >= b.min)
      .sort((a, b) => b.min - a.min)[0];
    
    if (lowerBoundary) return lowerBoundary.gpa;
    
    // If percentage is below all boundaries, return the lowest boundary's GPA
    const lowestBoundary = boundaries.reduce((lowest, current) =>
      current.min < lowest.min ? current : lowest
    );
    
    return lowestBoundary ? lowestBoundary.gpa : 0.0;
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        updateGradeBoundaries,
        resetGradeBoundariesToDefault,
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
