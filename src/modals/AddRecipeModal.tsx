import { useIngredientsStore } from '@/data/dataStores/ingredientsStore/useIngredientStore';
import { useRecipeStore } from '@/data/dataStores/recipeStore/useRecipeStore';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

interface AddRecipeModalProps {
  isVisible: boolean;
  onClose: () => void;
}

interface SelectedItem {
  ingredientId: string;
  name: string;
  units: number;
  caloriesPerUnit: number;
  proteinPerUnit: number;
  fiberPerUnit: number;
}

export const AddRecipeModal: React.FC<AddRecipeModalProps> = ({ isVisible, onClose }) => {
  const availableIngredients = useIngredientsStore((state) => state.ingredients);
  const addRecipe = useRecipeStore((state) => state.addRecipe);

  const [recipeName, setRecipeName] = useState('');
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // Core Calculator: Compute rolling totals instantly when selected items or quantities change
  const totals = useMemo(() => {
    return selectedItems.reduce(
      (acc, item) => {
        acc.calories += item.caloriesPerUnit * item.units;
        acc.protein += item.proteinPerUnit * item.units;
        acc.fiber += item.fiberPerUnit * item.units;
        return acc;
      },
      { calories: 0, protein: 0, fiber: 0 }
    );
  }, [selectedItems]);

  const handleSelectIngredient = (ing: typeof availableIngredients[0]) => {
    // Prevent adding duplicates into the construction matrix
    if (selectedItems.some((item) => item.ingredientId === ing.id)) {
      setShowDropdown(false);
      return;
    }

    setSelectedItems((prev) => [
      ...prev,
      {
        ingredientId: ing.id,
        name: ing.name,
        units: 1, // Default base scale multiplier
        caloriesPerUnit: ing.caloriesPerUnit,
        proteinPerUnit: ing.proteinPerUnit,
        fiberPerUnit: ing.fiberPerUnit,
      },
    ]);
    setShowDropdown(false);
  };

  const handleUpdateUnits = (id: string, text: string) => {
    const parsedUnits = parseFloat(text) || 0;
    setSelectedItems((prev) =>
      prev.map((item) => (item.ingredientId === id ? { ...item, units: parsedUnits } : item))
    );
  };

  const handleRemoveItem = (id: string) => {
    setSelectedItems((prev) => prev.filter((item) => item.ingredientId !== id));
  };

  const handleSaveRecipe = () => {
    if (!recipeName.trim()) {
      alert('Please enter a recipe name.');
      return;
    }
    if (selectedItems.length === 0) {
      alert('Please add at least one ingredient.');
      return;
    }

    addRecipe({
      id: Date.now().toString(),
      name: recipeName.trim(),
      ingredients: selectedItems.map((item) => ({
        ingredientId: item.ingredientId,
        name: item.name,
        unitsUsed: item.units,
      })),
      totalCalories: parseFloat(totals.calories.toFixed(1)),
      totalProtein: parseFloat(totals.protein.toFixed(1)),
      totalFiber: parseFloat(totals.fiber.toFixed(1)),
    });

    // Reset Sandbox State
    setRecipeName('');
    setSelectedItems([]);
    onClose();
  };

  return (
    <Modal visible={isVisible} animationType="fade" transparent onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContainer}
          >
            <Text style={styles.modalTitle}>Create Recipe</Text>

            {/* Recipe Title Field */}
            <Text style={styles.inputLabel}>Recipe Name</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g., High-Protein Chicken Curry"
              placeholderTextColor="#999"
              value={recipeName}
              onChangeText={setRecipeName}
            />

            {/* Ingredient Dropdown Anchor Button */}
            <Text style={styles.inputLabel}>Add Ingredients</Text>
            <TouchableOpacity
              style={styles.dropdownAnchor}
              onPress={() => setShowDropdown(!showDropdown)}
            >
              <Text style={styles.dropdownAnchorText}>Tap to pick from Kitchen...</Text>
              <Ionicons name={showDropdown ? 'chevron-up' : 'chevron-down'} size={20} color="#666" />
            </TouchableOpacity>

            {/* Expandable Kitchen Stock Dropdown Overlay */}
            {showDropdown && (
              <View style={styles.dropdownListContainer}>
                <FlatList
                  data={availableIngredients}
                  keyExtractor={(item) => item.id}
                  style={{ maxHeight: 160 }}
                  nestedScrollEnabled
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.dropdownItem}
                      onPress={() => handleSelectIngredient(item)}
                    >
                      <Text style={styles.dropdownItemText}>{item.name}</Text>
                      <Text style={styles.dropdownItemSub}>{item.caloriesPerUnit} kcal</Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            )}

            {/* Interactive Selected Items Sandbox Grid */}
            <Text style={[styles.inputLabel, { marginTop: 12 }]}>Selected Composition</Text>
            <FlatList
              data={selectedItems}
              keyExtractor={(item) => item.ingredientId}
              style={styles.selectedItemsList}
              nestedScrollEnabled
              renderItem={({ item }) => (
                <View style={styles.selectedItemRow}>
                  <Text style={styles.selectedItemName} numberOfLines={1}>
                    {item.name}
                  </Text>

                  <View style={styles.unitInputContainer}>
                    <TextInput
                      style={styles.unitInput}
                      keyboardType="numeric"
                      value={item.units.toString()}
                      onChangeText={(text) => handleUpdateUnits(item.ingredientId, text)}
                    />
                    <Text style={styles.unitLabel}>units</Text>
                  </View>

                  <TouchableOpacity onPress={() => handleRemoveItem(item.ingredientId)}>
                    <Ionicons name="close-circle" size={22} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
              )}
            />

            {/* Real-time Core Macro Output Monitor */}
            <View style={styles.macroDashboard}>
              <View style={styles.macroMetric}>
                <Text style={styles.macroValue}>{totals.calories.toFixed(0)}</Text>
                <Text style={styles.macroLabelText}>Calories</Text>
              </View>
              <View style={styles.macroMetric}>
                <Text style={styles.macroValue}>{totals.protein.toFixed(1)}g</Text>
                <Text style={styles.macroLabelText}>Protein</Text>
              </View>
              <View style={styles.macroMetric}>
                <Text style={styles.macroValue}>{totals.fiber.toFixed(1)}g</Text>
                <Text style={styles.macroLabelText}>Fiber</Text>
              </View>
            </View>

            {/* Footer Action Matrix */}
            <View style={styles.actionRow}>
              <TouchableOpacity style={[styles.btn, styles.btnCancel]} onPress={onClose}>
                <Text style={styles.btnCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, styles.btnSave]} onPress={handleSaveRecipe}>
                <Text style={styles.btnSaveText}>Save Recipe</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    width: '90%',
    maxWidth: 420,
    maxHeight: '85%',
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#F5F5F7',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  dropdownAnchor: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F5F5F7',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  dropdownAnchorText: {
    fontSize: 16,
    color: '#666',
  },
  dropdownListContainer: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 10,
    marginTop: 4,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  dropdownItemText: {
    fontSize: 15,
    color: '#000',
    fontWeight: '500',
  },
  dropdownItemSub: {
    fontSize: 13,
    color: '#8E8E93',
  },
  selectedItemsList: {
    maxHeight: 140,
    marginTop: 4,
    marginBottom: 16,
  },
  selectedItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFC',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  selectedItemName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  unitInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  unitInput: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#C7C7CC',
    borderRadius: 6,
    width: 50,
    paddingVertical: 4,
    paddingHorizontal: 6,
    textAlign: 'center',
    fontSize: 14,
    color: '#000',
    fontWeight: '600',
  },
  unitLabel: {
    fontSize: 13,
    color: '#666',
    marginLeft: 4,
  },
  macroDashboard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    paddingVertical: 12,
    marginBottom: 24,
    marginTop: 4,
  },
  macroMetric: {
    alignItems: 'center',
  },
  macroValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#007AFF',
  },
  macroLabelText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  btn: {
    marginBottom: 10,
    flex: 0.48,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnCancel: {
    marginBottom: 10,
    backgroundColor: '#F2F2F7',
  },
  btnCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
  },
  btnSave: {
    backgroundColor: '#007AFF',
  },
  btnSaveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
});