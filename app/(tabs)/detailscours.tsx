import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { AnimatedCircularProgress } from "react-native-circular-progress";
import { Evaluation, useCourses } from "../context/CoursesContext";

export default function DetailsCours() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const courseId = params.courseId as string;

  const { getCourse, addEvaluation, updateEvaluation, deleteEvaluation } =
    useCourses();
  const course = getCourse(courseId);

  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [editingEvalId, setEditingEvalId] = useState<string | null>(null);

  // Form state
  const [evalName, setEvalName] = useState("");
  const [evalNote, setEvalNote] = useState("");
  const [evalWeight, setEvalWeight] = useState("");
  const [evalType, setEvalType] = useState<"travail" | "examen">("travail");

  // Error handling if course not found
  if (!course) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "white",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ fontSize: 18, marginBottom: 20 }}>
          Cours introuvable
        </Text>
        <TouchableOpacity
          style={{
            padding: 15,
            backgroundColor: "#5900a1ff",
            borderRadius: 10,
          }}
          onPress={() => router.back()}
        >
          <Text style={{ color: "white", fontSize: 16 }}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Calculate current grade
  const calculateGrade = () => {
    if (course.evaluations.length === 0) return 0;

    const totalWeight = course.evaluations.reduce(
      (sum, e) => sum + e.weight,
      0
    );
    if (totalWeight === 0) return 0;

    const weightedSum = course.evaluations.reduce(
      (sum, e) => sum + e.note * e.weight,
      0
    );

    return Math.round(weightedSum / totalWeight);
  };

  const currentGrade = calculateGrade();

  // Generate encouragement message
  const getEncouragementMessage = () => {
    const diff = currentGrade - course.objective;

    if (course.evaluations.length === 0) {
      return "Ajoutez vos premières évaluations pour commencer à suivre vos progrès!";
    }

    if (diff >= 10) {
      return "🎉 Excellent travail! Vous dépassez largement votre objectif!";
    } else if (diff >= 5) {
      return "👏 Très bien! Vous êtes au-dessus de votre objectif!";
    } else if (diff >= 0) {
      return "✅ Bon travail! Vous avez atteint votre objectif!";
    } else if (diff >= -5) {
      return "💪 Vous êtes proche de votre objectif. Continuez vos efforts!";
    } else {
      return "📚 Il y a encore du travail, mais vous pouvez y arriver! Restez motivé!";
    }
  };

  const handleAddEvaluation = () => {
    if (evalName.trim() && evalNote && evalWeight) {
      addEvaluation(courseId, {
        name: evalName.trim(),
        note: parseFloat(evalNote),
        weight: parseFloat(evalWeight),
        type: evalType,
      });

      resetForm();
      setModalVisible(false);
    }
  };

  const handleUpdateEvaluation = () => {
    if (evalName.trim() && evalNote && evalWeight && editingEvalId) {
      updateEvaluation(courseId, editingEvalId, {
        name: evalName.trim(),
        note: parseFloat(evalNote),
        weight: parseFloat(evalWeight),
        type: evalType,
      });

      resetForm();
      setEditModalVisible(false);
      setEditingEvalId(null);
    }
  };

  const handleDeleteEvaluation = (evaluationId: string) => {
    deleteEvaluation(courseId, evaluationId);
    setMenuVisible(null);
  };

  const handleEditEvaluation = (evaluation: Evaluation) => {
    setEditingEvalId(evaluation.id);
    setEvalName(evaluation.name);
    setEvalNote(evaluation.note.toString());
    setEvalWeight(evaluation.weight.toString());
    setEvalType(evaluation.type);
    setMenuVisible(null);
    setEditModalVisible(true);
  };

  const resetForm = () => {
    setEvalName("");
    setEvalNote("");
    setEvalWeight("");
    setEvalType("travail");
  };

  const works = course.evaluations.filter((e) => e.type === "travail");
  const exams = course.evaluations.filter((e) => e.type === "examen");

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={26} />
        </TouchableOpacity>
        <Text style={styles.title}>{course.name}</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Circular Progress */}
        <View style={{ alignItems: "center", marginTop: 10 }}>
          <AnimatedCircularProgress
            size={150}
            width={12}
            fill={currentGrade}
            tintColor="#7f3dff"
            backgroundColor="#e6d8ff"
            rotation={0}
            lineCap="round"
          >
            {() => <Text style={styles.percentText}>{currentGrade}%</Text>}
          </AnimatedCircularProgress>

          <Text style={styles.objectif}>Objectif: {course.objective}%</Text>
        </View>

        {/* Encouragement message */}
        <View style={styles.encouragementBox}>
          <Text style={{ color: "#555", textAlign: "center" }}>
            {getEncouragementMessage()}
          </Text>
        </View>

        {/* Works Section */}
        {works.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Travaux</Text>
            {works.map((item) => (
              <EvaluationCard
                key={item.id}
                item={item}
                onMenuPress={(e) => {
                  const { pageY, pageX } = e.nativeEvent;
                  setMenuPosition({ top: pageY, left: pageX });
                  setMenuVisible(item.id);
                }}
              />
            ))}
          </>
        )}

        {/* Exams Section */}
        {exams.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Examens</Text>
            {exams.map((item) => (
              <EvaluationCard
                key={item.id}
                item={item}
                onMenuPress={(e) => {
                  const { pageY, pageX } = e.nativeEvent;
                  setMenuPosition({ top: pageY, left: pageX });
                  setMenuVisible(item.id);
                }}
              />
            ))}
          </>
        )}

        {/* Add evaluation button */}
        <TouchableOpacity
          style={styles.addEvalButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addEvalText}>+ Ajouter une évaluation</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Add Evaluation Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => {
            setModalVisible(false);
            resetForm();
          }}
        >
          <Pressable
            style={styles.modalContent}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={styles.modalTitle}>Ajouter une évaluation</Text>

            <TextInput
              style={styles.input}
              placeholder="Nom de l'évaluation"
              value={evalName}
              onChangeText={setEvalName}
              autoFocus
            />

            <TextInput
              style={styles.input}
              placeholder="Note (%)"
              value={evalNote}
              onChangeText={setEvalNote}
              keyboardType="numeric"
            />

            <TextInput
              style={styles.input}
              placeholder="Pondération (%)"
              value={evalWeight}
              onChangeText={setEvalWeight}
              keyboardType="numeric"
            />

            <View style={styles.typeSelector}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  evalType === "travail" && styles.typeButtonActive,
                ]}
                onPress={() => setEvalType("travail")}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    evalType === "travail" && styles.typeButtonTextActive,
                  ]}
                >
                  Travail
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.typeButton,
                  evalType === "examen" && styles.typeButtonActive,
                ]}
                onPress={() => setEvalType("examen")}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    evalType === "examen" && styles.typeButtonTextActive,
                  ]}
                >
                  Examen
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  resetForm();
                }}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.addButton]}
                onPress={handleAddEvaluation}
              >
                <Text style={styles.addButtonText}>Ajouter</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Edit Evaluation Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => {
            setEditModalVisible(false);
            resetForm();
            setEditingEvalId(null);
          }}
        >
          <Pressable
            style={styles.modalContent}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={styles.modalTitle}>Modifier l'évaluation</Text>

            <TextInput
              style={styles.input}
              placeholder="Nom de l'évaluation"
              value={evalName}
              onChangeText={setEvalName}
              autoFocus
            />

            <TextInput
              style={styles.input}
              placeholder="Note (%)"
              value={evalNote}
              onChangeText={setEvalNote}
              keyboardType="numeric"
            />

            <TextInput
              style={styles.input}
              placeholder="Pondération (%)"
              value={evalWeight}
              onChangeText={setEvalWeight}
              keyboardType="numeric"
            />

            <View style={styles.typeSelector}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  evalType === "travail" && styles.typeButtonActive,
                ]}
                onPress={() => setEvalType("travail")}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    evalType === "travail" && styles.typeButtonTextActive,
                  ]}
                >
                  Travail
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.typeButton,
                  evalType === "examen" && styles.typeButtonActive,
                ]}
                onPress={() => setEvalType("examen")}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    evalType === "examen" && styles.typeButtonTextActive,
                  ]}
                >
                  Examen
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setEditModalVisible(false);
                  resetForm();
                  setEditingEvalId(null);
                }}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.addButton]}
                onPress={handleUpdateEvaluation}
              >
                <Text style={styles.addButtonText}>Modifier</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Context Menu */}
      {menuVisible && (
        <>
          <Pressable
            style={styles.menuOverlay}
            onPress={() => setMenuVisible(null)}
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
                const evaluation = course.evaluations.find(
                  (e) => e.id === menuVisible
                );
                if (evaluation) handleEditEvaluation(evaluation);
              }}
            >
              <Ionicons name="create-outline" size={18} color="#333" />
              <Text style={styles.menuText}>Modifier</Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleDeleteEvaluation(menuVisible)}
            >
              <Ionicons name="trash-outline" size={18} color="#d32f2f" />
              <Text style={[styles.menuText, { color: "#d32f2f" }]}>
                Supprimer
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

// Card component
function EvaluationCard({
  item,
  onMenuPress,
}: {
  item: Evaluation;
  onMenuPress: (e: any) => void;
}) {
  return (
    <View style={styles.card}>
      <TouchableOpacity onPress={onMenuPress}>
        <Ionicons name="ellipsis-vertical" size={20} color="#555" />
      </TouchableOpacity>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardWeight}>Pondération {item.weight}%</Text>
      </View>

      <View
        style={[
          styles.noteBadge,
          { backgroundColor: item.note >= 75 ? "#c8f7c5" : "#f7c5c5" },
        ]}
      >
        <Text style={styles.noteText}>{item.note}%</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    marginTop: 60,
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  percentText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#7f3dff",
  },
  objectif: {
    marginTop: 10,
    fontSize: 18,
  },
  encouragementBox: {
    backgroundColor: "#e9e9e9",
    padding: 15,
    borderRadius: 10,
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 10,
  },
  card: {
    backgroundColor: "#f3f3f3",
    borderRadius: 12,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  cardTitle: { fontSize: 16, fontWeight: "600" },
  cardWeight: { fontSize: 13, color: "#555" },
  noteBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  noteText: { fontWeight: "bold", fontSize: 14 },
  addEvalButton: {
    backgroundColor: "#5900a1ff",
    padding: 18,
    borderRadius: 14,
    marginVertical: 30,
    alignItems: "center",
  },
  addEvalText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
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
    marginBottom: 15,
  },
  typeSelector: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  typeButtonActive: {
    backgroundColor: "#5900a1ff",
    borderColor: "#5900a1ff",
  },
  typeButtonText: {
    fontSize: 15,
    color: "#666",
    fontWeight: "600",
  },
  typeButtonTextActive: {
    color: "white",
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
    zIndex: 1000,
  },
});
