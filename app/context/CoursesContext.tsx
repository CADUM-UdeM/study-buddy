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
  note: number | null; // null if scheduled/not graded yet
  weight: number;
  type: "travail" | "examen";
  isAutoWeight: boolean;
  isScheduled: boolean; // true if this is a future assignment
  targetGrade?: number; // calculated target grade for scheduled evaluations
  date?: string; // format "YYYY-MM-DD"
}

export interface Course {
  id: string;
  name: string;
  objective: number;
  credits: number; // credits field
  session?: string; // optional session field
  evaluations: Evaluation[];
}

interface CoursesContextType {
  courses: Course[];
  addCourse: (name: string, objective: number, credits: number, sessionId?: string) => void;
  updateCourse: (
    id: string,
    name: string,
    objective: number,
    credits: number,
    sessionId?: string
  ) => void;
  deleteCourse: (id: string) => void;
  getCourse: (id: string) => Course | undefined;
  getCoursesBySession: (sessionId: string | null) => Course[];
  addEvaluation: (courseId: string, evaluation: Omit<Evaluation, "id">) => void;
  updateEvaluation: (
    courseId: string,
    evaluationId: string,
    evaluation: Omit<Evaluation, "id">,
  ) => void;
  deleteEvaluation: (courseId: string, evaluationId: string) => void;
  calculateCourseGrade: (courseId: string) => number | null;
  calculateOverallGPA: (sessionId?: string | null) => {
    gpa: number;
    totalCredits: number;
    averageGrade: number;
  } | null;
  isLoading: boolean;
}

const CoursesContext = createContext<CoursesContextType | undefined>(undefined);

const STORAGE_KEY = "@courses_data";

// Helper function to calculate target grades for scheduled evaluations
const calculateTargetGrades = (
  evaluations: Evaluation[],
  objective: number,
): Evaluation[] => {
  const completed = evaluations.filter(
    (e) => !e.isScheduled && e.note !== null,
  );
  const scheduled = evaluations.filter((e) => e.isScheduled);

  if (scheduled.length === 0) return evaluations;

  // Calculate current weighted grade from completed evaluations
  const completedWeight = completed.reduce((sum, e) => sum + e.weight, 0);
  const completedWeightedSum = completed.reduce(
    (sum, e) => sum + e.note! * e.weight,
    0,
  );

  const scheduledWeight = scheduled.reduce((sum, e) => sum + e.weight, 0);

  if (scheduledWeight === 0) return evaluations;

  // Calculate what we need from scheduled evaluations
  const targetWeightedSum =
    objective * (completedWeight + scheduledWeight) - completedWeightedSum;
  const targetAverage = targetWeightedSum / scheduledWeight;

  // If target is achievable (<=100), distribute it evenly; otherwise set to 100
  const finalTarget = Math.min(100, Math.max(0, targetAverage));

  return evaluations.map((e) =>
    e.isScheduled
      ? { ...e, targetGrade: Math.round(finalTarget * 100) / 100 }
      : e,
  );
};

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
    e.isAutoWeight ? { ...e, weight: Math.round(autoWeight * 100) / 100 } : e,
  );
};

// Combined helper: recalculate both weights and targets
const recalculateEvaluations = (
  evaluations: Evaluation[],
  objective: number,
): Evaluation[] => {
  const withWeights = recalculateAutoWeights(evaluations);
  return calculateTargetGrades(withWeights, objective);
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
        // Ensure all evaluations have new properties (for backwards compatibility)
        const coursesWithNewProps = parsedCourses.map((course: Course) => ({
          ...course,
          credits: course.credits ?? 3, // default to 3 if missing
          evaluations: course.evaluations.map((e: any) => ({
            ...e,
            isAutoWeight: e.isAutoWeight ?? false,
            isScheduled: e.isScheduled ?? false,
            note: e.note ?? null,
            targetGrade: e.targetGrade ?? undefined,
          })),
        }));
        setCourses(coursesWithNewProps);
      } else {
        // Initialize with default data
        const defaultCourses: Course[] = [
          {
            id: "1",
            name: "Placeholder Cours",
            objective: 85,
            credits: 3,
            evaluations: [
              {
                id: "1",
                name: "Devoir 1",
                note: 70,
                weight: 33.33,
                type: "travail",
                isAutoWeight: true,
                isScheduled: false,
              },
              {
                id: "2",
                name: "Devoir 2",
                note: 90,
                weight: 33.33,
                type: "travail",
                isAutoWeight: true,
                isScheduled: false,
              },
              {
                id: "3",
                name: "Examen intra",
                note: 86,
                weight: 33.34,
                type: "examen",
                isAutoWeight: true,
                isScheduled: false,
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

  const addCourse = (name: string, objective: number, credits: number, sessionId?: string) => {
    const newCourse: Course = {
      id: Date.now().toString(),
      name,
      objective,
      credits,
      session: sessionId,
      evaluations: [],
    };
    setCourses([...courses, newCourse]);
  };

  const updateCourse = (
    id: string,
    name: string,
    objective: number,
    credits: number,
    sessionId?: string
  ) => {
    setCourses(
      courses.map((course) =>
        course.id === id
          ? {
              ...course,
              name,
              objective,
              credits,
              session: sessionId,
              evaluations: recalculateEvaluations(
                course.evaluations,
                objective,
              ),
            }
          : course,
      ),
    );
  };

  const deleteCourse = (id: string) => {
    setCourses(courses.filter((course) => course.id !== id));
  };

  const getCourse = (id: string) => {
    return courses.find((course) => course.id === id);
  };

  const getCoursesBySession = (sessionId: string | null): Course[] => {
    if (sessionId === null) {
      return courses.filter((course) => !course.session);
    }
    return courses.filter((course) => course.session === sessionId);
  };

  const addEvaluation = (
    courseId: string,
    evaluation: Omit<Evaluation, "id">,
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
            evaluations: recalculateEvaluations(
              updatedEvaluations,
              course.objective,
            ),
          };
        }
        return course;
      }),
    );
  };

  const updateEvaluation = (
    courseId: string,
    evaluationId: string,
    evaluation: Omit<Evaluation, "id">,
  ) => {
    setCourses(
      courses.map((course) => {
        if (course.id === courseId) {
          const updatedEvaluations = course.evaluations.map((e) =>
            e.id === evaluationId ? { ...evaluation, id: evaluationId } : e,
          );
          return {
            ...course,
            evaluations: recalculateEvaluations(
              updatedEvaluations,
              course.objective,
            ),
          };
        }
        return course;
      }),
    );
  };

  const deleteEvaluation = (courseId: string, evaluationId: string) => {
    setCourses(
      courses.map((course) => {
        if (course.id === courseId) {
          const updatedEvaluations = course.evaluations.filter(
            (e) => e.id !== evaluationId,
          );
          return {
            ...course,
            evaluations: recalculateEvaluations(
              updatedEvaluations,
              course.objective,
            ),
          };
        }
        return course;
      }),
    );
  };

  const calculateCourseGrade = (courseId: string): number | null => {
    const course = getCourse(courseId);
    if (!course || course.evaluations.length === 0) return null;

    const completedEvaluations = course.evaluations.filter(
      (e) => !e.isScheduled && e.note !== null,
    );

    if (completedEvaluations.length === 0) return null;

    const totalWeight = completedEvaluations.reduce(
      (sum, e) => sum + e.weight,
      0,
    );
    const weightedSum = completedEvaluations.reduce(
      (sum, e) => sum + e.note! * e.weight,
      0,
    );

    return totalWeight > 0 ? weightedSum / totalWeight : null;
  };


  const calculateOverallGPA = (sessionId?: string | null): {
    gpa: number;
    totalCredits: number;
    averageGrade: number;
  } | null => {
    const coursesToCalculate = sessionId !== undefined
      ? getCoursesBySession(sessionId)
      : courses;

    const coursesWithGrades = coursesToCalculate
      .map((course) => ({
        course,
        grade: calculateCourseGrade(course.id),
      }))
      .filter((item) => item.grade !== null);

    if (coursesWithGrades.length === 0) return null;

    const totalCredits = coursesWithGrades.reduce(
      (sum, item) => sum + item.course.credits,
      0
    );
    const weightedGPASum = coursesWithGrades.reduce((sum, item) => {
      // We'll need to get GPA from percentage using settings context
      // For now, return basic calculation - this will be enhanced when used with settings
      return sum + item.grade! * item.course.credits;
    }, 0);

    const averageGrade = weightedGPASum / totalCredits;

    // For now, return the average grade - GPA conversion will happen in components using settings
    return {
      gpa: averageGrade / 25, // Rough conversion for 4.0 scale (100% = 4.0)
      totalCredits,
      averageGrade,
    };
  };

  return (
    <CoursesContext.Provider
      value={{
        courses,
        addCourse,
        updateCourse,
        deleteCourse,
        getCourse,
        getCoursesBySession,
        addEvaluation,
        updateEvaluation,
        deleteEvaluation,
        calculateCourseGrade,
        calculateOverallGPA,
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
