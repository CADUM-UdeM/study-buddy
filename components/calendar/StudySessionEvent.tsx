import { lightTheme } from "@/components/colors";
import { getSessionEventTitle } from "@/components/calendar/calendarTheme";
import { PlannedStudySession } from "@/app/context/PlannedStudyContext";
import {
  shadePastelColor,
} from "@/components/courses/courseColors";
import { PackedEvent, SizeAnimation } from "@howljs/calendar-kit";
import { format, parseISO } from "date-fns";
import React from "react";
import { Text } from "react-native";
import { useIdleFloatStyle } from "@/components/home/IdleFloat";
import Animated, { useAnimatedStyle } from "react-native-reanimated";

interface StudySessionEventProps {
  event: PackedEvent;
  size: SizeAnimation;
  session?: PlannedStudySession;
  courseName?: string;
  courseColor: string;
  showTimes: boolean;
  theme: typeof lightTheme;
}

export function StudySessionEvent({
  event,
  size,
  session,
  courseName,
  courseColor,
  showTimes,
  theme,
}: StudySessionEventProps) {
  const ink = theme.courseInk;
  const sizeStyle = useAnimatedStyle(() => ({
    height: size.height.value,
    width: size.width.value,
  }));
  const idleStyle = useIdleFloatStyle(event.id);
  const borderColor = shadePastelColor(courseColor, 0.28);

  const label = getSessionEventTitle(
    session ?? { courseId: event.courseId, description: event.description },
    courseName,
  );

  const startDateTime = event.start.dateTime ?? session?.startDateTime;
  const endDateTime = event.end.dateTime ?? session?.endDateTime;
  const timeLabel =
    startDateTime && endDateTime
      ? `${format(parseISO(startDateTime), "HH:mm")} – ${format(parseISO(endDateTime), "HH:mm")}`
      : null;

  const showTimeRow = showTimes && !!timeLabel;

  return (
    <Animated.View
      style={[
        sizeStyle,
        idleStyle,
        {
          backgroundColor: courseColor,
          borderRadius: 10,
          paddingHorizontal: 7,
          paddingVertical: 5,
          borderLeftWidth: 4,
          borderLeftColor: borderColor,
          overflow: "hidden",
          justifyContent: "center",
        },
      ]}
    >
      <Text
        style={{
          color: ink,
          fontFamily: "PixelJersey",
          fontSize: 12,
          fontWeight: "600",
        }}
        numberOfLines={showTimeRow ? 1 : 2}
      >
        {label}
      </Text>
      {showTimeRow && (
        <Text
          style={{
            color: ink,
            fontFamily: "PixelJersey",
            fontSize: 10,
            opacity: 0.72,
            marginTop: 2,
          }}
          numberOfLines={1}
        >
          {timeLabel}
        </Text>
      )}
    </Animated.View>
  );
}
