import { Evaluation, useCourses } from "@/app/context/CoursesContext";
import { GradeBoundary, useSettings } from "@/app/context/SettingsContext";
import { colors } from "@/app/theme/colors";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useLocalSearchParams, useRouter } from "expo-router";
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
import { AnimatedCircularProgress } from "react-native-circular-progress";
import { Swipeable } from "react-native-gesture-handler";
import AppBackground from "./AppBackground";
import { GradeBoundariesEditor } from "./GradeBoundariesEditor";

export default function DetailsCours() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const courseId = params.courseId as string;

  const { getCourse, addEvaluation, updateEvaluation, deleteEvaluation, updateCourseGradeBoundaries } =
    useCourses();
  const { getLetterGrade, getGPAFromPercentage, settings } = useSettings();
  const course = getCourse(courseId);

  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingEvalId, setEditingEvalId] = useState<string | null>(null);
  const [useCustomBoundaries, setUseCustomBoundaries] = useState(
    !!course?.customGradeBoundaries
  );

  // Form state
  const [evalName, setEvalName] = useState("");
  const [isScheduled, setIsScheduled] = useState(false);
  const [gradeMode, setGradeMode] = useState<"percentage" | "fraction">(
    "percentage",
  );
  const [evalNote, setEvalNote] = useState("");
  const [evalNumerator, setEvalNumerator] = useState("");
  const [evalDenominator, setEvalDenominator] = useState("");
  const [evalWeight, setEvalWeight] = useState("");
  const [evalType, setEvalType] = useState<"travail" | "examen">("travail");

  const [showDatePicker, setShowDatePicker] = useState(false);

  const [evalDate, setEvalDate] = useState<Date | null>(null);
  const [tempDate, setTempDate] = useState<Date>(new Date());

  // Error handling if course not found
  if (!course) {
    return (
      <AppBackground
        style={{
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ fontSize: 18, marginBottom: 20, color: colors.textOnDark }}>
          Cours introuvable
        </Text>
        <TouchableOpacity
          style={{
            padding: 15,
            backgroundColor: colors.primary,
            borderRadius: 10,
          }}
          onPress={() => router.back()}
        >
          <Text style={{ color: colors.white, fontSize: 16 }}>Retour</Text>
        </TouchableOpacity>
      </AppBackground>
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
          "Veuillez entrer la note obtenue et la note totale",
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
          "La note obtenue ne peut pas dépasser la note totale",
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
    excludeId?: string,
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
        }%`,
      );
      return null;
    }

    return num;
  };

  // Calculate current grade (only from completed evaluations)
  const calculateGrade = () => {
    const completed = course.evaluations.filter(
      (e) => !e.isScheduled && e.note !== null,
    );
    if (completed.length === 0) return 0;

    const totalWeight = completed.reduce((sum, e) => sum + e.weight, 0);
    if (totalWeight === 0) return 0;

    const weightedSum = completed.reduce(
      (sum, e) => sum + e.note! * e.weight,
      0,
    );

    return Math.round(weightedSum / totalWeight);
  };

  const currentGrade = calculateGrade();

  // Generate encouragement message
  const getEncouragementMessage = () => {
    const completed = course.evaluations.filter(
      (e) => !e.isScheduled && e.note !== null,
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
        1,
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
  const normalizeDateOrNull = (value: string): string | null => {
    const v = value.trim();
    if (!v) return null; // date facultative
    // format simple YYYY-MM-DD
    const ok = /^\d{4}-\d{2}-\d{2}$/.test(v);
    if (!ok) {
      Alert.alert("Erreur", "Format de date invalide. Utilise YYYY-MM-DD.");
      return null;
    }
    return v;
  };

  const handleAddEvaluation = () => {
    if (!evalName.trim()) {
      Alert.alert("Erreur", "Veuillez entrer un nom d'évaluation");
      return;
    }

    const note = validateNote();
    if (note === null && !isScheduled) return;

    const dateString = evalDate
      ? evalDate.toISOString().slice(0, 10) // "YYYY-MM-DD"
      : undefined;

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
      date: dateString,
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
    const dateString = evalDate
      ? evalDate.toISOString().slice(0, 10) // "YYYY-MM-DD"
      : undefined;

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
      date: dateString,
    });

    resetForm();
    setEditModalVisible(false);
    setEditingEvalId(null);
  };

  const handleDeleteEvaluation = (evaluationId: string) => {
    deleteEvaluation(courseId, evaluationId);
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
    setEditModalVisible(true);
    setEvalDate(evaluation.date ? new Date(evaluation.date) : null);
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
    setEvalDate(null);
  };

  const handleToggleCustomBoundaries = () => {
    const newValue = !useCustomBoundaries;
    setUseCustomBoundaries(newValue);
    
    if (!newValue) {
      // Removing custom boundaries - revert to general settings
      updateCourseGradeBoundaries(courseId, undefined);
    } else {
      // Enable custom boundaries - initialize with current general settings
      updateCourseGradeBoundaries(courseId, settings.gradeBoundaries);
    }
  };

  const handleUpdateCustomBoundaries = (boundaries: GradeBoundary[]) => {
    updateCourseGradeBoundaries(courseId, boundaries);
  };

  const completed = course.evaluations.filter(
    (e) => !e.isScheduled && e.note !== null,
  );
  const scheduled = course.evaluations.filter((e) => e.isScheduled);

  const completedWorks = completed.filter((e) => e.type === "travail");
  const completedExams = completed.filter((e) => e.type === "examen");
  const scheduledWorks = scheduled.filter((e) => e.type === "travail");
  const scheduledExams = scheduled.filter((e) => e.type === "examen");

  const totalWeight = getTotalWeight();
  const autoWeightCount = course.evaluations.filter(
    (e) => e.isAutoWeight,
  ).length;
  const manualWeightTotal = course.evaluations
    .filter((e) => !e.isAutoWeight)
    .reduce((sum, e) => sum + e.weight, 0);

  const renderGradeInput = () => {
    if (isScheduled) {
      return (
        <View style={styles.scheduledInfo}>
          <Ionicons name="calendar-outline" size={20} color={colors.lavenderPurple} />
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
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("fr-CA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <AppBackground>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={26} color={colors.textOnDark} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.textOnDark }]} numberOfLines={1} ellipsizeMode="tail">
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
            tintColor={colors.lavenderPurple}
            backgroundColor={colors.mauve + "30"}
            rotation={0}
            lineCap="round"
          >
            {() => <Text style={styles.percentText}>{currentGrade}%</Text>}
          </AnimatedCircularProgress>

          {completed.length > 0 && (
            <View style={styles.letterGradeContainer}>
              <Text style={styles.letterGradeLabel}>Note de lettre:</Text>
              <Text style={styles.letterGrade}>
                {getLetterGrade(currentGrade, course.customGradeBoundaries)}
              </Text>
              <Text style={styles.gpaLabel}>
                GPA: {getGPAFromPercentage(currentGrade, course.customGradeBoundaries).toFixed(2)}
              </Text>
            </View>
          )}

          <Text style={styles.objectif}>Objectif: {course.objective}%</Text>
          <Text style={styles.totalWeight}>
            Pondération totale: {totalWeight.toFixed(2)}%
            {totalWeight !== 100 && (
              <Text
                style={{ color: totalWeight > 100 ? colors.error : colors.warning }}
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
          <Text style={{ color: colors.textOnDark, textAlign: "center" }}>
            {getEncouragementMessage()}
          </Text>
        </View>

        {/* Custom Grade Boundaries Section */}
        <View style={styles.customBoundariesSection}>
          <View style={styles.customBoundariesHeader}>
            <Text style={styles.customBoundariesTitle}>
              Seuils de notation personnalisés
            </Text>
            <TouchableOpacity
              onPress={handleToggleCustomBoundaries}
              style={styles.toggleButton}
            >
              <View
                style={[
                  styles.toggleCircle,
                  useCustomBoundaries && styles.toggleCircleActive,
                ]}
              />
            </TouchableOpacity>
          </View>
          
          {useCustomBoundaries && course.customGradeBoundaries && (
            <View style={{ marginTop: 10 }}>
              <GradeBoundariesEditor
                boundaries={course.customGradeBoundaries}
                onUpdate={handleUpdateCustomBoundaries}
                title=""
              />
            </View>
          )}
          
          {!useCustomBoundaries && (
            <Text style={styles.customBoundariesHint}>
              Utilisez les seuils de notation généraux définis dans les paramètres
            </Text>
          )}
        </View>

        {/* Completed Works Section */}
        {completedWorks.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Devoirs</Text>
            {completedWorks.map((item) => (
              <EvaluationCard
                key={item.id}
                item={item}
                onPress={() => handleEditEvaluation(item)}
                onDelete={(id) => handleDeleteEvaluation(id)}
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
                onPress={() => handleEditEvaluation(item)}
                onDelete={(id) => handleDeleteEvaluation(id)}
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
                onPress={() => handleEditEvaluation(item)}
                onDelete={(id) => handleDeleteEvaluation(id)}
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
                onPress={() => handleEditEvaluation(item)}
                onDelete={(id) => handleDeleteEvaluation(id)}
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
              style={[styles.modalContent, { maxHeight: "80%" }]}
              onPress={(e) => e.stopPropagation()}
            >
              <ScrollView
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
              >
                <Text style={styles.modalTitle}>Ajouter une évaluation</Text>

                <TextInput
                  style={styles.input}
                  placeholder="Nom de l'évaluation"
                  value={evalName}
                  onChangeText={setEvalName}
                  autoFocus
                />
                <TouchableOpacity
                  style={styles.dateField}
                  onPress={() => {
                    setTempDate(evalDate ?? new Date());
                    setShowDatePicker(true);
                  }}
                >
                  <Ionicons name="calendar-outline" size={18} color={colors.textDark} />
                  <Text style={styles.dateFieldText}>
                    {evalDate
                      ? evalDate.toLocaleDateString("fr-CA", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "Choisir une date"}
                  </Text>
                </TouchableOpacity>

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
                        <Ionicons name="checkmark" size={16} color={colors.white} />
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
                      Devoir
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
              </ScrollView>
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>

        {modalVisible && (
          <Modal visible={showDatePicker} transparent animationType="slide">
            <Pressable
              style={styles.modalOverlay}
              onPress={() => setShowDatePicker(false)}
            >
              <View
                style={{
                  backgroundColor: colors.white,
                  borderRadius: 20,
                  padding: 20,
                  width: "90%",
                }}
              >
                <Text style={styles.sheetTitle}>Choisir une date</Text>
                <DateTimePicker
                  value={tempDate}
                  mode="date"
                  display="spinner"
                  onChange={(event, selectedDate) => {
                    if (selectedDate) setTempDate(selectedDate);
                  }}
                />
                <TouchableOpacity
                  style={styles.confirmDateButton}
                  onPress={() => {
                    setEvalDate(tempDate);
                    setShowDatePicker(false);
                  }}
                >
                  <Text style={styles.confirmDateText}>Confirmer</Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          </Modal>
        )}
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
              style={[styles.modalContent, { maxHeight: "80%" }]}
              onPress={(e) => e.stopPropagation()}
            >
              <ScrollView
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
              >
                <Text style={styles.modalTitle}>Modifier l'évaluation</Text>

                <TextInput
                  style={styles.input}
                  placeholder="Nom de l'évaluation"
                  value={evalName}
                  onChangeText={setEvalName}
                  autoFocus
                />
                <TouchableOpacity
                  style={styles.dateField}
                  onPress={() => {
                    setTempDate(evalDate ?? new Date());
                    setShowDatePicker(true);
                  }}
                >
                  <Ionicons name="calendar-outline" size={18} color={colors.textDark} />
                  <Text style={styles.dateFieldText}>
                    {evalDate ? formatDate(evalDate) : "Choisir une date"}
                  </Text>
                </TouchableOpacity>

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
                        <Ionicons name="checkmark" size={16} color={colors.white} />
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
                      Devoir
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
              </ScrollView>
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
        {editModalVisible && (
          <Modal visible={showDatePicker} transparent animationType="slide">
            <Pressable
              style={styles.modalOverlay}
              onPress={() => setShowDatePicker(false)}
            >
              <View
                style={{
                  backgroundColor: colors.white,
                  borderRadius: 20,
                  padding: 20,
                  width: "90%",
                }}
              >
                <Text style={styles.sheetTitle}>Choisir une date</Text>
                <DateTimePicker
                  value={tempDate}
                  mode="date"
                  display="spinner"
                  onChange={(event, selectedDate) => {
                    if (selectedDate) setTempDate(selectedDate);
                  }}
                />
                <TouchableOpacity
                  style={styles.confirmDateButton}
                  onPress={() => {
                    setEvalDate(tempDate);
                    setShowDatePicker(false);
                  }}
                >
                  <Text style={styles.confirmDateText}>Confirmer</Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          </Modal>
        )}
      </Modal>

      {/* Context Menu */}
    </AppBackground>
  );
}

// Card component
function EvaluationCard({
  item,
  onPress,
  onDelete,
}: {
  item: Evaluation;
  onPress: () => void;
  onDelete: (id: string) => void;
}) {
  const swipeRef = useRef<Swipeable>(null);
  const parseLocalDate = (s: string) => {
    const [y, m, d] = s.split("-").map(Number);
    return new Date(y, m - 1, d);
  };
  const displayDate = item.date
    ? parseLocalDate(item.date).toLocaleDateString("fr-CA", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  const confirmDelete = () => {
    Alert.alert(
      "Supprimer l’évaluation",
      `Souhaitez-vous vraiment supprimer "${item.name}" ?`,
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
            onDelete(item.id);
            swipeRef.current?.close();
          },
        },
      ],
      { cancelable: true },
    );
  };

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>,
  ) => {
    // dragX est négatif quand on swipe vers la gauche
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
          width: 88, // zone d’action plus petite
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
            <Ionicons name="trash-outline" size={22} color={colors.white} />
          </Animated.View>
        </Animated.View>
      </View>
    );
  };

  const isScheduled = item.isScheduled;
  const displayGrade = isScheduled
    ? `Cible: ${item.targetGrade?.toFixed(1) || "100"}%`
    : `${item.note}%`;

  return (
    <Swipeable
      ref={swipeRef}
      renderRightActions={renderRightActions}
      rightThreshold={70} // swipe “assez loin” => open => confirm
      friction={2}
      overshootRight={false}
      onSwipeableOpen={(direction) => {
        if (direction === "right") confirmDelete();
      }}
    >
      <TouchableOpacity activeOpacity={0.85} onPress={onPress}>
        <View style={[styles.card, isScheduled && styles.scheduledCard]}>
          <View style={{ flex: 1 }}>
            <Text
              style={styles.cardTitle}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item.name}
            </Text>

            <Text style={styles.cardWeight}>
              Pondération {item.weight.toFixed(2)}%
              {item.isAutoWeight && (
                <Text style={{ color: colors.textOnDarkMuted, fontSize: 11 }}> (auto)</Text>
              )}
            </Text>

            {displayDate && (
              <Text style={styles.cardDate}>📅 {displayDate}</Text>
            )}
          </View>

          <View
            style={[
              styles.noteBadge,
              isScheduled
                ? { backgroundColor: colors.mauve + "40" }
                : { backgroundColor: item.note! >= 75 ? colors.success + "40" : colors.error + "30" },
            ]}
          >
            <Text
              style={[styles.noteText, isScheduled && { color: colors.lavenderPurple }]}
            >
              {displayGrade}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  header: {
    marginTop: 60,
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    flex: 1,
    color: colors.textOnDark,
  },
  percentText: {
    fontSize: 32,
    fontWeight: "bold",
    color: colors.mauve,
  },
  letterGradeContainer: {
    marginTop: 12,
    alignItems: "center",
  },
  letterGradeLabel: {
    fontSize: 14,
    color: colors.textOnDarkMuted,
    marginBottom: 4,
  },
  letterGrade: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.lavenderPurple,
  },
  gpaLabel: {
    fontSize: 14,
    color: colors.textOnDarkMuted,
    marginTop: 4,
  },
  objectif: {
    marginTop: 10,
    fontSize: 18,
    color: colors.textOnDark,
  },
  totalWeight: {
    marginTop: 5,
    fontSize: 14,
    color: colors.textOnDarkMuted,
  },
  autoWeightInfo: {
    marginTop: 3,
    fontSize: 12,
    color: colors.textOnDarkMuted,
    fontStyle: "italic",
  },
  encouragementBox: {
    backgroundColor: colors.surfaceElevated,
    padding: 15,
    borderRadius: 10,
    marginVertical: 20,
    borderWidth: 1,
    borderColor: colors.indigoVelvet,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 10,
    color: colors.textOnDark,
  },
  card: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 12,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.indigoVelvet,
  },
  scheduledCard: {
    borderWidth: 2,
    borderColor: colors.mauve + "80",
    borderStyle: "dashed",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
    color: colors.textOnDark,
  },
  cardWeight: { fontSize: 13, color: colors.textOnDarkMuted },
  noteBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    minWidth: 70,
    alignItems: "center",
  },
  noteText: { fontWeight: "bold", fontSize: 14, color: colors.textOnDark },
  addEvalButton: {
    backgroundColor: colors.primary,
    padding: 18,
    borderRadius: 14,
    marginVertical: 30,
    alignItems: "center",
  },
  addEvalText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
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
    borderColor: colors.borderMuted,
    alignItems: "center",
    backgroundColor: colors.surfaceLight,
  },
  gradeModeButtonActive: {
    backgroundColor: colors.lavenderPurple,
    borderColor: colors.lavenderPurple,
  },
  gradeModeText: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: "600",
  },
  gradeModeTextActive: {
    color: colors.white,
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
    color: colors.textMuted,
  },
  scheduledInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  scheduledText: {
    color: colors.lavenderPurple,
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
    borderColor: colors.borderMuted,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
  },
  checkboxChecked: {
    backgroundColor: colors.lavenderPurple,
    borderColor: colors.lavenderPurple,
  },
  checkboxLabel: {
    fontSize: 14,
    color: colors.textDark,
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
    borderColor: colors.borderMuted,
    alignItems: "center",
    backgroundColor: colors.surfaceLight,
  },
  typeButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  typeButtonText: {
    fontSize: 15,
    color: colors.textMuted,
    fontWeight: "600",
  },
  typeButtonTextActive: {
    color: colors.white,
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
    zIndex: 1000,
  },
  cardDate: {
    fontSize: 12,
    color: colors.textOnDarkMuted,
    marginTop: 2,
  },
  dateField: {
    borderWidth: 1,
    borderColor: colors.borderMuted,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  dateFieldText: {
    fontSize: 16,
    color: colors.textDark,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 15,
  },

  confirmDateButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 20,
    alignItems: "center",
  },

  confirmDateText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  customBoundariesSection: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 12,
    padding: 15,
    marginVertical: 15,
    borderWidth: 1,
    borderColor: colors.indigoVelvet,
  },
  customBoundariesHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  customBoundariesTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textOnDark,
    flex: 1,
  },
  toggleButton: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.indigoInk,
    justifyContent: "center",
    padding: 3,
  },
  toggleCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.mauve,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleCircleActive: {
    backgroundColor: colors.primary,
    alignSelf: "flex-end",
  },
  customBoundariesHint: {
    fontSize: 13,
    color: colors.textOnDarkMuted,
    fontStyle: "italic",
  },
});
