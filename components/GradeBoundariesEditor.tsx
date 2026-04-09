import React, { useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { GradeBoundary } from "../app/context/SettingsContext";

const CARD_BG = "#1A1729";
const CARD_BORDER = "#444462";
const ROW_BG = "#444462";

const cardShellStyle = {
  backgroundColor: CARD_BG,
  borderWidth: 1,
  borderColor: CARD_BORDER,
};

interface GradeBoundariesEditorProps {
  boundaries: GradeBoundary[];
  onUpdate: (boundaries: GradeBoundary[]) => void;
  onReset?: () => void;
  title?: string;
}

export const GradeBoundariesEditor: React.FC<GradeBoundariesEditorProps> = ({
  boundaries,
  onUpdate,
  onReset,
  title = "Seuils de notation",
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingBoundaries, setEditingBoundaries] = useState<GradeBoundary[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    letter: "",
    min: "",
    max: "",
    gpa: "",
  });

  const startEditing = () => {
    // Sort boundaries by min descending when starting edit mode to establish hierarchy
    const sorted = [...boundaries].sort((a, b) => b.min - a.min);
    setEditingBoundaries(sorted);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditingIndex(null);
  };

  const saveChanges = () => {
    // Auto-adjust boundaries one final time before saving
    const adjusted = autoAdjustBoundaries(editingBoundaries);

    // Validate that all boundaries are valid
    let hasError = false;
    for (const boundary of adjusted) {
      if (boundary.min < 0 || boundary.max > 100 || boundary.min > boundary.max) {
        hasError = true;
        break;
      }
    }

    if (hasError) {
      Alert.alert(
        "Erreur de validation",
        "Impossible de créer des seuils valides avec les valeurs actuelles."
      );
      return;
    }

    onUpdate(adjusted);
    setIsEditing(false);
    setEditingIndex(null);
  };

  const openEditModal = (index: number) => {
    const boundary = editingBoundaries[index];
    setEditForm({
      letter: boundary.letter,
      min: boundary.min.toString(),
      max: "", // Not used anymore since it's auto-calculated
      gpa: boundary.gpa.toString(),
    });
    setEditingIndex(index);
  };

  const autoAdjustBoundaries = (boundaries: GradeBoundary[]): GradeBoundary[] => {
    // Don't sort! Preserve the current order to maintain grade hierarchy
    // The order should already be from highest to lowest grade

    // Auto-adjust to ensure continuity
    const adjusted = boundaries.map((boundary, index) => {
      let adjustedBoundary = { ...boundary };

      // The first boundary (highest grade) should end at 100
      if (index === 0) {
        adjustedBoundary.max = 100;
      } else {
        // Each boundary's max should be (previous boundary's min - 1)
        adjustedBoundary.max = boundaries[index - 1].min - 1;
      }

      // The last boundary (lowest grade) should start at 0
      if (index === boundaries.length - 1) {
        adjustedBoundary.min = 0;
      }

      return adjustedBoundary;
    });

    return adjusted;
  };

  const saveEdit = () => {
    if (editingIndex === null) return;

    const min = parseFloat(editForm.min);
    const gpa = parseFloat(editForm.gpa);

    if (isNaN(min) || isNaN(gpa)) {
      Alert.alert("Erreur", "Veuillez entrer des valeurs numériques valides.");
      return;
    }

    if (min < 0 || min > 100) {
      Alert.alert("Erreur", "La valeur minimum doit être entre 0 et 100.");
      return;
    }

    // Validate that this min doesn't conflict with hierarchy
    // The lowest grade (last in list) will be forced to min=0, so skip validation for it
    const isLowestGrade = editingIndex === editingBoundaries.length - 1;

    // If not the first boundary, min must be less than previous boundary's min
    if (editingIndex > 0 && min >= editingBoundaries[editingIndex - 1].min) {
      Alert.alert(
        "Erreur",
        `Le minimum doit être inférieur à ${editingBoundaries[editingIndex - 1].min} (minimum de ${editingBoundaries[editingIndex - 1].letter})`
      );
      return;
    }

    // If not the last boundary, min must be greater than next boundary's min
    if (!isLowestGrade && editingIndex < editingBoundaries.length - 1) {
      const nextMin = editingBoundaries[editingIndex + 1].min;
      if (min <= nextMin) {
        Alert.alert(
          "Erreur",
          `Le minimum doit être supérieur à ${nextMin} (minimum de ${editingBoundaries[editingIndex + 1].letter})`
        );
        return;
      }
    }

    const updated = [...editingBoundaries];
    updated[editingIndex] = {
      letter: editForm.letter.trim() || updated[editingIndex].letter,
      min,
      max: min, // Will be auto-adjusted
      gpa,
    };

    // Auto-adjust all boundaries to maintain continuity (without sorting!)
    const adjusted = autoAdjustBoundaries(updated);
    setEditingBoundaries(adjusted);
    setEditingIndex(null);
  };

  const deleteBoundary = (index: number) => {
    Alert.alert(
      "Supprimer le seuil",
      `Êtes-vous sûr de vouloir supprimer ${editingBoundaries[index].letter}?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () => {
            const updated = editingBoundaries.filter((_, i) => i !== index);
            // Auto-adjust after deletion
            const adjusted = autoAdjustBoundaries(updated);
            setEditingBoundaries(adjusted);
          },
        },
      ]
    );
  };

  const addBoundary = () => {
    // Find a reasonable default min value (middle of available range)
    let defaultMin = 50; // Default to middle
    let insertIndex = editingBoundaries.length; // Default to end

    // Find where to insert the new boundary to maintain order
    if (editingBoundaries.length > 0) {
      // Try to place it in the middle of two existing boundaries
      if (editingBoundaries.length === 1) {
        defaultMin = Math.floor(editingBoundaries[0].min / 2);
        insertIndex = 1; // After the first
      } else {
        // Find the middle of the first two boundaries
        defaultMin = Math.floor((editingBoundaries[0].min + editingBoundaries[1].min) / 2);
        insertIndex = 1; // Between first and second
      }
    }

    const newBoundary: GradeBoundary = {
      letter: "X",
      min: defaultMin,
      max: defaultMin, // Will be auto-adjusted
      gpa: 2.0,
    };

    // Insert at the calculated position
    const updated = [
      ...editingBoundaries.slice(0, insertIndex),
      newBoundary,
      ...editingBoundaries.slice(insertIndex)
    ];

    const adjusted = autoAdjustBoundaries(updated);
    setEditingBoundaries(adjusted);

    // Open modal for the newly added boundary
    openEditModal(insertIndex);
  };

  const handleReset = () => {
    Alert.alert(
      "Réinitialiser les seuils",
      "Êtes-vous sûr de vouloir réinitialiser les seuils par défaut?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Réinitialiser",
          style: "destructive",
          onPress: () => {
            if (onReset) {
              onReset();
              setIsEditing(false);
              setEditingIndex(null);
            }
          },
        },
      ]
    );
  };

  return (
    <View className="rounded-2xl p-4 mb-3" style={cardShellStyle}>
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-lg font-pixel text-neutral-600 flex-1 pr-2">
          {title}
        </Text>
        {!isEditing && (
          <TouchableOpacity
            onPress={startEditing}
            className="rounded-2xl bg-violet-600 px-4 py-2"
          >
            <Text className="text-purple-100 font-pixel text-base font-medium">
              Modifier
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {isEditing ? (
        <View>
          <View
            className="mb-3 rounded-xl p-3"
            style={{ backgroundColor: `${ROW_BG}99` }}
          >
            <Text className="text-purple-200 font-pixel text-xs leading-5">
              Les seuils sont ajustés automatiquement. L&apos;ordre des notes est
              préservé — chaque note doit avoir un minimum inférieur à la note
              précédente.
            </Text>
          </View>

          <ScrollView
            nestedScrollEnabled
            showsVerticalScrollIndicator
            contentContainerStyle={{ paddingBottom: 8 }}
          >
            {editingBoundaries.map((boundary, index) => (
              <View
                key={index}
                className="flex-row items-center mb-2 rounded-xl px-4 py-3"
                style={{ backgroundColor: ROW_BG }}
              >
                <Text className="text-purple-100 font-pixel font-bold w-12">
                  {boundary.letter}
                </Text>
                <Text className="text-neutral-500 flex-1 text-sm font-pixel">
                  {boundary.min}%-{boundary.max}% → GPA: {boundary.gpa}
                </Text>
                <TouchableOpacity
                  onPress={() => openEditModal(index)}
                  className="rounded-lg px-3 py-1 mr-2"
                  style={{ backgroundColor: "#7b2cbf" }}
                >
                  <Text className="text-purple-100 font-pixel text-xs">Éditer</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => deleteBoundary(index)}
                  className="bg-red-600 px-3 py-1 rounded-lg"
                >
                  <Text className="text-purple-100 font-pixel text-xs">×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          <View className="flex-row gap-2 mt-4">
            <TouchableOpacity
              onPress={addBoundary}
              className="flex-1 rounded-xl px-4 py-3"
              style={{ backgroundColor: "#059669" }}
            >
              <Text className="text-purple-100 font-pixel font-medium text-center">
                + Ajouter
              </Text>
            </TouchableOpacity>
            {onReset && (
              <TouchableOpacity
                onPress={handleReset}
                className="flex-1 rounded-xl px-4 py-3"
                style={{ backgroundColor: "#c2410c" }}
              >
                <Text className="text-purple-100 font-pixel font-medium text-center">
                  Réinitialiser
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View className="flex-row gap-2 mt-2">
            <TouchableOpacity
              onPress={cancelEditing}
              className="flex-1 rounded-2xl border border-violet-100 py-3 px-4"
            >
              <Text className="text-purple-100 font-pixel font-medium text-center">
                Annuler
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={saveChanges}
              className="flex-1 rounded-2xl bg-violet-600 px-4 py-3"
            >
              <Text className="text-purple-100 font-pixel font-medium text-center">
                Enregistrer
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View>
          {boundaries.map((boundary, index) => (
            <View
              key={index}
              className="flex-row items-center justify-between mb-2 rounded-xl px-4 py-3"
              style={{ backgroundColor: ROW_BG }}
            >
              <Text className="text-purple-100 font-pixel font-bold w-12">
                {boundary.letter}
              </Text>
              <Text className="text-neutral-500 font-pixel flex-1">
                {boundary.min}%-{boundary.max}%
              </Text>
              <Text className="text-dark-accent font-pixel font-medium">
                GPA: {boundary.gpa}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Edit Modal */}
      <Modal
        visible={editingIndex !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setEditingIndex(null)}
      >
        <Pressable
          className="flex-1 bg-black/70 justify-center items-center"
          onPress={() => setEditingIndex(null)}
        >
          <Pressable
            className="rounded-2xl p-6 w-80 border"
            style={{ backgroundColor: CARD_BG, borderColor: CARD_BORDER }}
            onPress={(e) => e.stopPropagation()}
          >
            <Text className="text-xl font-pixel text-purple-100 mb-4">
              Modifier le seuil
            </Text>

            <Text className="text-neutral-600 font-pixel mb-2">Lettre</Text>
            <TextInput
              className="text-purple-100 px-4 py-2 rounded-xl mb-4 font-pixel"
              style={{ backgroundColor: ROW_BG }}
              value={editForm.letter}
              onChangeText={(text) => setEditForm({ ...editForm, letter: text })}
              placeholder="Ex: A+"
              placeholderTextColor="#6B7280"
            />

            <Text className="text-neutral-600 font-pixel mb-2">Minimum (%)</Text>
            <TextInput
              className="text-purple-100 px-4 py-2 rounded-xl mb-4 font-pixel"
              style={{ backgroundColor: ROW_BG }}
              value={editForm.min}
              onChangeText={(text) => setEditForm({ ...editForm, min: text })}
              keyboardType="numeric"
              placeholder="Ex: 90"
              placeholderTextColor="#6B7280"
              editable={editingIndex !== editingBoundaries.length - 1}
            />

            <Text className="text-neutral-500 text-xs mb-4 font-pixel">
              {editingIndex === editingBoundaries.length - 1
                ? "Le seuil le plus bas commence automatiquement à 0%"
                : "Le maximum sera automatiquement ajusté en fonction des autres seuils"}
            </Text>

            <Text className="text-neutral-600 font-pixel mb-2">Valeur GPA</Text>
            <TextInput
              className="text-purple-100 px-4 py-2 rounded-xl mb-6 font-pixel"
              style={{ backgroundColor: ROW_BG }}
              value={editForm.gpa}
              onChangeText={(text) => setEditForm({ ...editForm, gpa: text })}
              keyboardType="numeric"
              placeholder="Ex: 4.0"
              placeholderTextColor="#6B7280"
            />

            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={() => setEditingIndex(null)}
                className="flex-1 rounded-2xl border border-violet-100 py-3 px-4"
              >
                <Text className="text-purple-100 font-pixel font-medium text-center">
                  Annuler
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={saveEdit}
                className="flex-1 rounded-2xl bg-violet-600 px-4 py-3"
              >
                <Text className="text-purple-100 font-pixel font-medium text-center">
                  Enregistrer
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};
