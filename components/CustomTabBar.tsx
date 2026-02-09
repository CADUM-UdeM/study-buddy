import { Ionicons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";

const ICON_MAP: Record<string, keyof typeof Ionicons.glyphMap> = {
  parametres: "settings",
  donnees: "stats-chart",
  index: "home",
  pomodoro: "alarm",
  profil: "person",
};

const ICON_MAP_OUTLINE: Record<string, keyof typeof Ionicons.glyphMap> = {
  parametres: "settings-outline",
  donnees: "stats-chart-outline",
  index: "home-outline",
  pomodoro: "alarm-outline",
  profil: "person-outline",
};

const ACCENT = "#AB8BFF";
const INACTIVE = "#7A7A9B";
const BG_COLOR = "#1A1730";
const PILL_BG = "rgba(171, 139, 255, 0.15)";

const SPRING_CONFIG = {
  damping: 15,
  stiffness: 150,
  mass: 0.8,
};

function TabItem({
  route,
  isFocused,
  onPress,
  onLongPress,
}: {
  route: { name: string; key: string };
  isFocused: boolean;
  onPress: () => void;
  onLongPress: () => void;
}) {
  const scale = useSharedValue(1);
  const colorProgress = useSharedValue(isFocused ? 1 : 0);
  const pillOpacity = useSharedValue(isFocused ? 1 : 0);
  const pillScale = useSharedValue(isFocused ? 1 : 0.6);
  const translateY = useSharedValue(isFocused ? -2 : 0);

  useEffect(() => {
    colorProgress.value = withTiming(isFocused ? 1 : 0, { duration: 250 });
    pillOpacity.value = withTiming(isFocused ? 1 : 0, { duration: 200 });
    pillScale.value = withSpring(isFocused ? 1 : 0.6, SPRING_CONFIG);
    translateY.value = withSpring(isFocused ? -2 : 0, SPRING_CONFIG);
  }, [isFocused]);

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
  }));

  const animatedPillStyle = useAnimatedStyle(() => ({
    opacity: pillOpacity.value,
    transform: [{ scaleX: pillScale.value }],
  }));

  const iconName = isFocused
    ? ICON_MAP[route.name]
    : ICON_MAP_OUTLINE[route.name];
  const iconColor = isFocused ? ACCENT : INACTIVE;

  const handlePressIn = () => {
    scale.value = withSpring(0.85, { damping: 12, stiffness: 200 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, SPRING_CONFIG);
  };

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      style={styles.tabItem}
    >
      <View style={styles.tabItemInner}>
        <Animated.View style={[styles.pill, animatedPillStyle]} />
        <Animated.View style={animatedIconStyle}>
          <Ionicons
            name={iconName || "ellipse"}
            size={24}
            color={iconColor}
          />
        </Animated.View>
        {isFocused && (
          <Animated.View style={styles.dot} />
        )}
      </View>
    </Pressable>
  );
}

export default function CustomTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  const visibleRoutes = state.routes.filter((route) => {
    const options = descriptors[route.key]?.options;
    // Filter out screens where href is null (hidden tabs)
    if (options && (options as any).href === null) return false;
    return true;
  });

  return (
    <View
      style={[
        styles.container,
        { paddingBottom: Math.max(insets.bottom, 8) },
      ]}
    >
      <View style={styles.bar}>
        {visibleRoutes.map((route) => {
          const realIndex = state.routes.findIndex(
            (r) => r.key === route.key
          );
          const isFocused = state.index === realIndex;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: "tabLongPress",
              target: route.key,
            });
          };

          return (
            <TabItem
              key={route.key}
              route={route}
              isFocused={isFocused}
              onPress={onPress}
              onLongPress={onLongPress}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 4,
    backgroundColor: "transparent",
  },
  bar: {
    flexDirection: "row",
    backgroundColor: BG_COLOR,
    borderRadius: 28,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "space-around",
    width: "100%",
    maxWidth: 380,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 1,
    borderColor: "rgba(171, 139, 255, 0.08)",
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
  },
  tabItemInner: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    width: 48,
    height: 40,
  },
  pill: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: PILL_BG,
    borderRadius: 16,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: ACCENT,
    marginTop: 3,
  },
});
