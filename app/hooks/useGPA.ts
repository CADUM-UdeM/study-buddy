import { useCourses } from "../context/CoursesContext";
import { useSettings } from "../context/SettingsContext";

export function useGPA() {
  const { courses, calculateCourseGrade, calculateOverallGPA } = useCourses();
  const { getGPAFromPercentage, getLetterGrade, settings } = useSettings();

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

  const calculateOverallStats = () => {
    const coursesWithGrades = courses
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
      gpaDisplay: settings.gpaFormat === '4.0'
        ? overallGPA.toFixed(2)
        : `${averagePercentage.toFixed(1)}%`
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