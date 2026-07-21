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
  units: string;
  quantityPerUnit: string;
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
  const [searchQuery, setSearchQuery] = useState('');

  // Filter ingredients dynamically based on search query
  const filteredAvailableIngredients = useMemo(() => {
    return availableIngredients.filter((ing) =>
      ing.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [availableIngredients, searchQuery]);

  // Core Calculator: Safely parse rolling fractional strings to numbers
  const totals = useMemo(() => {
    return selectedItems.reduce(
      (acc, item) => {
        const parsedUnits = parseFloat(item.units) || 0;
        acc.calories += item.caloriesPerUnit * parsedUnits;
        acc.protein += item.proteinPerUnit * parsedUnits;
        acc.fiber += item.fiberPerUnit * parsedUnits;
        return acc;
      },
      { calories: 0, protein: 0, fiber: 0 }
    );
  }, [selectedItems]);

  const handleSelectIngredient = (ing: typeof availableIngredients[0]) => {
    if (selectedItems.some((item) => item.ingredientId === ing.id)) {
      setShowDropdown(false);
      setSearchQuery('');
      return;
    }

    setSelectedItems((prev) => [
      ...prev,
      {
        ingredientId: ing.id,
        name: ing.name,
        units: '1',
        quantityPerUnit: ing.quantityPerUnit,
        caloriesPerUnit: ing.caloriesPerUnit,
        proteinPerUnit: ing.proteinPerUnit,
        fiberPerUnit: ing.fiberPerUnit,
      },
    ]);
    setShowDropdown(false);
    setSearchQuery('');
  };

  const handleUpdateUnits = (id: string, text: string) => {
    setSelectedItems((prev) =>
      prev.map((item) => (item.ingredientId === id ? { ...item, units: text } : item))
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
        unitsUsed: parseFloat(item.units) || 0,
      })),
      totalCalories: parseFloat(totals.calories.toFixed(1)),
      totalProtein: parseFloat(totals.protein.toFixed(1)),
      totalFiber: parseFloat(totals.fiber.toFixed(1)),
    });

    setRecipeName('');
    setSelectedItems([]);
    setSearchQuery('');
    onClose();
  };

  return (
    <Modal visible={isVisible} animationType="slide" transparent onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardContainer}
          >
            <View style={styles.modalContainer}>
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
              <View style={styles.searchBlock}>
                <TouchableOpacity
                  style={styles.dropdownAnchor}
                  onPress={() => setShowDropdown(!showDropdown)}
                >
                  <Text style={styles.dropdownAnchorText}>Tap to pick from Kitchen...</Text>
                  <Ionicons
                    name={showDropdown ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>

                {/* Expandable Kitchen Stock Dropdown Overlay with Search */}
                {showDropdown && (
                  <View style={styles.dropdownListContainer}>
                    <View style={styles.searchBarContainer}>
                      <Ionicons name="search" size={16} color="#999" style={styles.searchIcon} />
                      <TextInput
                        style={styles.dropdownSearchInput}
                        placeholder="Search kitchen ingredients..."
                        placeholderTextColor="#999"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoFocus
                      />
                    </View>

                    <FlatList
                      data={filteredAvailableIngredients}
                      keyExtractor={(item) => item.id}
                      style={{ maxHeight: 150 }}
                      nestedScrollEnabled
                      keyboardShouldPersistTaps="handled"
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={styles.dropdownItem}
                          onPress={() => handleSelectIngredient(item)}
                        >
                          <Text style={styles.dropdownItemText}>{item.name}</Text>
                          <Text style={styles.dropdownItemSub}>
                            Per unit: {item.quantityPerUnit} | {item.caloriesPerUnit} kcal
                          </Text>
                        </TouchableOpacity>
                      )}
                      ListEmptyComponent={
                        <Text style={styles.dropdownEmptyText}>No ingredients found.</Text>
                      }
                    />
                  </View>
                )}
              </View>

              {/* Interactive Selected Items Sandbox Grid */}
              <Text style={[styles.inputLabel, { marginTop: 10 }]}>Selected Composition</Text>
              <View style={styles.selectedListContainer}>
                <FlatList
                  data={selectedItems}
                  keyExtractor={(item) => item.ingredientId}
                  style={styles.selectedItemsList}
                  showsVerticalScrollIndicator={true}
                  nestedScrollEnabled
                  renderItem={({ item }) => (
                    <View style={styles.selectedItemRow}>
                      <View style={styles.selectedItemInfo}>
                        <Text style={styles.selectedItemName} numberOfLines={1}>
                          {item.name}
                        </Text>
                        <Text style={styles.selectedItemMetric}>
                          Base unit: {item.quantityPerUnit}
                        </Text>
                      </View>

                      <View style={styles.unitInputContainer}>
                        <TextInput
                          style={styles.unitInput}
                          keyboardType="decimal-pad"
                          value={item.units}
                          onChangeText={(text) => handleUpdateUnits(item.ingredientId, text)}
                        />
                        <Text style={styles.unitLabel}>x units</Text>
                      </View>

                      <TouchableOpacity onPress={() => handleRemoveItem(item.ingredientId)}>
                        <Ionicons name="close-circle" size={22} color="#FF3B30" />
                      </TouchableOpacity>
                    </View>
                  )}
                  ListEmptyComponent={
                    <Text style={styles.emptySelectedText}>
                      No ingredients added yet. Pick from above.
                    </Text>
                  }
                />
              </View>

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
    justifyContent: 'flex-end', // Sheets open smoothly from bottom
  },
  keyboardContainer: {
    width: '100%',
    height: '92%', // Takes up 92% of screen height
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
    marginBottom: 16,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#F5F5F7',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: '#000',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  searchBlock: {
    position: 'relative',
    zIndex: 20,
    marginBottom: 6,
  },
  dropdownAnchor: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F5F5F7',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  dropdownAnchorText: {
    fontSize: 15,
    color: '#666',
  },
  dropdownListContainer: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 30,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F7',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 6,
  },
  dropdownSearchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: '#000',
  },
  dropdownItem: {
    flexDirection: 'column',
    justifyContent: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  dropdownItemText: {
    fontSize: 15,
    color: '#000',
    fontWeight: '500',
    marginBottom: 2,
  },
  dropdownItemSub: {
    fontSize: 13,
    color: '#8E8E93',
  },
  dropdownEmptyText: {
    textAlign: 'center',
    color: '#8E8E93',
    fontSize: 14,
    paddingVertical: 16,
  },
  selectedListContainer: {
    flex: 1, // Dynamically expands to fill all available space in the modal body
    marginVertical: 4,
  },
  selectedItemsList: {
    flex: 1,
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
  selectedItemInfo: {
    flex: 1,
    marginRight: 8,
  },
  selectedItemName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  selectedItemMetric: {
    fontSize: 12,
    color: '#8E8E93',
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
    width: 54,
    paddingVertical: 4,
    paddingHorizontal: 6,
    textAlign: 'center',
    fontSize: 14,
    color: '#000',
    fontWeight: '600',
  },
  unitLabel: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  emptySelectedText: {
    textAlign: 'center',
    color: '#8E8E93',
    fontSize: 14,
    marginVertical: 20,
  },
  macroDashboard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    paddingVertical: 10,
    marginBottom: 16,
    marginTop: 6,
  },
  macroMetric: {
    alignItems: 'center',
  },
  macroValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#007AFF',
  },
  macroLabelText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#666',
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  btn: {
    flex: 0.48,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnCancel: {
    backgroundColor: '#F2F2F7',
  },
  btnCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FF3B30',
  },
  btnSave: {
    backgroundColor: '#007AFF',
  },
  btnSaveText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFF',
  },
});