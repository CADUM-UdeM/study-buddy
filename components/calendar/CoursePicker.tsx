import { Course } from "@/app/context/CoursesContext";
import { lightTheme } from "@/components/colors";
import { getPastelChipStyle } from "@/components/home/pastelStyles";
import React from "react";
import { Pressable, Text, View } from "react-native";

interface CoursePickerProps {
  courses: Course[];
  selectedCourseId?: string;
  onSelect: (courseId?: string) => void;
  theme: typeof lightTheme;
}

export function CoursePicker({
  courses,
  selectedCourseId,
  onSelect,
  theme,
}: CoursePickerProps) {
  const rowStyle = (selected: boolean) => ({
    ...getPastelChipStyle(theme),
    borderWidth: selected ? 2 : 1,
    borderColor: selected ? theme.activeColorIcon : theme.cardBorderSoft,
  });

  return (
    <View className="gap-2">
      <Text className="font-pixel text-sm" style={{ color: theme.gray }}>
        Cours (optionnel)
      </Text>

      <Pressable
        onPress={() => onSelect(undefined)}
        className="flex-row items-center rounded-xl px-4 py-3"
        style={rowStyle(!selectedCourseId)}
      >
        <Text
          className="flex-1 font-pixel text-base"
          style={{
            color: !selectedCourseId
              ? theme.activeTextColor
              : theme.defaultTextColor,
          }}
        >
          Aucun cours
        </Text>
        <View
          className="w-5 h-5 rounded-full border-2"
          style={{
            borderColor: theme.defaultTextColor,
            backgroundColor: !selectedCourseId
              ? theme.activeTextColor
              : "transparent",
          }}
        />
      </Pressable>

      {courses.length === 0 ? (
        <Text className="font-pixel text-xs px-1" style={{ color: theme.gray }}>
          Ajoutez des cours dans l&apos;onglet Données pour les lier ici.
        </Text>
      ) : (
        courses.map((course) => {
          const selected = selectedCourseId === course.id;
          return (
            <Pressable
              key={course.id}
              onPress={() => onSelect(course.id)}
              className="flex-row items-center rounded-xl px-4 py-3"
              style={rowStyle(selected)}
            >
              <Text
                className="flex-1 font-pixel text-base"
                style={{
                  color: selected
                    ? theme.activeTextColor
                    : theme.defaultTextColor,
                }}
                numberOfLines={1}
              >
                {course.name}
              </Text>
              <View
                className="w-5 h-5 rounded-full border-2"
                style={{
                  borderColor: theme.defaultTextColor,
                  backgroundColor: selected
                    ? theme.activeTextColor
                    : "transparent",
                }}
              />
            </Pressable>
          );
        })
      )}
    </View>
  );
}
