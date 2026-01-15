import { Evaluation, useCourses } from "@/app/context/CoursesContext";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
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
  const [isScheduled, setIsScheduled] = useState(false);
  const [gradeMode, setGradeMode] = useState<"percentage" | "fraction">(
    "percentage"
  );
  const [evalNote, setEvalNote] = useState("");
  const [evalNumerator, setEvalNumerator] = useState("");
  const [evalDenominator, setEvalDenominator] = useState("");
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

  // Calculate current total weight
  const getTotalWeight = (): number => {
    return course.evaluations.reduce((sum, e) => sum + e.weight, 0);
  };

  // Calculate total manual weight (excluding the one being edited)
  const getManualWeightTotal = (excludeId?: string): number => {
    return course.evaluations
      .filter((e) => e.id !== excludeId && !e.isAutoWeight)
      .reduce((sum, e) => sum + e.weight, 0);
  };

  // Validate note (0-100) - only required if not scheduled
  const validateNote = (): number | null => {
    if (isScheduled) return null; // Scheduled evaluations don't need a grade yet

    if (gradeMode === "percentage") {
      if (!evalNote.trim()) {
        Alert.alert("Erreur", "Veuillez entrer une note");
        return null;
      }
      const num = parseFloat(evalNote);
      if (isNaN(num) || num < 0 || num > 100) {
        Alert.alert("Erreur", "La note doit être entre 0 et 100%");
        return null;
      }
      return num;
    } else {
      // Fraction mode
      if (!evalNumerator.trim() || !evalDenominator.trim()) {
        Alert.alert(
          "Erreur",
          "Veuillez entrer la note obtenue et la note totale"
        );
        return null;
      }
      const numerator = parseFloat(evalNumerator);
      const denominator = parseFloat(evalDenominator);

      if (isNaN(numerator) || isNaN(denominator)) {
        Alert.alert("Erreur", "Les notes doivent être des nombres valides");
        return null;
      }

      if (denominator <= 0) {
        Alert.alert("Erreur", "La note totale doit être supérieure à 0");
        return null;
      }

      if (numerator < 0) {
        Alert.alert("Erreur", "La note obtenue ne peut pas être négative");
        return null;
      }

      if (numerator > denominator) {
        Alert.alert(
          "Erreur",
          "La note obtenue ne peut pas dépasser la note totale"
        );
        return null;
      }

      // Calculate percentage
      return Math.round((numerator / denominator) * 100 * 100) / 100;
    }
  };

  // Validate weight for manual entries only
  const validateManualWeight = (
    value: string,
    excludeId?: string
  ): number | null => {
    const num = parseFloat(value);
    if (isNaN(num) || num < 0 || num > 100) {
      Alert.alert("Erreur", "La pondération doit être entre 0 et 100%");
      return null;
    }

    const currentManualTotal = getManualWeightTotal(excludeId);
    if (currentManualTotal + num > 100) {
      Alert.alert(
        "Erreur",
        `La pondération manuelle totale ne peut pas dépasser 100%. Actuellement: ${currentManualTotal}%. Disponible: ${
          100 - currentManualTotal
        }%`
      );
      return null;
    }

    return num;
  };

  // Calculate current grade (only from completed evaluations)
  const calculateGrade = () => {
    const completed = course.evaluations.filter(
      (e) => !e.isScheduled && e.note !== null
    );
    if (completed.length === 0) return 0;

    const totalWeight = completed.reduce((sum, e) => sum + e.weight, 0);
    if (totalWeight === 0) return 0;

    const weightedSum = completed.reduce(
      (sum, e) => sum + e.note! * e.weight,
      0
    );

    return Math.round(weightedSum / totalWeight);
  };

  const currentGrade = calculateGrade();

  // Generate encouragement message
  const getEncouragementMessage = () => {
    const completed = course.evaluations.filter(
      (e) => !e.isScheduled && e.note !== null
    );
    const scheduled = course.evaluations.filter((e) => e.isScheduled);

    if (completed.length === 0 && scheduled.length === 0) {
      return "Ajoutez vos premières évaluations pour commencer à suivre vos progrès!";
    }

    if (completed.length === 0 && scheduled.length > 0) {
      return "📅 Vous avez des évaluations planifiées. Ajoutez vos notes au fur et à mesure!";
    }

    const diff = currentGrade - course.objective;

    if (scheduled.length > 0) {
      const target = scheduled[0].targetGrade || 100;
      return `🎯 Cible pour évaluations à venir: ${target.toFixed(
        1
      )}% pour atteindre ${course.objective}%`;
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
    if (!evalName.trim()) {
      Alert.alert("Erreur", "Veuillez entrer un nom d'évaluation");
      return;
    }

    const note = validateNote();
    if (note === null && !isScheduled) return;

    let weight: number;
    let isAutoWeight: boolean;

    if (!evalWeight.trim()) {
      // Auto weight - will be calculated by context
      weight = 0; // Placeholder, will be recalculated
      isAutoWeight = true;
    } else {
      // Manual weight
      const validatedWeight = validateManualWeight(evalWeight);
      if (validatedWeight === null) return;
      weight = validatedWeight;
      isAutoWeight = false;
    }

    addEvaluation(courseId, {
      name: evalName.trim(),
      note,
      weight,
      type: evalType,
      isAutoWeight,
      isScheduled,
    });

    resetForm();
    setModalVisible(false);
  };

  const handleUpdateEvaluation = () => {
    if (!evalName.trim()) {
      Alert.alert("Erreur", "Veuillez entrer un nom d'évaluation");
      return;
    }

    if (!editingEvalId) return;

    const note = validateNote();
    if (note === null && !isScheduled) return;

    let weight: number;
    let isAutoWeight: boolean;

    if (!evalWeight.trim()) {
      // Auto weight
      weight = 0; // Placeholder, will be recalculated
      isAutoWeight = true;
    } else {
      // Manual weight
      const validatedWeight = validateManualWeight(evalWeight, editingEvalId);
      if (validatedWeight === null) return;
      weight = validatedWeight;
      isAutoWeight = false;
    }

    updateEvaluation(courseId, editingEvalId, {
      name: evalName.trim(),
      note,
      weight,
      type: evalType,
      isAutoWeight,
      isScheduled,
    });

    resetForm();
    setEditModalVisible(false);
    setEditingEvalId(null);
  };

  const handleDeleteEvaluation = (evaluationId: string) => {
    deleteEvaluation(courseId, evaluationId);
    setMenuVisible(null);
  };

  const handleEditEvaluation = (evaluation: Evaluation) => {
    setEditingEvalId(evaluation.id);
    setEvalName(evaluation.name);
    setIsScheduled(evaluation.isScheduled);
    setGradeMode("percentage");
    setEvalNote(evaluation.note !== null ? evaluation.note.toString() : "");
    setEvalNumerator("");
    setEvalDenominator("");
    setEvalWeight(evaluation.isAutoWeight ? "" : evaluation.weight.toString());
    setEvalType(evaluation.type);
    setMenuVisible(null);
    setEditModalVisible(true);
  };

  const resetForm = () => {
    setEvalName("");
    setIsScheduled(false);
    setGradeMode("percentage");
    setEvalNote("");
    setEvalNumerator("");
    setEvalDenominator("");
    setEvalWeight("");
    setEvalType("travail");
  };

  const completed = course.evaluations.filter(
    (e) => !e.isScheduled && e.note !== null
  );
  const scheduled = course.evaluations.filter((e) => e.isScheduled);

  const completedWorks = completed.filter((e) => e.type === "travail");
  const completedExams = completed.filter((e) => e.type === "examen");
  const scheduledWorks = scheduled.filter((e) => e.type === "travail");
  const scheduledExams = scheduled.filter((e) => e.type === "examen");

  const totalWeight = getTotalWeight();
  const autoWeightCount = course.evaluations.filter(
    (e) => e.isAutoWeight
  ).length;
  const manualWeightTotal = course.evaluations
    .filter((e) => !e.isAutoWeight)
    .reduce((sum, e) => sum + e.weight, 0);

  const renderGradeInput = () => {
    if (isScheduled) {
      return (
        <View style={styles.scheduledInfo}>
          <Ionicons name="calendar-outline" size={20} color="#7f3dff" />
          <Text style={styles.scheduledText}>
            Évaluation planifiée - La note sera ajoutée plus tard
          </Text>
        </View>
      );
    }

    return (
      <>
        <View style={styles.gradeModeSelector}>
          <TouchableOpacity
            style={[
              styles.gradeModeButton,
              gradeMode === "percentage" && styles.gradeModeButtonActive,
            ]}
            onPress={() => setGradeMode("percentage")}
          >
            <Text
              style={[
                styles.gradeModeText,
                gradeMode === "percentage" && styles.gradeModeTextActive,
              ]}
            >
              Pourcentage
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.gradeModeButton,
              gradeMode === "fraction" && styles.gradeModeButtonActive,
            ]}
            onPress={() => setGradeMode("fraction")}
          >
            <Text
              style={[
                styles.gradeModeText,
                gradeMode === "fraction" && styles.gradeModeTextActive,
              ]}
            >
              Note sur...
            </Text>
          </TouchableOpacity>
        </View>

        {gradeMode === "percentage" ? (
          <TextInput
            style={styles.input}
            placeholder="Note (%)"
            value={evalNote}
            onChangeText={setEvalNote}
            keyboardType="numeric"
          />
        ) : (
          <View style={styles.fractionInputContainer}>
            <TextInput
              style={[styles.input, styles.fractionInput]}
              placeholder="Note"
              value={evalNumerator}
              onChangeText={setEvalNumerator}
              keyboardType="numeric"
            />
            <Text style={styles.fractionSlash}>/</Text>
            <TextInput
              style={[styles.input, styles.fractionInput]}
              placeholder="Total"
              value={evalDenominator}
              onChangeText={setEvalDenominator}
              keyboardType="numeric"
            />
          </View>
        )}
      </>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={26} />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
          {course.name}
        </Text>
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
          <Text style={styles.totalWeight}>
            Pondération totale: {totalWeight.toFixed(2)}%
            {totalWeight !== 100 && (
              <Text
                style={{ color: totalWeight > 100 ? "#d32f2f" : "#ff9800" }}
              >
                {" "}
                ({totalWeight > 100 ? "Dépasse" : "Reste"}{" "}
                {Math.abs(100 - totalWeight).toFixed(2)}%)
              </Text>
            )}
          </Text>
          {autoWeightCount > 0 && (
            <Text style={styles.autoWeightInfo}>
              {autoWeightCount} éval{autoWeightCount > 1 ? "s" : ""} auto (
              {((100 - manualWeightTotal) / autoWeightCount).toFixed(2)}%
              chacune)
            </Text>
          )}
        </View>

        {/* Encouragement message */}
        <View style={styles.encouragementBox}>
          <Text style={{ color: "#555", textAlign: "center" }}>
            {getEncouragementMessage()}
          </Text>
        </View>

        {/* Completed Works Section */}
        {completedWorks.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Travaux</Text>
            {completedWorks.map((item) => (
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

        {/* Completed Exams Section */}
        {completedExams.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Examens</Text>
            {completedExams.map((item) => (
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

        {/* Scheduled Works Section */}
        {scheduledWorks.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Travaux à venir</Text>
            {scheduledWorks.map((item) => (
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

        {/* Scheduled Exams Section */}
        {scheduledExams.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Examens à venir</Text>
            {scheduledExams.map((item) => (
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

            {/* Scheduled Toggle */}
            <TouchableOpacity
              style={styles.scheduledToggle}
              onPress={() => setIsScheduled(!isScheduled)}
            >
              <View style={styles.checkboxContainer}>
                <View
                  style={[
                    styles.checkbox,
                    isScheduled && styles.checkboxChecked,
                  ]}
                >
                  {isScheduled && (
                    <Ionicons name="checkmark" size={16} color="white" />
                  )}
                </View>
                <Text style={styles.checkboxLabel}>
                  Évaluation planifiée (note à venir)
                </Text>
              </View>
            </TouchableOpacity>

            {renderGradeInput()}

            <TextInput
              style={styles.input}
              placeholder="Pondération (%) - Auto si vide"
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

            {/* Scheduled Toggle */}
            <TouchableOpacity
              style={styles.scheduledToggle}
              onPress={() => setIsScheduled(!isScheduled)}
            >
              <View style={styles.checkboxContainer}>
                <View
                  style={[
                    styles.checkbox,
                    isScheduled && styles.checkboxChecked,
                  ]}
                >
                  {isScheduled && (
                    <Ionicons name="checkmark" size={16} color="white" />
                  )}
                </View>
                <Text style={styles.checkboxLabel}>
                  Évaluation planifiée (note à venir)
                </Text>
              </View>
            </TouchableOpacity>

            {renderGradeInput()}

            <TextInput
              style={styles.input}
              placeholder="Pondération (%) - Auto si vide"
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
  const isScheduled = item.isScheduled;
  const displayGrade = isScheduled
    ? `Cible: ${item.targetGrade?.toFixed(1) || "100"}%`
    : `${item.note}%`;

  return (
    <View style={[styles.card, isScheduled && styles.scheduledCard]}>
      <TouchableOpacity onPress={onMenuPress}>
        <Ionicons name="ellipsis-vertical" size={20} color="#555" />
      </TouchableOpacity>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle} numberOfLines={1} ellipsizeMode="tail">
          {item.name}
        </Text>
        <Text style={styles.cardWeight}>
          Pondération {item.weight.toFixed(2)}%
          {item.isAutoWeight && (
            <Text style={{ color: "#666", fontSize: 11 }}> (auto)</Text>
          )}
        </Text>
      </View>

      <View
        style={[
          styles.noteBadge,
          isScheduled
            ? { backgroundColor: "#e3d5ff" }
            : { backgroundColor: item.note! >= 75 ? "#c8f7c5" : "#f7c5c5" },
        ]}
      >
        <Text style={[styles.noteText, isScheduled && { color: "#7f3dff" }]}>
          {displayGrade}
        </Text>
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
    flex: 1,
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
  totalWeight: {
    marginTop: 5,
    fontSize: 14,
    color: "#666",
  },
  autoWeightInfo: {
    marginTop: 3,
    fontSize: 12,
    color: "#888",
    fontStyle: "italic",
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
  scheduledCard: {
    borderWidth: 2,
    borderColor: "#e3d5ff",
    borderStyle: "dashed",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  cardWeight: { fontSize: 13, color: "#555" },
  noteBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    minWidth: 70,
    alignItems: "center",
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
  gradeModeSelector: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 15,
  },
  gradeModeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  gradeModeButtonActive: {
    backgroundColor: "#7f3dff",
    borderColor: "#7f3dff",
  },
  gradeModeText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
  },
  gradeModeTextActive: {
    color: "white",
  },
  fractionInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 15,
  },
  fractionInput: {
    flex: 1,
    marginBottom: 0,
  },
  fractionSlash: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#666",
  },
  scheduledInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  scheduledText: {
    color: "#7f3dff",
    marginLeft: 6,
    fontSize: 14,
  },
  scheduledToggle: {
    marginBottom: 12,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ccc",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
  },
  checkboxChecked: {
    backgroundColor: "#7f3dff",
    borderColor: "#7f3dff",
  },
  checkboxLabel: {
    fontSize: 14,
    color: "#444",
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
