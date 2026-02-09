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
import { colors } from "../app/theme/colors";

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
    <View className="mb-8">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-lg font-semibold text-white">{title}</Text>
        {!isEditing && (
          <TouchableOpacity
            onPress={startEditing}
            className="bg-royal-violet px-4 py-2 rounded-lg"
          >
            <Text className="text-white font-medium">Modifier</Text>
          </TouchableOpacity>
        )}
      </View>

      {isEditing ? (
        <View>
          <View className="mb-3 bg-blue-900/30 rounded-lg p-3">
            <Text className="text-mauve text-xs">
              💡 Les seuils sont ajustés automatiquement. L'ordre des notes est préservé - chaque note doit avoir un minimum inférieur à la note précédente.
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
                className="flex-row items-center mb-2 rounded-xl bg-theme-surface-elevated px-4 py-3"
              >
                <Text className="text-white font-bold w-12">{boundary.letter}</Text>
                <Text className="text-mauve opacity-80 flex-1 text-sm">
                  {boundary.min}%-{boundary.max}% → GPA: {boundary.gpa}
                </Text>
                <TouchableOpacity
                  onPress={() => openEditModal(index)}
                  className="bg-royal-violet px-3 py-1 rounded mr-2"
                >
                  <Text className="text-white text-xs">Éditer</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => deleteBoundary(index)}
                  className="bg-red-600 px-3 py-1 rounded"
                >
                  <Text className="text-white text-xs">×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          <View className="flex-row gap-2 mt-4">
            <TouchableOpacity
              onPress={addBoundary}
              className="flex-1 bg-theme-success px-4 py-2 rounded-lg"
            >
              <Text className="text-white font-medium text-center">+ Ajouter</Text>
            </TouchableOpacity>
            {onReset && (
              <TouchableOpacity
                onPress={handleReset}
                className="flex-1 bg-orange-600 px-4 py-2 rounded-lg"
              >
                <Text className="text-white font-medium text-center">Réinitialiser</Text>
              </TouchableOpacity>
            )}
          </View>

          <View className="flex-row gap-2 mt-2">
            <TouchableOpacity
              onPress={cancelEditing}
              className="flex-1 bg-indigo-ink px-4 py-2 rounded-lg"
            >
              <Text className="text-white font-medium text-center">Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={saveChanges}
              className="flex-1 bg-violet-600 px-4 py-2 rounded-lg"
            >
              <Text className="text-white font-medium text-center">Enregistrer</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View>
          {boundaries.map((boundary, index) => (
            <View
              key={index}
              className="flex-row items-center justify-between mb-2 rounded-xl bg-theme-surface-elevated px-4 py-3"
            >
              <Text className="text-white font-bold w-12">{boundary.letter}</Text>
              <Text className="text-mauve opacity-80 flex-1">
                {boundary.min}%-{boundary.max}%
              </Text>
              <Text className="text-violet-400 font-medium">GPA: {boundary.gpa}</Text>
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
          className="flex-1 bg-dark-amethyst/90 justify-center items-center"
          onPress={() => setEditingIndex(null)}
        >
          <Pressable className="bg-theme-surface-elevated rounded-2xl p-6 w-80 border border-indigo-velvet" onPress={(e) => e.stopPropagation()}>
            <Text className="text-xl font-bold text-white mb-4">Modifier le seuil</Text>

            <Text className="text-white mb-2">Lettre</Text>
            <TextInput
              className="bg-indigo-ink text-white px-4 py-2 rounded-lg mb-4 border border-indigo-velvet"
              value={editForm.letter}
              onChangeText={(text) => setEditForm({ ...editForm, letter: text })}
              placeholder="Ex: A+"
              placeholderTextColor={colors.textPlaceholder}
            />

            <Text className="text-white mb-2">Minimum (%)</Text>
            <TextInput
              className="bg-indigo-ink text-white px-4 py-2 rounded-lg mb-4 border border-indigo-velvet"
              value={editForm.min}
              onChangeText={(text) => setEditForm({ ...editForm, min: text })}
              keyboardType="numeric"
              placeholder="Ex: 90"
              placeholderTextColor={colors.textPlaceholder}
              editable={editingIndex !== editingBoundaries.length - 1}
            />

            <Text className="text-zinc-400 text-xs mb-4 italic">
              {editingIndex === editingBoundaries.length - 1 
                ? "Le seuil le plus bas commence automatiquement à 0%"
                : "Le maximum sera automatiquement ajusté en fonction des autres seuils"}
            </Text>

            <Text className="text-white mb-2">Valeur GPA</Text>
            <TextInput
              className="bg-indigo-ink text-white px-4 py-2 rounded-lg mb-6 border border-indigo-velvet"
              value={editForm.gpa}
              onChangeText={(text) => setEditForm({ ...editForm, gpa: text })}
              keyboardType="numeric"
              placeholder="Ex: 4.0"
              placeholderTextColor={colors.textPlaceholder}
            />

            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={() => setEditingIndex(null)}
                className="flex-1 bg-indigo-ink px-4 py-2 rounded-lg"
              >
                <Text className="text-white font-medium text-center">Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={saveEdit}
                className="flex-1 bg-violet-600 px-4 py-2 rounded-lg"
              >
                <Text className="text-white font-medium text-center">Enregistrer</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};
