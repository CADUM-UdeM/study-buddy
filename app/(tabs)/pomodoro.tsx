import { useCourses } from "@/app/context/CoursesContext";
import { usePomodoroStudy } from "@/app/context/PomodoroStudyContext";
import { useSessions } from "@/app/context/SessionsContext";
import { useSettings } from "@/app/context/SettingsContext";
import { useStudyHours } from "@/app/hooks/useStudyHours";
import { darkTheme, lightTheme } from "@/components/colors";
import { formatStudyHours } from "@/components/courses/courseWeeklyHours";
import { PomodoroActions } from "@/components/pomodoro/PomodoroActions";
import { PomodoroCompleteModal } from "@/components/pomodoro/PomodoroCompleteModal";
import { PomodoroCoursePicker } from "@/components/pomodoro/PomodoroCoursePicker";
import { TimerClock } from "@/components/pomodoro/TimerClock";
import { TimerInfoRow } from "@/components/pomodoro/TimerInfoRow";
import {
  DEFAULT_BREAK_TIME,
  DEFAULT_REPETITION,
  DEFAULT_STUDY_TIME,
  TimerParams,
} from "@/components/pomodoro/TimerParams";
import { getPastelChipStyle, PastelCard } from "@/components/home/PastelCard";
import { TopStatusBarGuard } from "@/components/TopStatusBarGuard";
import { Audio } from "expo-av";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, AppState, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import "../global.css";
import {manageNotif, stopNotif} from "@/components/pomodoro/TimerNotification";

function addZero(num: number): string {
  return String(num).padStart(2, "0");
}

export default function Pomodoro() {
  const { settings } = useSettings();
  const { activeSession } = useSessions();
  const { getCoursesBySession } = useCourses();
  const { addRecord } = usePomodoroStudy();
  const studyHours = useStudyHours();
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;
  const theme = settings.isDarkMode ? darkTheme : lightTheme;

  const [selectedCourseId, setSelectedCourseId] = useState<string | undefined>();
  const [isRunning, setIsRunning] = useState(false);
  const [hasTimerBeenStarted, setHasTimerBeenStarted] = useState(false);
  const [inBreakTime, setInBreakTime] = useState(false);
  const [initHours, setInitHours] = useState(0);
  const [hours, setHours] = useState(addZero(initHours));
  const [initMin, setInitMin] = useState(30);
  const [min, setMin] = useState(addZero(initMin));
  const [initSec, setInitSec] = useState(0);
  const [sec, setSec] = useState(addZero(initSec));
  const [clickParam, setClickParam] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [numCycle, setNumCycle] = useState(DEFAULT_REPETITION);
  const [remainingCycle, setRemainingCycle] = useState(DEFAULT_REPETITION);
  const [breakDuration, setBreakDuration] = useState(DEFAULT_BREAK_TIME);
  const [pomodoroDuration, setPomodoroDuration] = useState(DEFAULT_STUDY_TIME);
  const [timeLeft, setTimeLeft] = useState(
    Number(hours) * 3600 + Number(min) * 60 + Number(sec),
  );
  const [phaseTotalSeconds, setPhaseTotalSeconds] = useState(
    Number(DEFAULT_STUDY_TIME) * 60,
  );
  const [wasAudioTransition, setWasAudioTransition] = useState(false);
  const [wasAudioEnd, setWasAudioEnd] = useState(false);
  const endTimeRef = useRef<number | null>(null);
  const [wasUpdated, setWasUpdated] = useState(false);
  const [hasClickedBreak, setHasClickedBreak] = useState(false);
  const [timeOutsideApps, setTimeOutsideApps] = useState(0);
  const focusSecondsRef = useRef(0);
  const sessionStartedAtRef = useRef<string | null>(null);
  const hasRecordedCompletionRef = useRef(false);

  const availableCourses = useMemo(() => {
    if (activeSession) {
      return [
        ...getCoursesBySession(activeSession.id),
        ...getCoursesBySession(null),
      ];
    }
    return getCoursesBySession(null);
  }, [activeSession, getCoursesBySession]);

  const selectedCourse = availableCourses.find(
    (course) => course.id === selectedCourseId,
  );

  const selectedCourseProgress = selectedCourse
    ? studyHours.getCourseWeeklyProgress(selectedCourse)
    : null;

  const guardOpacity = scrollY.interpolate({
    inputRange: [0, 4, 16],
    outputRange: [0, 0.4, 1],
    extrapolate: "clamp",
  });

  const canStart = Boolean(selectedCourseId) && timeLeft > 0;

  const recordStudySession = (completed: boolean) => {
    if (!selectedCourseId || !sessionStartedAtRef.current) return;

    let focusSeconds = focusSecondsRef.current;
    if (!inBreakTime && hasTimerBeenStarted && timeLeft < phaseTotalSeconds) {
      focusSeconds += phaseTotalSeconds - timeLeft;
    }

    const studyMinutes = Math.max(0, Math.round(focusSeconds / 60));
    if (studyMinutes <= 0) return;

    addRecord({
      courseId: selectedCourseId,
      studyMinutes,
      startedAt: sessionStartedAtRef.current,
      endedAt: new Date().toISOString(),
      completed,
    });
  };

  const resetTimerState = () => {
    setInBreakTime(false);
    setMin(addZero(initMin));
    setHours(addZero(initHours));
    setSec(addZero(initSec));
    setRemainingCycle(numCycle);
    focusSecondsRef.current = 0;
    sessionStartedAtRef.current = null;
    endTimeRef.current = null;
  };

  const startButton = () => {
    if (!canStart) return;
    setPhaseTotalSeconds(timeLeft);
    setHasTimerBeenStarted(true);
    setIsRunning(true);
    sessionStartedAtRef.current = new Date().toISOString();
    focusSecondsRef.current = 0;
    hasRecordedCompletionRef.current = false;
  };

  const pauseButton = () => {
    setIsRunning(false);
    setHasClickedBreak(true);
  };

  const stopButton = () => {
    setIsRunning(false);
    setHasClickedBreak(false);
    if (hasTimerBeenStarted) {
      recordStudySession(false);
      setHasTimerBeenStarted(false);
    }
    resetTimerState();
  };

  const handleDismissComplete = () => {
    setIsFinished(false);
    setWasAudioEnd(false);
    setWasAudioTransition(false);
    stopButton();
  };

  useEffect(() => {
    if (!isRunning) {
      const next = Number(hours) * 3600 + Number(min) * 60 + Number(sec);
      setTimeLeft(next);
      setPhaseTotalSeconds(next);
    }
  }, [hours, isRunning, min, sec]);

  useEffect(() => {
    if (timeLeft > 0 && isRunning) {
      setTimeOutsideApps(0);
      if (!endTimeRef.current || wasUpdated) {
        endTimeRef.current = Date.now() + timeLeft * 1000;
      }
      setWasUpdated(false);
      const timer = setInterval(() => {
        setTimeLeft((timeBefore) => timeBefore - 1);
      }, 1000);
      return () => {
        clearInterval(timer);
        if (!isRunning && !hasClickedBreak) endTimeRef.current = null;
      };
    }

    if (timeLeft === 0 && remainingCycle > 0) {
      endTimeRef.current = null;
      if (!inBreakTime) {
        focusSecondsRef.current += phaseTotalSeconds;
        setRemainingCycle(remainingCycle - 1);
        setWasAudioTransition(false);
      }
      setHasTimerBeenStarted(false);

      let next = inBreakTime
        ? Number(pomodoroDuration) * 60 - timeOutsideApps
        : Number(breakDuration) * 60 - timeOutsideApps;

      if (next <= 0) {
        setTimeOutsideApps(Math.abs(next));
        next = 0;
      } else {
        setTimeOutsideApps(0);
      }
      setTimeLeft(next);
      setPhaseTotalSeconds(next);
      setInBreakTime(!inBreakTime);
      return;
    }

    setIsRunning(false);
    if (remainingCycle === 0 && timeLeft === 0 && inBreakTime) {
      setHasTimerBeenStarted(false);
      setIsFinished(true);
      setTimeOutsideApps(0);
      setInBreakTime(false);
      endTimeRef.current = null;
    }
  }, [timeLeft, isRunning, inBreakTime]);

    useEffect(() => {
        if (timeLeft > 0 && isRunning) {
            manageNotif(timeLeft, remainingCycle, inBreakTime, isFinished,
                Number(pomodoroDuration) * 60, Number(breakDuration) * 60);
        } else stopNotif().catch(err => console.log(err));
    }, [isRunning]);

  useEffect(() => {
    const appState = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active" && isRunning && endTimeRef.current) {
        const now = Date.now();
        const secLeft = Math.round((endTimeRef.current - now) / 1000);
        setTimeOutsideApps(0);

        if (secLeft <= 0) {
          setTimeLeft(0);
          setTimeOutsideApps(Math.abs(secLeft));
        } else {
          setTimeLeft(secLeft);
        }
      }
    });
    return () => appState.remove();
  }, [isRunning]);

  useEffect(() => {
    const totalSeconds = timeLeft;
    const nextHours = Math.floor(totalSeconds / 3600);
    const nextMinutes = Math.floor((totalSeconds % 3600) / 60);
    const nextSeconds = totalSeconds % 60;
    setMin(addZero(nextMinutes));
    setHours(addZero(nextHours));
    setSec(addZero(Math.floor(nextSeconds)));
  }, [timeLeft]);

  useEffect(() => {
    setRemainingCycle(numCycle);
  }, [numCycle]);

  useEffect(() => {
    if (!isFinished || hasRecordedCompletionRef.current) return;
    recordStudySession(true);
    hasRecordedCompletionRef.current = true;
  }, [isFinished]);

  const updateTime = (minutes: number) => {
    setWasUpdated(true);
    const newHours = addZero(Math.floor(minutes / 60));
    setHours(newHours);
    setInitHours(Number(newHours));

    const newSec = (minutes * 60) % 60;
    setSec(addZero(Math.floor(newSec)));
    setInitSec(Math.floor(newSec));

    const newMin = addZero(Math.floor(minutes % 60));
    setMin(newMin);
    setInitMin(Number(newMin));
  };

  useEffect(() => {
    if (!wasAudioEnd && isFinished) {
      Audio.Sound.createAsync(require("../../assets/endAudio.m4a"), {
        shouldPlay: true,
      }).catch(() => console.log("erreur dans chargement de l'audio"));
      setWasAudioEnd(true);
    }
  }, [wasAudioEnd, isFinished]);

  useEffect(() => {
    if (isFinished) return;

    if (!wasAudioTransition && inBreakTime) {
      Audio.Sound.createAsync(require("../../assets/switchAudio.mp3"), {
        shouldPlay: true,
      }).catch(() => console.log("erreur dans chargement de l'audio"));
      setWasAudioTransition(true);
    } else if (!inBreakTime && wasAudioTransition) {
      setWasAudioTransition(false);
      Audio.Sound.createAsync(require("../../assets/switchAudio.mp3"), {
        shouldPlay: true,
      }).catch(() => console.log("erreur dans chargement de l'audio"));
    }
  }, [inBreakTime, isFinished, wasAudioTransition]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <Animated.ScrollView
        className="flex-1 px-5"
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true },
        )}
        scrollIndicatorInsets={{ top: insets.top + 8 }}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 24,
        }}
      >
        <Text
          className="font-pixel text-2xl mb-4"
          style={{ color: theme.defaultTextColor }}
        >
          Pomodoro
        </Text>

        <PomodoroCoursePicker
          theme={theme}
          courses={availableCourses}
          selectedCourseId={selectedCourseId}
          onSelect={setSelectedCourseId}
          disabled={isRunning}
          animated
          animationDelay={0}
        />

        {selectedCourseProgress && (
          <PastelCard
            theme={theme}
            animated
            animationDelay={40}
            className="mb-3"
            contentStyle={{ padding: 14 }}
          >
            <Text
              className="font-pixel text-xs mb-1"
              style={{ color: theme.gray }}
            >
              Objectif hebdomadaire · {selectedCourse?.name}
            </Text>
            <Text
              className="font-pixel text-base"
              style={{ color: theme.activeTextColor }}
            >
              {formatStudyHours(selectedCourseProgress.actualHours)} /{" "}
              {formatStudyHours(selectedCourseProgress.goalHours)} étudiées
            </Text>
            <Text
              className="font-pixel text-xs mt-1"
              style={{ color: theme.gray }}
            >
              {formatStudyHours(selectedCourseProgress.plannedHours)} planifiées
              cette semaine
            </Text>
          </PastelCard>
        )}

        <TimerClock
          theme={theme}
          inBreakTime={inBreakTime}
          phaseTotalSeconds={phaseTotalSeconds}
          timeLeft={timeLeft}
          hours={hours}
          min={min}
          sec={sec}
          isRunning={isRunning}
          numCycle={numCycle}
          remainingCycle={remainingCycle}
          animated
          animationDelay={80}
        />

        <TimerParams
          theme={theme}
          clickParam={clickParam}
          setClickParam={setClickParam}
          setNumCycle={setNumCycle}
          setPomodoroDuration={setPomodoroDuration}
          setBreakDuration={setBreakDuration}
          numCycle={numCycle}
          pomodoroDuration={pomodoroDuration}
          breakDuration={breakDuration}
          updateTime={updateTime}
        />

        <TimerInfoRow
          theme={theme}
          pomodoroDuration={pomodoroDuration}
          breakDuration={breakDuration}
          numCycle={numCycle}
          animated
          animationDelay={120}
        />

        {!selectedCourseId && (
          <View
            className="rounded-2xl px-4 py-3 mb-3"
            style={getPastelChipStyle(theme)}
          >
            <Text className="font-pixel text-sm" style={{ color: theme.gray }}>
              Sélectionnez un cours avant de démarrer le pomodoro.
            </Text>
          </View>
        )}

        <PomodoroActions
          theme={theme}
          isRunning={isRunning}
          timeLeft={timeLeft}
          onStartPause={isRunning ? pauseButton : startButton}
          onStop={stopButton}
          setClickParam={setClickParam}
          startDisabled={!canStart}
          animated
          animationDelay={160}
        />
      </Animated.ScrollView>

      <TopStatusBarGuard backgroundColor={theme.background} opacity={guardOpacity} />

      <PomodoroCompleteModal
        theme={theme}
        visible={isFinished}
        onDismiss={handleDismissComplete}
      />
    </View>
  );
}
