import { Course } from "@/app/context/CoursesContext";
import { useStudyHours } from "@/app/hooks/useStudyHours";
import { lightTheme } from "@/components/colors";
import { shadePastelColor, withPastelAlpha } from "@/components/courses/courseColors";
import { formatStudyHours } from "@/components/courses/courseWeeklyHours";
import { getProgressFillColor } from "@/components/courses/progressColor";
import { IdleFloat } from "@/components/home/IdleFloat";
import React from "react";
import { Alert, Platform, Pressable, Text, View } from "react-native";

interface CourseGridCardProps {
  course: Course;
  accentColor: string;
  theme: typeof lightTheme;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function PostItFold({ paperColor }: { paperColor: string }) {
  const creaseShadow = shadePastelColor(paperColor, 0.22);
  const foldBack = shadePastelColor(paperColor, 0.05);

  return (
    <View pointerEvents="none" style={{ position: "absolute", bottom: 0, right: 0 }}>
      <View
        style={{
          position: "absolute",
          bottom: 0,
          right: 0,
          width: 0,
          height: 0,
          borderStyle: "solid",
          borderBottomWidth: 20,
          borderLeftWidth: 20,
          borderBottomColor: creaseShadow,
          borderLeftColor: "transparent",
        }}
      />
      <View
        style={{
          position: "absolute",
          bottom: 1,
          right: 1,
          width: 0,
          height: 0,
          borderStyle: "solid",
          borderBottomWidth: 15,
          borderLeftWidth: 15,
          borderBottomColor: foldBack,
          borderLeftColor: "transparent",
        }}
      />
    </View>
  );
}

export function CourseGridCard({
  course,
  accentColor,
  theme,
  onPress,
  onEdit,
  onDelete,
}: CourseGridCardProps) {
  const { getCourseWeeklyProgress } = useStudyHours();
  const { actualHours, goalHours, plannedHours, progress } =
    getCourseWeeklyProgress(course);
  const ink = theme.courseInk;
  const progressColor = getProgressFillColor(progress);
  const tapeColor = withPastelAlpha(shadePastelColor(accentColor, 0.06), 0.55);

  const handleLongPress = () => {
    Alert.alert(course.name, undefined, [
      { text: "Modifier", onPress: onEdit },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: onDelete,
      },
      { text: "Annuler", style: "cancel" },
    ]);
  };

  return (
    <View
      style={{
        width: "48%",
        paddingVertical: 4,
        paddingHorizontal: 2,
      }}
    >
      <IdleFloat seed={course.id}>
        <Pressable
          onPress={onPress}
          onLongPress={handleLongPress}
          style={({ pressed }) => [
            {
              backgroundColor: accentColor,
              borderRadius: 3,
              minHeight: 138,
              paddingBottom: 10,
              opacity: pressed ? 0.94 : 1,
              transform: [{ scale: pressed ? 0.98 : 1 }],
              ...Platform.select({
                ios: {
                  shadowColor: theme.postItShadow,
                  shadowOffset: { width: 2, height: 5 },
                  shadowOpacity: theme.postItShadowOpacity,
                  shadowRadius: 5,
                },
                android: { elevation: 5 },
              }),
            },
          ]}
        >
          <View
            style={{
              height: 11,
              backgroundColor: tapeColor,
              borderTopLeftRadius: 3,
              borderTopRightRadius: 3,
            }}
          />

          <View style={{ paddingHorizontal: 10, paddingTop: 8 }}>
            <Text
              style={{
                fontFamily: "PixelJersey",
                fontSize: 14,
                lineHeight: 18,
                color: ink,
                marginBottom: 8,
              }}
              numberOfLines={2}
            >
              {course.name}
            </Text>

            <Text
              style={{
                fontFamily: "PixelJersey",
                fontSize: 11,
                color: withPastelAlpha(ink, 0.75),
                marginBottom: 10,
              }}
            >
              {course.credits} crédit{course.credits > 1 ? "s" : ""}
            </Text>

            <View
              style={{
                height: 5,
                borderRadius: 2,
                backgroundColor: withPastelAlpha(ink, 0.12),
                overflow: "hidden",
                marginBottom: 6,
              }}
            >
              <View
                style={{
                  height: "100%",
                  width: `${progress * 100}%`,
                  backgroundColor: progressColor,
                  borderRadius: 2,
                }}
              />
            </View>

            <Text
              style={{
                fontFamily: "PixelJersey",
                fontSize: 10,
                color: withPastelAlpha(ink, 0.65),
              }}
              numberOfLines={2}
            >
              {formatStudyHours(actualHours)} / {formatStudyHours(goalHours)} étudiées
            </Text>
            <Text
              style={{
                fontFamily: "PixelJersey",
                fontSize: 9,
                color: withPastelAlpha(ink, 0.55),
                marginTop: 2,
              }}
              numberOfLines={1}
            >
              {formatStudyHours(plannedHours)} planifiées
            </Text>
          </View>

          <PostItFold paperColor={accentColor} />
        </Pressable>
      </IdleFloat>
    </View>
  );
}
