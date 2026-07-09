import { useCourses } from "@/app/context/CoursesContext";
import { PlannedStudySession } from "@/app/context/PlannedStudyContext";
import { lightTheme } from "@/components/colors";
import { getPastelSurfaceStyle } from "@/components/home/pastelStyles";
import { CoursePicker } from "@/components/calendar/CoursePicker";
import {
  applyTimeString,
  snapToQuarterHour,
  TimeInput,
} from "@/components/calendar/TimeInput";
import { addMinutes, format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import React, { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

interface StudySessionModalProps {
  visible: boolean;
  session: PlannedStudySession | null;
  onClose: () => void;
  onSave: (data: {
    courseId?: string;
    description: string;
    startDateTime: string;
    endDateTime: string;
  }) => void;
  onDelete?: () => void;
  theme: typeof lightTheme;
}

export function StudySessionModal({
  visible,
  session,
  onClose,
  onSave,
  onDelete,
  theme,
}: StudySessionModalProps) {
  const { courses } = useCourses();
  const [courseId, setCourseId] = useState<string | undefined>();
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [sessionDay, setSessionDay] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  const backdropOpacity = useSharedValue(0);
  const cardScale = useSharedValue(0.92);
  const cardOpacity = useSharedValue(0);
  const cardTranslateY = useSharedValue(24);

  useEffect(() => {
    if (session) {
      const start = parseISO(session.startDateTime);
      const end = parseISO(session.endDateTime);
      setCourseId(session.courseId);
      setDescription(session.description ?? "");
      setStartTime(format(start, "HH:mm"));
      setEndTime(format(end, "HH:mm"));
      setSessionDay(start);
    } else {
      setCourseId(undefined);
      setDescription("");
      setStartTime("09:00");
      setEndTime("10:00");
    }
  }, [session, visible]);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      backdropOpacity.value = withTiming(1, { duration: 260 });
      cardOpacity.value = withTiming(1, { duration: 220 });
      cardScale.value = withSpring(1, {
        damping: 20,
        stiffness: 280,
        mass: 0.85,
      });
      cardTranslateY.value = withSpring(0, {
        damping: 22,
        stiffness: 300,
        mass: 0.85,
      });
      return;
    }

    backdropOpacity.value = withTiming(0, { duration: 200 });
    cardOpacity.value = withTiming(0, { duration: 180 });
    cardScale.value = withTiming(0.94, { duration: 180 });
    cardTranslateY.value = withTiming(16, { duration: 180 });
    const timer = setTimeout(() => setMounted(false), 200);
    return () => clearTimeout(timer);
  }, [visible, backdropOpacity, cardOpacity, cardScale, cardTranslateY]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [
      { scale: cardScale.value },
      { translateY: cardTranslateY.value },
    ],
  }));

  const cardStyle = getPastelSurfaceStyle(theme, { borderRadius: 20 });

  const handleStartComplete = (value: string) => {
    const completed = snapToQuarterHour(value, startTime);
    setStartTime(completed);

    const startDate = applyTimeString(sessionDay, completed);
    if (!startDate) return;

    const endDate = applyTimeString(sessionDay, endTime);
    if (!endDate || endDate <= startDate) {
      setEndTime(format(addMinutes(startDate, 60), "HH:mm"));
    }
  };

  const handleEndComplete = (value: string) => {
    const completed = snapToQuarterHour(value, endTime);
    const startDate = applyTimeString(sessionDay, startTime);
    const endDate = applyTimeString(sessionDay, completed);

    if (startDate && endDate && endDate <= startDate) {
      setEndTime(format(addMinutes(startDate, 15), "HH:mm"));
      return;
    }

    setEndTime(completed);
  };

  const handleSave = () => {
    const normalizedStart = snapToQuarterHour(startTime, "09:00");
    const normalizedEnd = snapToQuarterHour(endTime, "10:00");
    const startDate = applyTimeString(sessionDay, normalizedStart);
    let endDate = applyTimeString(sessionDay, normalizedEnd);

    if (!startDate || !endDate) return;

    if (endDate <= startDate) {
      endDate = addMinutes(startDate, 60);
    }

    onSave({
      courseId,
      description: description.trim(),
      startDateTime: startDate.toISOString(),
      endDateTime: endDate.toISOString(),
    });
  };

  if (!session || !mounted) return null;

  return (
    <Modal visible={mounted} transparent animationType="none" onRequestClose={onClose}>
      <View className="flex-1 justify-center px-5">
        <Animated.View
          pointerEvents="none"
          className="absolute inset-0"
          style={[{ backgroundColor: "rgba(0,0,0,0.5)" }, backdropStyle]}
        />
        <Pressable className="absolute inset-0" onPress={onClose} />

        <Animated.View
          className="rounded-2xl p-5 max-h-[90%]"
          style={[cardStyle, cardAnimatedStyle]}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View className="gap-4">
              <Text
                className="font-pixel text-xl"
                style={{ color: theme.defaultTextColor }}
              >
                {onDelete ? "Modifier la séance" : "Nouvelle séance"}
              </Text>

              <View
                className="rounded-xl px-4 py-3"
                style={{ backgroundColor: theme.contentWrapperBgColor }}
              >
                <Text
                  className="font-pixel text-sm capitalize"
                  style={{ color: theme.defaultTextColor }}
                >
                  {format(sessionDay, "EEEE d MMMM", { locale: fr })}
                </Text>
              </View>

              <View className="flex-row gap-3">
                <View className="flex-1">
                  <TimeInput
                    label="Début"
                    value={startTime}
                    onChange={setStartTime}
                    onComplete={handleStartComplete}
                    theme={theme}
                  />
                </View>
                <View className="flex-1">
                  <TimeInput
                    label="Fin"
                    value={endTime}
                    onChange={setEndTime}
                    onComplete={handleEndComplete}
                    theme={theme}
                  />
                </View>
              </View>

              <CoursePicker
                courses={courses}
                selectedCourseId={courseId}
                onSelect={setCourseId}
                theme={theme}
              />

              <View className="gap-2">
                <Text className="font-pixel text-sm" style={{ color: theme.gray }}>
                  Description (optionnel)
                </Text>
                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Chapitre, objectifs, rappels..."
                  placeholderTextColor={theme.gray}
                  multiline
                  numberOfLines={3}
                  className="rounded-xl px-4 py-3 font-pixel"
                  style={{
                    backgroundColor: theme.contentWrapperBgColor,
                    color: theme.defaultTextColor,
                    fontFamily: "PixelJersey",
                    minHeight: 80,
                    textAlignVertical: "top",
                  }}
                />
              </View>

              <View className="flex-row gap-3 mt-1">
                {onDelete && (
                  <Pressable
                    onPress={onDelete}
                    className="flex-1 py-3 rounded-xl items-center"
                    style={{
                      backgroundColor: theme.contentWrapperBgColor,
                      borderWidth: 1,
                      borderColor: theme.stopBorderColor,
                    }}
                  >
                    <Text className="font-pixel" style={{ color: theme.stopColor }}>
                      Supprimer
                    </Text>
                  </Pressable>
                )}
                <Pressable
                  onPress={onClose}
                  className="flex-1 py-3 rounded-xl items-center"
                  style={{ backgroundColor: theme.contentWrapperBgColor }}
                >
                  <Text className="font-pixel" style={{ color: theme.defaultTextColor }}>
                    Annuler
                  </Text>
                </Pressable>
                <Pressable
                  onPress={handleSave}
                  className="flex-1 py-3 rounded-xl items-center"
                  style={{ backgroundColor: theme.activeColorIcon }}
                >
                  <Text className="font-pixel" style={{ color: theme.white }}>
                    Enregistrer
                  </Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}
