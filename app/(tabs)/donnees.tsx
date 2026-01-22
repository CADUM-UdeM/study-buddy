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
import { Course, useCourses } from "../context/CoursesContext";

export default function Donnees() {
  const { courses, addCourse, updateCourse, deleteCourse, isLoading } =
    useCourses();
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [courseName, setCourseName] = useState("");
  const [courseObjective, setCourseObjective] = useState("");
  const [courseCredits, setCourseCredits] = useState("");
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

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

    addCourse(courseName.trim(), objective, credits);
    setCourseName("");
    setCourseObjective("");
    setCourseCredits("");
    setModalVisible(false);
  };

  const handleDeleteCourse = (id: string) => {
    deleteCourse(id);
    setMenuVisible(null);
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setCourseName(course.name);
    setCourseObjective(course.objective.toString());
    setCourseCredits(course.credits.toString());
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

    updateCourse(editingCourse.id, courseName.trim(), objective, credits);
    setCourseName("");
    setCourseObjective("");
    setCourseCredits("");
    setEditModalVisible(false);
    setEditingCourse(null);
  };

  const navigateToCourseDetails = (courseId: string) => {
    router.push({
      pathname: "../detailscours",
      params: { courseId },
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      {/* Header - anchored to top */}
      <View>
        <Text style={styles.title}>Mes Cours</Text>
        <View style={styles.divider} />
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
        {courses.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            onPress={() => navigateToCourseDetails(course.id)}
            onEdit={() => handleEditCourse(course)}
            onDelete={() => deleteCourse(course.id)}
          />
        ))}

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

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => {
                      setModalVisible(false);
                      setCourseName("");
                      setCourseObjective("");
                      setCourseCredits("");
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

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => {
                      setEditModalVisible(false);
                      setCourseName("");
                      setCourseObjective("");
                      setCourseCredits("");
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
    </View>
  );
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
              backgroundColor: "rgb(64, 64, 64)",
              opacity: reveal,
            }}
          >
            <Animated.View
              style={{
                transform: [
                  { scale: iconScale },
                  { translateX: iconTranslateX },
                ],
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
              backgroundColor: "#f30000ff",
              opacity: reveal,
            }}
          >
            <Animated.View
              style={{
                transform: [
                  { scale: iconScale },
                  { translateX: iconTranslateX },
                ],
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
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 70,
    marginBottom: 5,
    alignSelf: "center",
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  divider: {
    height: 3,
    width: "60%",
    backgroundColor: "black",
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
    backgroundColor: "white",
    borderRadius: 20,
    padding: 30,
    width: "85%",
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
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
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
    backgroundColor: "#f0f0f0",
  },
  cancelButtonText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "600",
  },
  addButton: {
    backgroundColor: "#5900a1ff",
  },
  addButtonText: {
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
    fontSize: 16,
    flex: 1,
    marginRight: 12,
  },
});
