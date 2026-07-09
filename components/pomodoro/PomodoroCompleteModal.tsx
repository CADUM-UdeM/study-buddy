import { lightTheme } from "@/components/colors";
import { getPastelSurfaceStyle } from "@/components/home/pastelStyles";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Modal, Pressable, Text, View } from "react-native";

interface PomodoroCompleteModalProps {
  theme: typeof lightTheme;
  visible: boolean;
  onDismiss: () => void;
}

export function PomodoroCompleteModal({
  theme,
  visible,
  onDismiss,
}: PomodoroCompleteModalProps) {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View
        className="flex-1 justify-center items-center"
        style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
      >
        <View
          style={getPastelSurfaceStyle(theme, {
            width: "85%",
            padding: 24,
            alignItems: "center",
          })}
        >
          <Ionicons
            name="ribbon-outline"
            size={44}
            color={theme.activeColorIcon}
            style={{ marginBottom: 12 }}
          />
          <Text
            className="text-center font-pixel text-xl mb-5"
            style={{ color: theme.defaultTextColor }}
          >
            Bravo pour avoir fini la session de pomodoro !
          </Text>
          <Pressable
            onPress={onDismiss}
            className="rounded-2xl py-3 px-10"
            style={{ backgroundColor: theme.buttonColor }}
          >
            <Text
              className="font-pixel text-xl"
              style={{ color: theme.defaultTextColor }}
            >
              OK
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
