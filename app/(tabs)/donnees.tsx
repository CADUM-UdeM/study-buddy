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
import AppBackground from "../../components/AppBackground";
import { Course, useCourses } from "../context/CoursesContext";
import { useSessions } from "../context/SessionsContext";
import { colors } from "../theme/colors";

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
  const router = useRouter();
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
      pathname: "/(tabs)/detailscours",
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
      pathname: "/(tabs)/detailscours",
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
    <AppBackground>
      {/* Header - anchored to top */}
      <View>
        <Text style={styles.title}>Mes Cours</Text>
        <View style={styles.divider} />
      </View>

      {/* Session Selector */}
      <View style={styles.sessionSelector}>
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
                activeSession?.id === session.id && styles.sessionChipActive,
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
                  activeSession?.id === session.id &&
                    styles.sessionChipTextActive,
                ]}
              >
                {session.name}
              </Text>
              {activeSession?.id === session.id && (
                <Ionicons name="checkmark-circle" size={16} color="white" />
              )}
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={styles.addSessionChip}
            onPress={() => setSessionModalVisible(true)}
          >
            <Ionicons name="add" size={20} color={colors.primary} />
            <Text style={styles.addSessionText}>Nouvelle session</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Scrollable content in the middle */}
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "flex-start",
          alignItems: "center",
          paddingTop: 20,
        }}
      >
        {displayedCourses.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="school-outline" size={48} color={colors.textMuted} />
            <Text style={styles.emptyStateText}>
              Aucun cours dans cette session
            </Text>
            <Text style={styles.emptyStateSubtext}>
              Ajoutez un cours pour commencer
            </Text>
          </View>
        ) : (
          <>
            {displayedCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onPress={() => navigateToCourseDetails(course.id)}
                onEdit={() => handleEditCourse(course)}
                onDelete={() => handleDeleteCourse(course.id)}
              />
            ))}
          </>
        )}

        <TouchableOpacity
          style={styles.addCoursButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addCoursText}>+ Ajouter un cours</Text>
        </TouchableOpacity>
      </ScrollView>

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
              style={styles.modalContent}
              onPress={(e) => e.stopPropagation()}
            >
              <ScrollView
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
              >
                <Text style={styles.modalTitle}>Ajouter un cours</Text>

                <TextInput
                  style={styles.input}
                  placeholder="Nom du cours"
                  value={courseName}
                  onChangeText={setCourseName}
                  autoFocus
                />

                <TextInput
                  style={styles.input}
                  placeholder="Objectif (%)"
                  value={courseObjective}
                  onChangeText={setCourseObjective}
                  keyboardType="numeric"
                />

                <TextInput
                  style={styles.input}
                  placeholder="Crédits"
                  value={courseCredits}
                  onChangeText={setCourseCredits}
                  keyboardType="numeric"
                />

                <Text style={styles.label}>Session</Text>
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
                          isSelected && styles.sessionOptionActive,
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
                            isSelected && styles.sessionOptionTextActive,
                          ]}
                        >
                          {session.name}
                        </Text>
                        {isSelected && (
                          <Ionicons name="checkmark" size={18} color="white" />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => {
                      setModalVisible(false);
                      setCourseName("");
                      setCourseObjective("");
                      setCourseCredits("");
                      setSelectedSessionId(null);
                    }}
                  >
                    <Text style={styles.cancelButtonText}>Annuler</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalButton, styles.addButton]}
                    onPress={handleAddCourse}
                  >
                    <Text style={styles.addButtonText}>Ajouter</Text>
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
              style={styles.modalContent}
              onPress={(e) => e.stopPropagation()}
            >
              <ScrollView
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
              >
                <Text style={styles.modalTitle}>Modifier le cours</Text>

                <TextInput
                  style={styles.input}
                  placeholder="Nom du cours"
                  value={courseName}
                  onChangeText={setCourseName}
                  autoFocus
                />

                <TextInput
                  style={styles.input}
                  placeholder="Objectif (%)"
                  value={courseObjective}
                  onChangeText={setCourseObjective}
                  keyboardType="numeric"
                />

                <TextInput
                  style={styles.input}
                  placeholder="Crédits"
                  value={courseCredits}
                  onChangeText={setCourseCredits}
                  keyboardType="numeric"
                />

                <Text style={styles.label}>Session</Text>
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
                          isSelected && styles.sessionOptionActive,
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
                            isSelected && styles.sessionOptionTextActive,
                          ]}
                        >
                          {session.name}
                        </Text>
                        {isSelected && (
                          <Ionicons name="checkmark" size={18} color="white" />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => {
                      setEditModalVisible(false);
                      setCourseName("");
                      setCourseObjective("");
                      setCourseCredits("");
                      setSelectedSessionId(null);
                      setEditingCourse(null);
                    }}
                  >
                    <Text style={styles.cancelButtonText}>Annuler</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalButton, styles.addButton]}
                    onPress={handleUpdateCourse}
                  >
                    <Text style={styles.addButtonText}>Modifier</Text>
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
              <Ionicons name="create-outline" size={18} color={colors.textDark} />
              <Text style={styles.menuText}>Modifier</Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                if (sessionMenuVisible) {
                  handleDeleteSession(sessionMenuVisible);
                }
              }}
            >
              <Ionicons name="trash-outline" size={18} color={colors.error} />
              <Text style={[styles.menuText, { color: colors.error }]}>
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
            style={styles.modalContent}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={styles.modalTitle}>Ajouter une session</Text>

            <TextInput
              style={styles.input}
              placeholder="Nom de la session"
              value={newSessionName}
              onChangeText={setNewSessionName}
              autoFocus
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setSessionModalVisible(false);
                  setNewSessionName("");
                }}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.addButton]}
                onPress={handleAddSession}
              >
                <Text style={styles.addButtonText}>Ajouter</Text>
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
            style={styles.modalContent}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={styles.modalTitle}>Modifier la session</Text>

            <TextInput
              style={styles.input}
              placeholder="Nom de la session"
              value={editingSessionName}
              onChangeText={setEditingSessionName}
              autoFocus
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setSessionEditModalVisible(false);
                  setEditingSessionName("");
                  setEditingSessionId(null);
                }}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.addButton]}
                onPress={handleUpdateSession}
              >
                <Text style={styles.addButtonText}>Modifier</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </AppBackground>
  );
}

function CourseCard({
  course,
  onPress,
  onEdit,
  onDelete,
}: {
  course: Course;
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
            backgroundColor: colors.surfaceElevated,
            opacity: reveal,
          }}
        >
          <Animated.View
            style={{
              transform: [{ scale: iconScale }, { translateX: iconTranslateX }],
            }}
          >
            <Ionicons name="pencil-outline" size={22} color="white" />
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
            backgroundColor: colors.error,
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
          <View style={styles.coursContainer}>
            <Text
              style={styles.coursText}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {course.name}
            </Text>

            <Ionicons name="chevron-forward" size={20} />
          </View>
        </Pressable>
      </Swipeable>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 70,
    marginBottom: 5,
    alignSelf: "center",
    color: "white"
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  divider: {
    height: 3,
    width: "60%",
    backgroundColor: colors.background,
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
    backgroundColor: colors.primary,
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
    color: colors.white,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.modalOverlay,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 30,
    width: "85%",
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: colors.borderMuted,
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 20,
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
    backgroundColor: colors.surfaceLightest,
  },
  cancelButtonText: {
    color: colors.textDark,
    fontSize: 16,
    fontWeight: "600",
  },
  addButton: {
    backgroundColor: colors.primary,
  },
  addButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  dropdownMenu: {
    position: "absolute",
    backgroundColor: colors.white,
    borderRadius: 10,
    paddingVertical: 5,
    shadowColor: colors.black,
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
    fontSize: 15,
    color: colors.textDark,
  },
  menuDivider: {
    height: 1,
    backgroundColor: colors.surfaceLighter,
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
    borderBottomColor: colors.surfaceLighter,
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
    backgroundColor: colors.surfaceLightest,
    borderWidth: 1,
    borderColor: colors.borderMuted,
  },
  sessionChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  sessionChipText: {
    fontSize: 14,
    color: colors.textDark,
    fontWeight: "500",
  },
  sessionChipTextActive: {
    color: colors.white,
  },
  addSessionChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.primary,
    borderStyle: "dashed",
  },
  addSessionText: {
    fontSize: 14,
    color: colors.primary,
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
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.borderMuted,
  },
  sessionOptionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  sessionOptionText: {
    fontSize: 14,
    color: colors.textDark,
  },
  sessionOptionTextActive: {
    color: colors.white,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    color: colors.textDark,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.textMuted,
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.textMutedLight,
    marginTop: 8,
  },
  coursContainer: {
    backgroundColor: colors.surfaceLighter,
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
    fontSize: 16,
    flex: 1,
    marginRight: 12,
  },
});
