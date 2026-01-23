import { useCourses } from "../context/CoursesContext";
import { useSessions } from "../context/SessionsContext";
import { useSettings } from "../context/SettingsContext";

export function useGPA() {
  const { courses, calculateCourseGrade, calculateOverallGPA, getCoursesBySession } = useCourses();
  const { getGPAFromPercentage, getLetterGrade, settings } = useSettings();
  const { activeSession } = useSessions();

  const calculateCourseGPA = (courseId: string) => {
    const grade = calculateCourseGrade(courseId);
    if (grade === null) return null;

    const gpa = getGPAFromPercentage(grade);
    const letterGrade = getLetterGrade(grade);

    return {
      percentage: grade,
      gpa,
      letterGrade
    };
  };

  const calculateOverallStats = (showGlobal?: boolean) => {
    // If showGlobal is true, use all courses. Otherwise, use active session + unassigned courses
    const coursesToCalculate = showGlobal
      ? courses // All courses from all sessions
      : activeSession
        ? [
          ...getCoursesBySession(activeSession.id),
          ...getCoursesBySession(null), // Include courses without session
        ]
        : courses; // Fallback to all if no active session

    const coursesWithGrades = coursesToCalculate
      .map(course => ({
        course,
        grade: calculateCourseGrade(course.id)
      }))
      .filter(item => item.grade !== null);

    if (coursesWithGrades.length === 0) return null;

    const totalCredits = coursesWithGrades.reduce((sum, item) => sum + item.course.credits, 0);

    // Calculate weighted GPA
    const weightedGPASum = coursesWithGrades.reduce((sum, item) => {
      const gpa = getGPAFromPercentage(item.grade!);
      return sum + (gpa * item.course.credits);
    }, 0);

    const overallGPA = totalCredits > 0 ? weightedGPASum / totalCredits : 0;

    // Calculate average percentage
    const weightedGradeSum = coursesWithGrades.reduce((sum, item) => {
      return sum + (item.grade! * item.course.credits);
    }, 0);

    const averagePercentage = totalCredits > 0 ? weightedGradeSum / totalCredits : 0;

    return {
      overallGPA,
      averagePercentage,
      totalCredits,
      courseCount: coursesWithGrades.length,
      gpaDisplay: settings.gpaFormat === 'percentage'
        ? `${averagePercentage.toFixed(1)}%`
        : settings.gpaFormat === '4.0'
          ? overallGPA.toFixed(2)
          : overallGPA.toFixed(2) // Default to 4.3
    };
  };

  const getAllCourseGrades = () => {
    return courses.map(course => ({
      course,
      grade: calculateCourseGPA(course.id)
    }));
  };

  return {
    calculateCourseGPA,
    calculateOverallStats,
    getAllCourseGrades,
    courses
  };
}