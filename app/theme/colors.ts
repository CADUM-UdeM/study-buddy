/**
 * Global color scheme — single source of truth for the app.
 * Use these in StyleSheet, inline styles, and Tailwind (via tailwind.config.js).
 */

export const colors = {
  // Raw palette (as provided)
  darkAmethyst: "#10002b",
  darkAmethyst2: "#240046",
  indigoInk: "#3c096c",
  indigoVelvet: "#5a189a",
  royalViolet: "#7b2cbf",
  lavenderPurple: "#9d4edd",
  mauveMagic: "#c77dff",
  mauve: "#e0aaff",

  // Semantic names for consistent usage
  background: "#10002b",
  surface: "#240046",
  surfaceElevated: "#3c096c",
  card: "#5a189a",
  primary: "#7b2cbf",
  accent: "#9d4edd",
  accentLight: "#c77dff",
  textOnDark: "#e0aaff",
  textOnDarkMuted: "#c77dff",
  white: "#ffffff",
  black: "#000000",

  // UI specifics
  tabBarBackground: "#240046",
  tabBarActive: "#9d4edd",
  tabBarInactive: "#e0aaff",
  modalOverlay: "rgba(0, 0, 0, 0.6)",
  modalSurface: "#3c096c",
  buttonPrimary: "#7b2cbf",
  buttonSecondary: "#5a189a",
  border: "#5a189a",
  borderLight: "#7b2cbf",
  timerAccent: "#c77dff",
  success: "#4BAE4F",
  error: "#f30000",
  errorSoft: "#FF4141",
  warning: "#ff9800",
  // Light surfaces (modals, inputs, lists on light bg)
  surfaceLight: "#f5f5f5",
  surfaceLighter: "#e0e0e0",
  surfaceLightest: "#f0f0f0",
  borderMuted: "#ddd",
  textDark: "#333",
  textMuted: "#666",
  textMutedLight: "#999",
  textPlaceholder: "#757575",
  iconOnLight: "#333",
  iconOnDark: "#e0aaff",
} as const;

export type ThemeColors = typeof colors;
