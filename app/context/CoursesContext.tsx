import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

export interface Evaluation {
  id: string;
  name: string;
  note: number;
  weight: number;
  type: "travail" | "examen";
  isAutoWeight: boolean; // Track if weight is auto-calculated
}

export interface Course {
  id: string;
  name: string;
  objective: number;
  evaluations: Evaluation[];
}

interface CoursesContextType {
  courses: Course[];
  addCourse: (name: string, objective: number) => void;
  updateCourse: (id: string, name: string, objective: number) => void;
  deleteCourse: (id: string) => void;
  getCourse: (id: string) => Course | undefined;
  addEvaluation: (courseId: string, evaluation: Omit<Evaluation, "id">) => void;
  updateEvaluation: (
    courseId: string,
    evaluationId: string,
    evaluation: Omit<Evaluation, "id">
  ) => void;
  deleteEvaluation: (courseId: string, evaluationId: string) => void;
  isLoading: boolean;
}

const CoursesContext = createContext<CoursesContextType | undefined>(undefined);

const STORAGE_KEY = "@courses_data";

// Helper function to recalculate auto-weights
const recalculateAutoWeights = (evaluations: Evaluation[]): Evaluation[] => {
  const manualWeightTotal = evaluations
    .filter((e) => !e.isAutoWeight)
    .reduce((sum, e) => sum + e.weight, 0);

  const autoWeightCount = evaluations.filter((e) => e.isAutoWeight).length;

  if (autoWeightCount === 0) return evaluations;

  const remainingWeight = Math.max(0, 100 - manualWeightTotal);
  const autoWeight =
    autoWeightCount > 0 ? remainingWeight / autoWeightCount : 0;

  return evaluations.map((e) =>
    e.isAutoWeight ? { ...e, weight: Math.round(autoWeight * 100) / 100 } : e
  );
};

export function CoursesProvider({ children }: { children: ReactNode }) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from AsyncStorage on mount
  useEffect(() => {
    loadCourses();
  }, []);

  // Save to AsyncStorage whenever courses change
  useEffect(() => {
    if (!isLoading) {
      saveCourses();
    }
  }, [courses]);

  const loadCourses = async () => {
    try {
      const storedData = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedData) {
        const parsedCourses = JSON.parse(storedData);
        // Ensure all evaluations have isAutoWeight property (for backwards compatibility)
        const coursesWithAutoWeight = parsedCourses.map((course: Course) => ({
          ...course,
          evaluations: course.evaluations.map((e: any) => ({
            ...e,
            isAutoWeight: e.isAutoWeight ?? false,
          })),
        }));
        setCourses(coursesWithAutoWeight);
      } else {
        // Initialize with default data if nothing stored
        const defaultCourses: Course[] = [
          {
            id: "1",
            name: "Placeholder Cours",
            objective: 85,
            evaluations: [
              {
                id: "1",
                name: "Devoir 1",
                note: 70,
                weight: 33.33,
                type: "travail",
                isAutoWeight: true,
              },
              {
                id: "2",
                name: "Devoir 2",
                note: 90,
                weight: 33.33,
                type: "travail",
                isAutoWeight: true,
              },
              {
                id: "3",
                name: "Examen intra",
                note: 86,
                weight: 33.34,
                type: "examen",
                isAutoWeight: true,
              },
            ],
          },
        ];
        setCourses(defaultCourses);
      }
    } catch (error) {
      console.error("Failed to load courses:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveCourses = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(courses));
    } catch (error) {
      console.error("Failed to save courses:", error);
    }
  };

  const addCourse = (name: string, objective: number) => {
    const newCourse: Course = {
      id: Date.now().toString(),
      name,
      objective,
      evaluations: [],
    };
    setCourses([...courses, newCourse]);
  };

  const updateCourse = (id: string, name: string, objective: number) => {
    setCourses(
      courses.map((course) =>
        course.id === id ? { ...course, name, objective } : course
      )
    );
  };

  const deleteCourse = (id: string) => {
    setCourses(courses.filter((course) => course.id !== id));
  };

  const getCourse = (id: string) => {
    return courses.find((course) => course.id === id);
  };

  const addEvaluation = (
    courseId: string,
    evaluation: Omit<Evaluation, "id">
  ) => {
    setCourses(
      courses.map((course) => {
        if (course.id === courseId) {
          const newEvaluation: Evaluation = {
            ...evaluation,
            id: Date.now().toString(),
          };
          const updatedEvaluations = [...course.evaluations, newEvaluation];
          return {
            ...course,
            evaluations: recalculateAutoWeights(updatedEvaluations),
          };
        }
        return course;
      })
    );
  };

  const updateEvaluation = (
    courseId: string,
    evaluationId: string,
    evaluation: Omit<Evaluation, "id">
  ) => {
    setCourses(
      courses.map((course) => {
        if (course.id === courseId) {
          const updatedEvaluations = course.evaluations.map((e) =>
            e.id === evaluationId ? { ...evaluation, id: evaluationId } : e
          );
          return {
            ...course,
            evaluations: recalculateAutoWeights(updatedEvaluations),
          };
        }
        return course;
      })
    );
  };

  const deleteEvaluation = (courseId: string, evaluationId: string) => {
    setCourses(
      courses.map((course) => {
        if (course.id === courseId) {
          const updatedEvaluations = course.evaluations.filter(
            (e) => e.id !== evaluationId
          );
          return {
            ...course,
            evaluations: recalculateAutoWeights(updatedEvaluations),
          };
        }
        return course;
      })
    );
  };

  return (
    <CoursesContext.Provider
      value={{
        courses,
        addCourse,
        updateCourse,
        deleteCourse,
        getCourse,
        addEvaluation,
        updateEvaluation,
        deleteEvaluation,
        isLoading,
      }}
    >
      {children}
    </CoursesContext.Provider>
  );
}

export function useCourses() {
  const context = useContext(CoursesContext);
  if (context === undefined) {
    throw new Error("useCourses must be used within a CoursesProvider");
  }
  return context;
}
