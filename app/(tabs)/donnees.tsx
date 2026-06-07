import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Alert,
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { darkTheme, lightTheme } from "@/components/colors";
import { TopStatusBarGuard } from "@/components/TopStatusBarGuard";
import { Course, useCourses } from "../context/CoursesContext";
import { useSessions } from "../context/SessionsContext";
import { useSettings } from "../context/SettingsContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type AppTheme = typeof lightTheme;

export default function Donnees() {
  const {
    courses,
    addCourse,
    updateCourse,
    deleteCourse,
    getCoursesBySession,
    isLoading,
  } = useCourses();
  const {
    sessions,
    activeSession,
    addSession,
    updateSession,
    deleteSession,
    setActiveSession,
  } = useSessions();
  const { settings } = useSettings();
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;
  const theme = settings.isDarkMode ? darkTheme : lightTheme;
  const placeholderColor = settings.isDarkMode ? "#B9A8D8" : "#9372BA";
  const mutedTextColor = settings.isDarkMode ? "#D6C8EA" : "#9372BA";
  const buttonTextColor = settings.isDarkMode ? "white" : theme.defaultTextColor;
  const surfaceStyle = {
    backgroundColor: theme.mainWrapperBgColor,
    borderColor: theme.borderColor,
  };
  const inputStyle = {
    backgroundColor: theme.contentWrapperBgColor,
    borderColor: theme.borderColor,
    color: theme.defaultTextColor,
  };
  const router = useRouter();
  const guardOpacity = scrollY.interpolate({
    inputRange: [0, 4, 16],
    outputRange: [0, 0.4, 1],
    extrapolate: "clamp",
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [courseName, setCourseName] = useState("");
  const [courseObjective, setCourseObjective] = useState("");
  const [courseCredits, setCourseCredits] = useState("");
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null,
  );
  const [menuVisible, setMenuVisible] = useState<string | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [sessionModalVisible, setSessionModalVisible] = useState(false);
  const [newSessionName, setNewSessionName] = useState("");
  const [sessionMenuVisible, setSessionMenuVisible] = useState<string | null>(
    null,
  );
  const [sessionEditModalVisible, setSessionEditModalVisible] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingSessionName, setEditingSessionName] = useState("");

  // Get courses for the active session
  // Show courses from active session + courses without a session (for backwards compatibility)
  const displayedCourses = activeSession
    ? [
      ...getCoursesBySession(activeSession.id),
      ...getCoursesBySession(null), // Include courses without session assignment
    ]
    : getCoursesBySession(null);

  const validateObjective = (value: string): number | null => {
    const num = parseFloat(value);
    if (isNaN(num) || num < 0 || num > 100) {
      Alert.alert("Erreur", "L'objectif doit être entre 0 et 100%");
      return null;
    }
    return num;
  };

  const validateCredits = (value: string): number | null => {
    const num = parseFloat(value);
    if (isNaN(num) || num <= 0) {
      Alert.alert("Erreur", "Les crédits doivent être un nombre positif");
      return null;
    }
    return num;
  };

  const handleAddCourse = () => {
    if (!courseName.trim()) {
      Alert.alert("Erreur", "Veuillez entrer un nom de cours");
      return;
    }

    if (!courseObjective.trim()) {
      Alert.alert("Erreur", "Veuillez entrer un objectif");
      return;
    }

    if (!courseCredits.trim()) {
      Alert.alert("Erreur", "Veuillez entrer les crédits");
      return;
    }

    const objective = validateObjective(courseObjective);
    if (objective === null) return;

    const credits = validateCredits(courseCredits);
    if (credits === null) return;

    const newCourseId = addCourse(
      courseName.trim(),
      objective,
      credits,
      selectedSessionId || activeSession?.id,
    );
    setCourseName("");
    setCourseObjective("");
    setCourseCredits("");
    setSelectedSessionId(null);
    setModalVisible(false);
    router.push({
      pathname: "/detailscours",
      params: { courseId: newCourseId },
    });
  };

  const handleDeleteCourse = (id: string) => {
    deleteCourse(id);
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setCourseName(course.name);
    setCourseObjective(course.objective.toString());
    setCourseCredits(course.credits.toString());
    setSelectedSessionId(course.session || null);
    setMenuVisible(null);
    setEditModalVisible(true);
  };

  const handleUpdateCourse = () => {
    if (!courseName.trim()) {
      Alert.alert("Erreur", "Veuillez entrer un nom de cours");
      return;
    }

    if (!courseObjective.trim()) {
      Alert.alert("Erreur", "Veuillez entrer un objectif");
      return;
    }

    if (!courseCredits.trim()) {
      Alert.alert("Erreur", "Veuillez entrer les crédits");
      return;
    }

    const objective = validateObjective(courseObjective);
    if (objective === null || !editingCourse) return;

    const credits = validateCredits(courseCredits);
    if (credits === null) return;

    updateCourse(
      editingCourse.id,
      courseName.trim(),
      objective,
      credits,
      selectedSessionId || undefined,
    );
    setCourseName("");
    setCourseObjective("");
    setCourseCredits("");
    setSelectedSessionId(null);
    setEditModalVisible(false);
    setEditingCourse(null);
  };

  const navigateToCourseDetails = (courseId: string) => {
    router.push({
      pathname: "/detailscours",
      params: { courseId },
    });
  };

  const handleAddSession = () => {
    if (!newSessionName.trim()) {
      Alert.alert("Erreur", "Veuillez entrer un nom de session");
      return;
    }
    addSession(newSessionName.trim());
    setNewSessionName("");
    setSessionModalVisible(false);
  };

  const handleEditSession = (sessionId: string, name: string) => {
    setEditingSessionId(sessionId);
    setEditingSessionName(name);
    setSessionMenuVisible(null);
    setSessionEditModalVisible(true);
  };

  const handleUpdateSession = () => {
    if (!editingSessionName.trim() || !editingSessionId) {
      Alert.alert("Erreur", "Veuillez entrer un nom de session");
      return;
    }
    updateSession(editingSessionId, editingSessionName.trim());
    setEditingSessionName("");
    setEditingSessionId(null);
    setSessionEditModalVisible(false);
  };

  const handleDeleteSession = (sessionId: string) => {
    if (sessions.length === 1) {
      Alert.alert("Erreur", "Vous ne pouvez pas supprimer la dernière session");
      return;
    }
    Alert.alert(
      "Confirmer la suppression",
      "Voulez-vous vraiment supprimer cette session? Les cours associés ne seront pas supprimés mais ne seront plus assignés à une session.",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () => deleteSession(sessionId),
        },
      ],
    );
    setSessionMenuVisible(null);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Header - anchored to top */}
      <View>
        <Text style={[styles.title, { color: theme.defaultTextColor }]}>
          Mes Cours
        </Text>
      </View>

      {/* Session Selector */}
      <View style={[styles.sessionSelector, { borderBottomColor: theme.borderColor }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sessionScrollContent}
        >
          {sessions.map((session) => (
            <TouchableOpacity
              key={session.id}
              style={[
                styles.sessionChip,
                {
                  backgroundColor: theme.contentWrapperBgColor,
                  borderColor: theme.borderColor,
                },
                activeSession?.id === session.id && {
                  backgroundColor: theme.buttonColor,
                  borderColor: theme.buttonColor,
                },
              ]}
              onPress={() => setActiveSession(session.id)}
              onLongPress={(e) => {
                const { pageY, pageX } = e.nativeEvent;
                setMenuPosition({ top: pageY, left: pageX });
                setSessionMenuVisible(session.id);
              }}
            >
              <Text
                style={[
                  styles.sessionChipText,
                  { color: theme.defaultTextColor },
                  activeSession?.id === session.id && {
                    color: buttonTextColor,
                  },
                ]}
              >
                {session.name}
              </Text>
              {activeSession?.id === session.id && (
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color={buttonTextColor}
                />
              )}
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[
              styles.addSessionChip,
              {
                backgroundColor: theme.mainWrapperBgColor,
                borderColor: theme.activeColorIcon,
              },
            ]}
            onPress={() => setSessionModalVisible(true)}
          >
            <Ionicons name="add" size={20} color={theme.activeColorIcon} />
            <Text style={[styles.addSessionText, { color: theme.activeColorIcon }]}>
              Nouvelle session
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Scrollable content in the middle */}
      <Animated.ScrollView
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true },
        )}
        scrollIndicatorInsets={{ top: insets.top + 8 }}
        scrollEventThrottle={16}
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "flex-start",
          alignItems: "center",
          paddingTop: 20,
        }}
      >
        {displayedCourses.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="school-outline" size={48} color={mutedTextColor} />
            <Text style={[styles.emptyStateText, { color: theme.defaultTextColor }]}>
              Aucun cours dans cette session
            </Text>
            <Text style={[styles.emptyStateSubtext, { color: mutedTextColor }]}>
              Ajoutez un cours pour commencer
            </Text>
          </View>
        ) : (
          <>
            {displayedCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                theme={theme}
                onPress={() => navigateToCourseDetails(course.id)}
                onEdit={() => handleEditCourse(course)}
                onDelete={() => handleDeleteCourse(course.id)}
              />
            ))}
          </>
        )}

        <TouchableOpacity
          style={[styles.addCoursButton, { backgroundColor: theme.buttonColor }]}
          onPress={() => setModalVisible(true)}
        >
          <Text
            style={[
              styles.addCoursText,
              { color: buttonTextColor },
            ]}
          >
            Ajouter un cours
          </Text>
        </TouchableOpacity>
      </Animated.ScrollView>

      {/* Modal for adding courses */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{
              flex: 1,
              width: "100%",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Pressable
              style={[styles.modalContent, surfaceStyle]}
              onPress={(e) => e.stopPropagation()}
            >
              <ScrollView
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
              >
                <Text style={[styles.modalTitle, { color: theme.defaultTextColor }]}>
                  Ajouter un cours
                </Text>

                <TextInput
                  style={[styles.input, inputStyle]}
                  placeholder="Nom du cours"
                  placeholderTextColor={placeholderColor}
                  value={courseName}
                  onChangeText={setCourseName}
                  autoFocus
                />

                <TextInput
                  style={[styles.input, inputStyle]}
                  placeholder="Objectif (%)"
                  placeholderTextColor={placeholderColor}
                  value={courseObjective}
                  onChangeText={setCourseObjective}
                  keyboardType="numeric"
                />

                <TextInput
                  style={[styles.input, inputStyle]}
                  placeholder="Crédits"
                  placeholderTextColor={placeholderColor}
                  value={courseCredits}
                  onChangeText={setCourseCredits}
                  keyboardType="numeric"
                />

                <Text style={[styles.label, { color: theme.defaultTextColor }]}>
                  Session
                </Text>
                <View style={styles.sessionPicker}>
                  {sessions.map((session) => {
                    const isSelected =
                      selectedSessionId === session.id ||
                      (selectedSessionId === null &&
                        activeSession?.id === session.id);
                    return (
                      <TouchableOpacity
                        key={session.id}
                        style={[
                          styles.sessionOption,
                          {
                            backgroundColor: theme.contentWrapperBgColor,
                            borderColor: theme.borderColor,
                          },
                          isSelected && {
                            backgroundColor: theme.buttonColor,
                            borderColor: theme.buttonColor,
                          },
                        ]}
                        onPress={() =>
                          setSelectedSessionId(
                            isSelected && selectedSessionId === session.id
                              ? null
                              : session.id,
                          )
                        }
                      >
                        <Text
                          style={[
                            styles.sessionOptionText,
                            { color: theme.defaultTextColor },
                            isSelected && {
                              color: buttonTextColor,
                            },
                          ]}
                        >
                          {session.name}
                        </Text>
                        {isSelected && (
                          <Ionicons
                            name="checkmark"
                            size={18}
                            color={buttonTextColor}
                          />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[
                      styles.modalButton,
                      styles.cancelButton,
                      { borderColor: theme.borderColor },
                    ]}
                    onPress={() => {
                      setModalVisible(false);
                      setCourseName("");
                      setCourseObjective("");
                      setCourseCredits("");
                      setSelectedSessionId(null);
                    }}
                  >
                    <Text style={[styles.cancelButtonText, { color: theme.defaultTextColor }]}>
                      Annuler
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.modalButton,
                      styles.addButton,
                      { backgroundColor: theme.buttonColor },
                    ]}
                    onPress={handleAddCourse}
                  >
                    <Text
                      style={[
                        styles.addButtonText,
                        { color: buttonTextColor },
                      ]}
                    >
                      Ajouter
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>

      {/* Modal for editing courses */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => {
          setEditModalVisible(false);
          setCourseName("");
          setCourseObjective("");
          setCourseCredits("");
          setEditingCourse(null);
        }}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => {
            setEditModalVisible(false);
            setCourseName("");
            setCourseObjective("");
            setCourseCredits("");
            setEditingCourse(null);
          }}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{
              flex: 1,
              width: "100%",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Pressable
              style={[styles.modalContent, surfaceStyle]}
              onPress={(e) => e.stopPropagation()}
            >
              <ScrollView
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
              >
                <Text style={[styles.modalTitle, { color: theme.defaultTextColor }]}>
                  Modifier le cours
                </Text>

                <TextInput
                  style={[styles.input, inputStyle]}
                  placeholder="Nom du cours"
                  placeholderTextColor={placeholderColor}
                  value={courseName}
                  onChangeText={setCourseName}
                  autoFocus
                />

                <TextInput
                  style={[styles.input, inputStyle]}
                  placeholder="Objectif (%)"
                  placeholderTextColor={placeholderColor}
                  value={courseObjective}
                  onChangeText={setCourseObjective}
                  keyboardType="numeric"
                />

                <TextInput
                  style={[styles.input, inputStyle]}
                  placeholder="Crédits"
                  value={courseCredits}
                  placeholderTextColor={placeholderColor}
                  onChangeText={setCourseCredits}
                  keyboardType="numeric"
                />

                <Text style={[styles.label, { color: theme.defaultTextColor }]}>
                  Session
                </Text>
                <View style={styles.sessionPicker}>
                  {sessions.map((session) => {
                    const isSelected =
                      selectedSessionId === session.id ||
                      (selectedSessionId === null &&
                        editingCourse?.session === session.id) ||
                      (selectedSessionId === null &&
                        !editingCourse?.session &&
                        activeSession?.id === session.id);
                    return (
                      <TouchableOpacity
                        key={session.id}
                        style={[
                          styles.sessionOption,
                          {
                            backgroundColor: theme.contentWrapperBgColor,
                            borderColor: theme.borderColor,
                          },
                          isSelected && {
                            backgroundColor: theme.buttonColor,
                            borderColor: theme.buttonColor,
                          },
                        ]}
                        onPress={() =>
                          setSelectedSessionId(
                            isSelected && selectedSessionId === session.id
                              ? null
                              : session.id,
                          )
                        }
                      >
                        <Text
                          style={[
                            styles.sessionOptionText,
                            { color: theme.defaultTextColor },
                            isSelected && {
                              color: buttonTextColor,
                            },
                          ]}
                        >
                          {session.name}
                        </Text>
                        {isSelected && (
                          <Ionicons
                            name="checkmark"
                            size={18}
                            color={buttonTextColor}
                          />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[
                      styles.modalButton,
                      styles.cancelButton,
                      { borderColor: theme.borderColor },
                    ]}
                    onPress={() => {
                      setEditModalVisible(false);
                      setCourseName("");
                      setCourseObjective("");
                      setCourseCredits("");
                      setSelectedSessionId(null);
                      setEditingCourse(null);
                    }}
                  >
                    <Text style={[styles.cancelButtonText, { color: theme.defaultTextColor }]}>
                      Annuler
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.modalButton,
                      styles.addButton,
                      { backgroundColor: theme.buttonColor },
                    ]}
                    onPress={handleUpdateCourse}
                  >
                    <Text
                      style={[
                        styles.addButtonText,
                        { color: buttonTextColor },
                      ]}
                    >
                      Modifier
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>

      {/* Session Menu */}
      {sessionMenuVisible && (
        <>
          <Pressable
            style={styles.menuOverlay}
            onPress={() => setSessionMenuVisible(null)}
          />
          <View
            style={[
              styles.dropdownMenu,
              surfaceStyle,
              { top: menuPosition.top, left: menuPosition.left },
            ]}
          >
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                const session = sessions.find(
                  (s) => s.id === sessionMenuVisible,
                );
                if (session) handleEditSession(session.id, session.name);
              }}
            >
              <Ionicons
                name="create-outline"
                size={18}
                color={theme.defaultTextColor}
              />
              <Text style={[styles.menuText, { color: theme.defaultTextColor }]}>
                Modifier
              </Text>
            </TouchableOpacity>
            <View style={[styles.menuDivider, { backgroundColor: theme.borderColor }]} />
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                if (sessionMenuVisible) {
                  handleDeleteSession(sessionMenuVisible);
                }
              }}
            >
              <Ionicons name="trash-outline" size={18} color="#d32f2f" />
              <Text style={[styles.menuText, { color: "#d32f2f" }]}>
                Supprimer
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* Modal for adding sessions */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={sessionModalVisible}
        onRequestClose={() => {
          setSessionModalVisible(false);
          setNewSessionName("");
        }}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => {
            setSessionModalVisible(false);
            setNewSessionName("");
          }}
        >
          <Pressable
            style={[styles.modalContent, surfaceStyle]}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={[styles.modalTitle, { color: theme.defaultTextColor }]}>
              Ajouter une session
            </Text>

            <TextInput
              style={[styles.input, inputStyle]}
              placeholder="Nom de la session"
              placeholderTextColor={placeholderColor}
              value={newSessionName}
              onChangeText={setNewSessionName}
              autoFocus
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.cancelButton,
                  { borderColor: theme.borderColor },
                ]}
                onPress={() => {
                  setSessionModalVisible(false);
                  setNewSessionName("");
                }}
              >
                <Text style={[styles.cancelButtonText, { color: theme.defaultTextColor }]}>
                  Annuler
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.addButton,
                  { backgroundColor: theme.buttonColor },
                ]}
                onPress={handleAddSession}
              >
                <Text
                  style={[
                    styles.addButtonText,
                    { color: buttonTextColor },
                  ]}
                >
                  Ajouter
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Modal for editing sessions */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={sessionEditModalVisible}
        onRequestClose={() => {
          setSessionEditModalVisible(false);
          setEditingSessionName("");
          setEditingSessionId(null);
        }}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => {
            setSessionEditModalVisible(false);
            setEditingSessionName("");
            setEditingSessionId(null);
          }}
        >
          <Pressable
            style={[styles.modalContent, surfaceStyle]}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={[styles.modalTitle, { color: theme.defaultTextColor }]}>
              Modifier la session
            </Text>

            <TextInput
              style={[styles.input, inputStyle]}
              placeholder="Nom de la session"
              placeholderTextColor={placeholderColor}
              value={editingSessionName}
              onChangeText={setEditingSessionName}
              autoFocus
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.cancelButton,
                  { borderColor: theme.borderColor },
                ]}
                onPress={() => {
                  setSessionEditModalVisible(false);
                  setEditingSessionName("");
                  setEditingSessionId(null);
                }}
              >
                <Text style={[styles.cancelButtonText, { color: theme.defaultTextColor }]}>
                  Annuler
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.addButton,
                  { backgroundColor: theme.buttonColor },
                ]}
                onPress={handleUpdateSession}
              >
                <Text
                  style={[
                    styles.addButtonText,
                    { color: buttonTextColor },
                  ]}
                >
                  Modifier
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
      <TopStatusBarGuard backgroundColor={theme.background} opacity={guardOpacity} />
    </View>
  );
}

function CourseCard({
  course,
  theme,
  onPress,
  onEdit,
  onDelete,
}: {
  course: Course;
  theme: AppTheme;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const swipeRef = useRef<Swipeable>(null);

  const confirmDelete = () => {
    Alert.alert(
      "Supprimer le cours",
      `Souhaitez-vous vraiment supprimer "${course.name}" ?`,
      [
        {
          text: "Annuler",
          style: "cancel",
          onPress: () => swipeRef.current?.close(),
        },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () => {
            onDelete();
            swipeRef.current?.close();
          },
        },
      ],
      { cancelable: true },
    );
  };

  const handleEdit = () => {
    onEdit();
    swipeRef.current?.close();
  };

  const renderLeftActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>,
  ) => {
    const reveal = dragX.interpolate({
      inputRange: [0, 60, 120],
      outputRange: [0, 2, 1],
      extrapolate: "clamp",
    });

    const iconScale = dragX.interpolate({
      inputRange: [0, 60, 120],
      outputRange: [0.4, 0.9, 1],
      extrapolate: "clamp",
    });

    const iconTranslateX = dragX.interpolate({
      inputRange: [0, 60, 120],
      outputRange: [-20, -2, 0],
      extrapolate: "clamp",
    });

    return (
      <View
        style={{
          width: 88,
          marginBottom: 12,
          justifyContent: "center",
          alignItems: "flex-start",
        }}
      >
        <Animated.View
          style={{
            height: "60%",
            width: "65%",
            borderRadius: 12,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: theme.contentWrapperBgColor,
            opacity: reveal,
          }}
        >
          <Animated.View
            style={{
              transform: [{ scale: iconScale }, { translateX: iconTranslateX }],
            }}
          >
            <Ionicons
              name="pencil-outline"
              size={22}
              color={theme.defaultTextColor}
            />
          </Animated.View>
        </Animated.View>
      </View>
    );
  };

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>,
  ) => {
    const reveal = dragX.interpolate({
      inputRange: [-120, -60, 0],
      outputRange: [1, 0.6, 0],
      extrapolate: "clamp",
    });

    const iconScale = dragX.interpolate({
      inputRange: [-120, -60, 0],
      outputRange: [1, 0.9, 0.4],
      extrapolate: "clamp",
    });

    const iconTranslateX = dragX.interpolate({
      inputRange: [-120, -60, 0],
      outputRange: [0, 2, 20],
      extrapolate: "clamp",
    });

    return (
      <View
        style={{
          width: 88,
          marginBottom: 12,
          justifyContent: "center",
          alignItems: "flex-end",
        }}
      >
        <Animated.View
          style={{
            height: "60%",
            width: "65%",
            borderRadius: 12,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#f30000ff",
            opacity: reveal,
          }}
        >
          <Animated.View
            style={{
              transform: [{ scale: iconScale }, { translateX: iconTranslateX }],
            }}
          >
            <Ionicons name="trash-outline" size={22} color="white" />
          </Animated.View>
        </Animated.View>
      </View>
    );
  };

  return (
    <View style={{ width: "100%", paddingHorizontal: 30 }}>
      <Swipeable
        ref={swipeRef}
        renderLeftActions={renderLeftActions}
        renderRightActions={renderRightActions}
        leftThreshold={70}
        rightThreshold={70}
        friction={2}
        overshootLeft={false}
        overshootRight={false}
        onSwipeableOpen={(direction) => {
          if (direction === "right") confirmDelete();
          if (direction === "left") handleEdit();
        }}
      >
        <Pressable onPress={onPress} onLongPress={onEdit}>
          <View
            style={[
              styles.coursContainer,
              {
                backgroundColor: theme.mainWrapperBgColor,
                borderColor: theme.borderColor,
              },
            ]}
          >
            <Text
              style={[styles.coursText, { color: theme.defaultTextColor }]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {course.name}
            </Text>

            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.defaultTextColor}
            />
          </View>
        </Pressable>
      </Swipeable>
    </View>
  );
}

const pixelFont = { fontFamily: "PixelJersey" as const };

const styles = StyleSheet.create({
  title: {
    ...pixelFont,
    fontSize: 24,
    marginTop: 78,
    marginBottom: 5,
    alignSelf: "center",
    color: "#f3e8ff",
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  divider: {
    height: 3,
    width: "60%",
    backgroundColor: "white",
    marginTop: 5,
    marginBottom: 20,
    alignSelf: "center",
  },

  more: {
    paddingHorizontal: 10,
  },
  chevRight: {
    position: "absolute",
    right: 10,
    top: 25,
  },

  addCoursButton: {
    backgroundColor: "#5900a1ff",
    paddingVertical: 20,
    paddingHorizontal: 10,
    width: "80%",
    borderRadius: 15,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15,
  },
  addCoursText: {
    ...pixelFont,
    color: "white",
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#221f3d",
    borderRadius: 20,
    padding: 30,
    width: "86%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    ...pixelFont,
    fontSize: 26,
    marginBottom: 20,
    color:"#f3e8ff",
    textAlign: "center",
  },
  input: {
    ...pixelFont,
    borderWidth: 1,
    backgroundColor: "#444462",
    borderColor: "#444462",
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 20,
    color:"#f3e8ff",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  cancelButton: {
      borderWidth: 1,
      borderColor:'#ddd6fe',
  },
  cancelButtonText: {
    ...pixelFont,
    color: "#f5f3ff",
    fontSize: 16,
    fontWeight: "600",
  },
  addButton: {
    backgroundColor: "#5900a1ff",
  },
  addButtonText: {
    ...pixelFont,
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  dropdownMenu: {
    position: "absolute",
    backgroundColor: "white",
    borderRadius: 10,
    paddingVertical: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1001,
    minWidth: 150,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 15,
    gap: 10,
  },
  menuText: {
    ...pixelFont,
    fontSize: 15,
    color: "#333",
  },
  menuDivider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginHorizontal: 10,
  },
  menuOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "transparent",
  },
  sessionSelector: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  sessionScrollContent: {
    alignItems: "center",
    gap: 10,
    paddingRight: 10,
  },
  sessionChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  sessionChipActive: {
    backgroundColor: "#5900a1ff",
    borderColor: "#5900a1ff",
  },
  sessionChipText: {
    ...pixelFont,
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  sessionChipTextActive: {
    color: "white",
  },
  addSessionChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#5900a1ff",
    borderStyle: "dashed",
  },
  addSessionText: {
    ...pixelFont,
    fontSize: 14,
    color: "#5900a1ff",
    fontWeight: "500",
  },
  sessionPicker: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  sessionOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  sessionOptionActive: {
    backgroundColor: "#5900a1ff",
    borderColor: "#5900a1ff",
  },
  sessionOptionText: {
    ...pixelFont,
    fontSize: 14,
    color: "#333",
  },
  sessionOptionTextActive: {
    color: "white",
  },
  label: {
    ...pixelFont,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    color: "#515153",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyStateText: {
    ...pixelFont,
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginTop: 16,
  },
  emptyStateSubtext: {
    ...pixelFont,
    fontSize: 14,
    color: "#999",
    marginTop: 8,
  },
  coursContainer: {
    backgroundColor: "lightgray",
    paddingVertical: 25,
    paddingHorizontal: 14,
    width: "100%",
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  coursText: {
    ...pixelFont,
    fontSize: 16,
    flex: 1,
    marginRight: 12,
  },
});
