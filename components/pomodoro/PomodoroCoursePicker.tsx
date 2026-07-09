import { Course } from "@/app/context/CoursesContext";
import { lightTheme } from "@/components/colors";
import { buildCourseColorMap } from "@/components/courses/courseColors";
import { getPastelChipStyle, PastelCard } from "@/components/home/PastelCard";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

interface PomodoroCoursePickerProps {
  theme: typeof lightTheme;
  courses: Course[];
  selectedCourseId?: string;
  onSelect: (courseId: string) => void;
  disabled?: boolean;
  animated?: boolean;
  animationDelay?: number;
}

export function PomodoroCoursePicker({
  theme,
  courses,
  selectedCourseId,
  onSelect,
  disabled = false,
  animated = true,
  animationDelay = 60,
}: PomodoroCoursePickerProps) {
  const colorMap = buildCourseColorMap(courses, theme);

  return (
    <PastelCard
      theme={theme}
      animated={animated}
      animationDelay={animationDelay}
      className="mb-3"
      contentStyle={{ padding: 14 }}
    >
      <Text
        className="font-pixel text-sm mb-3"
        style={{ color: theme.defaultTextColor }}
      >
        Cours pour cette session
      </Text>

      {courses.length === 0 ? (
        <Text className="font-pixel text-xs" style={{ color: theme.gray }}>
          Ajoutez des cours dans l&apos;onglet Données pour lier vos sessions
          pomodoro.
        </Text>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingRight: 4 }}
        >
          {courses.map((course) => {
            const selected = selectedCourseId === course.id;
            const accent = colorMap.get(course.id) ?? theme.circleColor;

            return (
              <Pressable
                key={course.id}
                disabled={disabled}
                onPress={() => onSelect(course.id)}
                className="rounded-2xl px-4 py-2.5"
                style={[
                  getPastelChipStyle(theme),
                  {
                    borderWidth: selected ? 2 : 1,
                    borderColor: selected ? accent : theme.cardBorderSoft,
                    opacity: disabled ? 0.55 : 1,
                    backgroundColor: selected ? theme.cardGlow : theme.cardSurface,
                  },
                ]}
              >
                <Text
                  className="font-pixel text-sm"
                  style={{
                    color: selected ? theme.activeTextColor : theme.defaultTextColor,
                  }}
                  numberOfLines={1}
                >
                  {course.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </PastelCard>
  );
}
