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
        setCourses(JSON.parse(storedData));
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
                weight: 10,
                type: "travail",
              },
              {
                id: "2",
                name: "Devoir 2",
                note: 90,
                weight: 10,
                type: "travail",
              },
              {
                id: "3",
                name: "Examen intra",
                note: 86,
                weight: 10,
                type: "examen",
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
          return {
            ...course,
            evaluations: [...course.evaluations, newEvaluation],
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
          return {
            ...course,
            evaluations: course.evaluations.map((e) =>
              e.id === evaluationId ? { ...evaluation, id: evaluationId } : e
            ),
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
          return {
            ...course,
            evaluations: course.evaluations.filter(
              (e) => e.id !== evaluationId
            ),
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
