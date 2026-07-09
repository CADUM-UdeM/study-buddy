import { lightTheme } from "@/components/colors";
import { getPastelChipStyle, getPastelSurfaceStyle } from "@/components/home/pastelStyles";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export const DEFAULT_REPETITION = 2;
export const DEFAULT_STUDY_TIME = "30";
export const DEFAULT_BREAK_TIME = "10";

interface TimerParamsProps {
  theme: typeof lightTheme;
  clickParam: boolean;
  setClickParam: React.Dispatch<React.SetStateAction<boolean>>;
  setNumCycle: React.Dispatch<React.SetStateAction<number>>;
  setPomodoroDuration: React.Dispatch<React.SetStateAction<string>>;
  setBreakDuration: React.Dispatch<React.SetStateAction<string>>;
  numCycle: number;
  pomodoroDuration: string;
  breakDuration: string;
  updateTime: (minutes: number) => void;
}

function cleanText(cleaned: string) {
  const pos = cleaned.indexOf(".");
  if (pos > -1) {
    cleaned = cleaned.replace(/[^0-9]/g, "");
    cleaned = cleaned.slice(0, pos) + "." + cleaned.slice(pos);
  }
  if (cleaned.length < 1) cleaned = "0";
  return cleaned;
}

function DurationPicker({
  theme,
  label,
  value,
  options,
  onChange,
}: {
  theme: typeof lightTheme;
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);

  const handleText = (text: string) => {
    let cleaned = text.replace(/[^0-9.]/g, "").replace(/(\..*^)\./g, "");
    cleaned = cleanText(cleaned);
    onChange(cleaned);
  };

  return (
    <View
      className="flex-row items-center justify-between rounded-2xl py-3 px-4 mb-2"
      style={getPastelChipStyle(theme)}
    >
      <Text className="font-pixel text-base" style={{ color: theme.defaultTextColor }}>
        {label}
      </Text>
      <View>
        <TouchableOpacity
          className="flex-row items-center gap-1 rounded-xl px-3 py-2"
          style={{ backgroundColor: theme.contentWrapperBgColor }}
          onPress={() => setOpen(!open)}
        >
          <TextInput
            keyboardType="numeric"
            maxLength={4}
            className="min-w-[36px] font-pixel"
            style={{
              padding: 0,
              height: 24,
              fontSize: 18,
              color: theme.defaultTextColor,
            }}
            value={value}
            onChangeText={handleText}
          />
          <Text className="font-pixel text-base" style={{ color: theme.defaultTextColor }}>
            min
          </Text>
          <Ionicons name="chevron-down" size={18} color={theme.activeColorIcon} />
        </TouchableOpacity>

        {open && (
          <>
            <Pressable
              onPress={() => setOpen(false)}
              style={{
                position: "absolute",
                top: -1000,
                bottom: -1000,
                left: -1000,
                right: -1000,
                zIndex: 1,
              }}
            />
            <View
              style={[
                getPastelSurfaceStyle(theme, { borderRadius: 16, padding: 6 }),
                {
                  position: "absolute",
                  top: 44,
                  right: -2,
                  width: 120,
                  zIndex: 2,
                },
              ]}
            >
              {options.map((m) => (
                <TouchableOpacity
                  key={m}
                  onPress={() => {
                    onChange(m);
                    setOpen(false);
                  }}
                  className="rounded-xl py-2 items-center mb-1"
                  style={{
                    backgroundColor:
                      value === m ? theme.buttonColor : theme.contentWrapperBgColor,
                  }}
                >
                  <Text
                    className="font-pixel"
                    style={{
                      color:
                        value === m ? theme.anotherTextColor : theme.defaultTextColor,
                    }}
                  >
                    {m} min
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </View>
    </View>
  );
}

export function TimerParams({
  theme,
  clickParam,
  setClickParam,
  setNumCycle,
  setPomodoroDuration,
  setBreakDuration,
  numCycle,
  pomodoroDuration,
  breakDuration,
  updateTime,
}: TimerParamsProps) {
  const [defaultRepetition, setDefaultRepetition] = useState(DEFAULT_REPETITION);
  const [defaultStudyTime, setDefaultStudyTime] = useState(DEFAULT_STUDY_TIME);
  const [defaultBreakTime, setDefaultBreakTime] = useState(DEFAULT_BREAK_TIME);

  useEffect(() => {
    if (clickParam) {
      setDefaultRepetition(numCycle);
      setDefaultStudyTime(pomodoroDuration);
      setDefaultBreakTime(breakDuration);
    }
  }, [breakDuration, clickParam, numCycle, pomodoroDuration]);

  const resetDraft = () => {
    setDefaultRepetition(numCycle);
    setDefaultStudyTime(pomodoroDuration);
    setDefaultBreakTime(breakDuration);
  };

  const applyDraft = () => {
    setClickParam(false);
    setNumCycle(defaultRepetition);
    setPomodoroDuration(defaultStudyTime);
    setBreakDuration(defaultBreakTime);
    updateTime(Number(defaultStudyTime));
  };

  return (
    <Modal transparent visible={clickParam} animationType="fade">
      <Pressable
        className="flex-1 justify-center items-center"
        style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
        onPress={() => {
          resetDraft();
          setClickParam(false);
        }}
      >
        <Pressable onPress={(e) => e.stopPropagation()}>
          <View
            style={getPastelSurfaceStyle(theme, {
              width: "88%",
              maxHeight: "78%",
              padding: 20,
            })}
          >
            <Text
              className="font-pixel text-xl text-center mb-4"
              style={{ color: theme.defaultTextColor }}
            >
              Réglez votre pomodoro
            </Text>

            <DurationPicker
              theme={theme}
              label="Temps d'étude"
              value={defaultStudyTime}
              options={["10", "20", "30", "40", "50", "60"]}
              onChange={setDefaultStudyTime}
            />

            <DurationPicker
              theme={theme}
              label="Temps de pause"
              value={defaultBreakTime}
              options={["5", "10", "15", "20", "25", "30"]}
              onChange={setDefaultBreakTime}
            />

            <View className="mb-4 mt-2">
              <Text
                className="font-pixel text-base mb-2"
                style={{ color: theme.defaultTextColor }}
              >
                Répétitions
              </Text>
              <View className="flex-row gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Pressable
                    key={n}
                    onPress={() => setDefaultRepetition(n)}
                    className="flex-1 py-2.5 rounded-xl items-center"
                    style={{
                      backgroundColor:
                        defaultRepetition === n
                          ? theme.buttonColor
                          : theme.contentWrapperBgColor,
                      borderWidth: 1,
                      borderColor: theme.cardBorderSoft,
                    }}
                  >
                    <Text
                      className="font-pixel"
                      style={{
                        color:
                          defaultRepetition === n
                            ? theme.anotherTextColor
                            : theme.defaultTextColor,
                      }}
                    >
                      {n}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View className="flex-row justify-center gap-3 mt-4">
              <Pressable
                onPress={applyDraft}
                className="rounded-2xl py-3 px-8"
                style={{ backgroundColor: theme.buttonColor }}
              >
                <Text className="font-pixel text-lg" style={{ color: theme.defaultTextColor }}>
                  OK
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  resetDraft();
                  setClickParam(false);
                }}
                className="rounded-2xl py-3 px-8"
                style={getPastelChipStyle(theme)}
              >
                <Text className="font-pixel text-lg" style={{ color: theme.defaultTextColor }}>
                  Annuler
                </Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
