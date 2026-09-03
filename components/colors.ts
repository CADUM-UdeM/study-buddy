export const lightTheme = {
  background: "#FCF4FC",
  mainWrapperBgColor: "#ffffff",
  contentWrapperBgColor: "#f9ecfe",

  navBarBgColor: "#FCF4FC",
  borderColor: "#F1E1F9",
  //FEF9FC
  // Icons de navigation
  inactiveColorIcon: "#F9AFDB",
  activeColorIcon: "#A45EFB",

  defaultTextColor: "#9372BA",
  activeTextColor: "#f78ae1",

  buttonColor: "#F0D3FF",

  anotherTextColor: "#7c3aed",
  anotherBorderColor: "#7c3aed",

  // Calendrier
  calendarZero: "#F3F0F9",
  calendarLevelOne: "#CCBBFF",
  calendarLevelTwo: "#9B7EDE",
  calendarLevelThree: "#6B5B95",
  calendarLevelFour: "#2D2A45",

  stopColor: "#8b0000",
  stopBorderColor: "#8b0000",

  xColor: "#8b0000",

  calendarIconColor: "#1d0057",
  gray: "#8d8d8d",

  white:"#ffffff",

  circleColor:"#b18af5",

  cardSurface: "#FFF9FE",
  cardBorderSoft: "#F5E4FF",
  cardShadow: "#D4B8F7",
  cardGlow: "#FFE8F7",
  cardShadowOpacity: 0.08,

  coursePastels: [
    "#FFB3BA",
    "#FFDFBA",
    "#E8FFBA",
    "#BAFFD9",
    "#BAE1FF",
    "#D4BBFF",
    "#FFC9E8",
  ],
  courseInk: "#3D3556",
  courseUnassigned: "#D4D0E8",
  courseTintStrong: 0.55,
  courseTintMuted: 0.3,
  postItShadow: "#2A2540",
  postItShadowOpacity: 0.2,

  cycleDefault : "#7C3AED26",
  cycleInactive: "#6d28d91a",
  cycleActive : "#7c3aed",
};

/* Afin d'avoir les memes declarations de variables, on utilise typeof */
export const darkTheme: typeof lightTheme = {
  background: "#221f3d",
  mainWrapperBgColor: "#1A1729",
  contentWrapperBgColor: "#444462",

  navBarBgColor: "#221f3d",
  borderColor: "#22103d",

  // Icons de navigation
  inactiveColorIcon: "#ffffff",
  activeColorIcon: "#AB8BFF",

  defaultTextColor: "#f3e8ff",
  activeTextColor: "#AB8BFF",

  buttonColor: "#7c3aed",

  anotherTextColor: "#AB8BFF",
  anotherBorderColor: "#AB8BFF",

  // Calendrier
  calendarZero: "#2D2A45",
  calendarLevelOne: "#6B5B95",
  calendarLevelTwo: "#9B7EDE",
  calendarLevelThree: "#AB8BFF",
  calendarLevelFour: "#CCBBFF",

  stopColor: "#f9acac",
  stopBorderColor: "#f9acac",

  xColor: "#8b0000",

  calendarIconColor: "#bba1ee",

  gray: "#d3d3d3",

  white:"#ffffff",

  circleColor:"#7c3aed",

  cardSurface: "#242038",
  cardBorderSoft: "#3A3358",
  cardShadow: "#AB8BFF",
  cardGlow: "#5B4A8C",
  cardShadowOpacity: 0.14,

  coursePastels: [
    "#B86B73",
    "#B8926B",
    "#8FA86B",
    "#6BA892",
    "#6B8FB8",
    "#8B6BB8",
    "#B86B92",
  ],
  courseInk: "#F5F0FF",
  courseUnassigned: "#4A4562",
  courseTintStrong: 0.42,
  courseTintMuted: 0.22,
  postItShadow: "#000000",
  postItShadowOpacity: 0.38,

  cycleDefault : "#7C3AED26",
  cycleInactive: "#6d28d91a",
  cycleActive : "#7c3aed",
};

export function isDarkTheme(theme: typeof lightTheme): boolean {
  return theme.background === darkTheme.background;
}
