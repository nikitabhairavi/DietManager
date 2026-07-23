import { FoodImage } from '@/components/kitchen/FoodImage';
import { useIngredientsStore } from '@/data/dataStores/ingredientsStore/useIngredientStore';
import { LoggedMeal, useMealsStore } from '@/data/dataStores/meals/useMealsStore';
import { useRecipeStore } from '@/data/dataStores/recipeStore/useRecipeStore';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import {
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface LogMealModalProps {
    isVisible: boolean;
    onClose: () => void;
    targetDateString: string;
    mealToEdit?: LoggedMeal | null;
}

/**
 * Parses user input strings like "1/2", "3/4", "1 1/2", or "1.5" into a numeric decimal float.
 */
const parseQuantity = (value: string | number): number => {
    if (typeof value === 'number') return isNaN(value) ? 0 : value;
    if (!value || typeof value !== 'string') return 0;

    const trimmed = value.trim();
    if (!trimmed) return 0;

    // Handle mixed numbers like "1 1/2"
    if (trimmed.includes(' ')) {
        const parts = trimmed.split(/\s+/);
        if (parts.length === 2) {
            const whole = parseFloat(parts[0]);
            const frac = parseQuantity(parts[1]);
            return (isNaN(whole) ? 0 : whole) + frac;
        }
    }

    // Handle standard fractions like "1/2" or "3/4"
    if (trimmed.includes('/')) {
        const [numerator, denominator] = trimmed.split('/');
        const num = parseFloat(numerator);
        const den = parseFloat(denominator);
        if (!isNaN(num) && !isNaN(den) && den !== 0) {
            return num / den;
        }
    }

    const parsed = parseFloat(trimmed);
    return isNaN(parsed) ? 0 : parsed;
};

export const LogMealModal: React.FC<LogMealModalProps> = ({
    isVisible,
    onClose,
    targetDateString,
    mealToEdit,
}) => {
    const recipes = useRecipeStore((state) => state.recipes);
    const ingredients = useIngredientsStore((state) => state.ingredients);
    const logMeal = useMealsStore((state) => state.logMeal);
    const removeMeal = useMealsStore((state) => state.removeMeal);

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedItem, setSelectedItem] = useState<{
        id: string;
        name: string;
        calories: number;
        protein: number;
        fiber: number;
    } | null>(null);

    const [rawPortionInput, setRawPortionInput] = useState('1');
    const [showDropdown, setShowDropdown] = useState(false);

    // Sync state when modal opens or when editing an existing meal
    useEffect(() => {
        if (isVisible) {
            if (mealToEdit) {
                setSelectedItem({
                    id: mealToEdit.recipeId,
                    name: mealToEdit.name,
                    // Re-derive base macros by dividing out the existing portion size
                    calories: mealToEdit.totalCalories / (mealToEdit.portionSize || 1),
                    protein: mealToEdit.totalProtein / (mealToEdit.portionSize || 1),
                    fiber: mealToEdit.totalFiber / (mealToEdit.portionSize || 1),
                });
                setRawPortionInput(mealToEdit.portionSize.toString());
                setSearchQuery(mealToEdit.name);
            } else {
                setSelectedItem(null);
                setRawPortionInput('1');
                setSearchQuery('');
            }
            setShowDropdown(false);
        }
    }, [isVisible, mealToEdit]);

    // Combine recipes and individual ingredients into a unified searchable selection pool
    const selectableCatalog = useMemo(() => {
        const recipeItems = recipes.map((r) => ({
            id: r.id,
            name: r.name,
            calories: r.totalCalories,
            protein: r.totalProtein,
            fiber: r.totalFiber,
            type: 'Recipe' as const,
        }));

        const ingredientItems = ingredients.map((i) => ({
            id: i.id,
            name: `${i.name} (${i.quantityPerUnit})`,
            calories: i.caloriesPerUnit,
            protein: i.proteinPerUnit,
            fiber: i.fiberPerUnit,
            type: 'Ingredient' as const,
        }));

        return [...recipeItems, ...ingredientItems];
    }, [recipes, ingredients]);

    const filteredCatalog = useMemo(() => {
        if (!searchQuery.trim()) return [];
        return selectableCatalog.filter((item) =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery, selectableCatalog]);

    // Live calculation of macros based on fraction/decimal portion input
    const numericPortion = parseQuantity(rawPortionInput);
    const previewMacros = useMemo(() => {
        if (!selectedItem) return { calories: 0, protein: 0, fiber: 0 };
        return {
            calories: selectedItem.calories * numericPortion,
            protein: selectedItem.protein * numericPortion,
            fiber: selectedItem.fiber * numericPortion,
        };
    }, [selectedItem, numericPortion]);

    const handleSelectCatalogItem = (item: (typeof selectableCatalog)[0]) => {
        setSelectedItem(item);
        setSearchQuery(item.name);
        setShowDropdown(false);
    };

    const handleSaveLog = () => {
        if (!selectedItem) {
            alert('Please select a recipe or ingredient to log.');
            return;
        }

        if (numericPortion <= 0) {
            alert('Portion size must be greater than zero.');
            return;
        }

        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        // If editing, remove the old entry first before logging the updated one
        if (mealToEdit) {
            removeMeal(targetDateString, mealToEdit.id);
        }

        logMeal(
            targetDateString,
            {
                recipeId: selectedItem.id,
                name: selectedItem.name,
                portionSize: numericPortion,
                loggedAtTime: mealToEdit ? mealToEdit.loggedAtTime : timeString,
            },
            {
                calories: selectedItem.calories,
                protein: selectedItem.protein,
                fiber: selectedItem.fiber,
            }
        );

        onClose();
    };

    return (
        <Modal visible={isVisible} animationType="slide" transparent onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardContainer}
                >
                    <View style={styles.modalContainer}>
                        {/* Modal Header */}
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {mealToEdit ? 'Edit Logged Meal' : 'Log Food Entry'}
                            </Text>
                            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                <Ionicons name="close" size={24} color="#1C1C1E" />
                            </TouchableOpacity>
                        </View>

                        {/* Search & Select Field */}
                        <View style={styles.searchBlock}>
                            <Text style={styles.sectionLabel}>Search Recipe or Ingredient</Text>
                            <TextInput
                                style={styles.textInput}
                                value={searchQuery}
                                onChangeText={(text) => {
                                    setSearchQuery(text);
                                    setShowDropdown(text.trim().length > 0);
                                    if (selectedItem && text !== selectedItem.name) {
                                        setSelectedItem(null); // Reset selection if typing a new search
                                    }
                                }}
                                placeholder="Type to search catalog..."
                                placeholderTextColor="#8E8E93"
                            />

                            {showDropdown && filteredCatalog.length > 0 && (
                                <View style={styles.searchDropdownContainer}>
                                    <FlatList
                                        data={filteredCatalog}
                                        keyExtractor={(item) => item.id}
                                        style={{ maxHeight: 200 }}
                                        nestedScrollEnabled
                                        keyboardShouldPersistTaps="handled"
                                        renderItem={({ item }) => (
                                            <TouchableOpacity
                                                style={styles.dropdownOptionRow}
                                                onPress={() => handleSelectCatalogItem(item)}
                                            >
                                                <View style={styles.dropdownLeftContainer}>
                                                    <FoodImage name={item.name} size={28} />
                                                    <Text style={styles.dropdownOptionText} numberOfLines={1}>
                                                        {item.name}
                                                    </Text>
                                                </View>
                                                <Text style={styles.dropdownOptionSubText}>
                                                    {item.calories.toFixed(0)} kcal
                                                </Text>
                                            </TouchableOpacity>
                                        )}
                                    />
                                </View>
                            )}
                        </View>

                        {/* Portion Size Input (Supports fractions like 1/2 or 1 1/2) */}
                        <Text style={styles.sectionLabel}>Portion Multiplier / Quantity</Text>
                        <TextInput
                            style={styles.textInput}
                            keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'default'}
                            value={rawPortionInput}
                            onChangeText={setRawPortionInput}
                            placeholder="e.g., 1, 1/2, or 1 1/2"
                            placeholderTextColor="#8E8E93"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />

                        {/* Live Macro Summary Preview Dashboard */}
                        {selectedItem && (
                            <View style={styles.previewContainer}>
                                <Text style={styles.previewHeaderLabel}>Scaled Entry Preview</Text>
                                <View style={styles.macroDashboard}>
                                    <View style={[styles.macroBadge, { backgroundColor: '#E1F0FF' }]}>
                                        <Text style={styles.macroValueText}>{previewMacros.calories.toFixed(0)}</Text>
                                        <Text style={[styles.macroLabelText, { color: '#007AFF' }]}>kcal</Text>
                                    </View>
                                    <View style={[styles.macroBadge, { backgroundColor: '#E8F5E8' }]}>
                                        <Text style={styles.macroValueText}>{previewMacros.protein.toFixed(1)}g</Text>
                                        <Text style={[styles.macroLabelText, { color: '#34C759' }]}>Protein</Text>
                                    </View>
                                    <View style={[styles.macroBadge, { backgroundColor: '#F3E5F5' }]}>
                                        <Text style={styles.macroValueText}>{previewMacros.fiber.toFixed(1)}g</Text>
                                        <Text style={[styles.macroLabelText, { color: '#AF52DE' }]}>Fiber</Text>
                                    </View>
                                </View>
                            </View>
                        )}

                        {/* Action Submit Button */}
                        <TouchableOpacity
                            style={[styles.commitSaveButton, !selectedItem && styles.disabledButton]}
                            activeOpacity={0.8}
                            onPress={handleSaveLog}
                            disabled={!selectedItem}
                        >
                            <Text style={styles.commitSaveButtonText}>
                                {mealToEdit ? 'Save Changes' : 'Confirm & Log Entry'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'flex-end',
    },
    keyboardContainer: {
        width: '100%',
        height: '80%',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1C1C1E',
    },
    sectionLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#8E8E93',
        textTransform: 'uppercase',
        marginBottom: 6,
        marginTop: 14,
    },
    textInput: {
        backgroundColor: '#F2F2F7',
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 16,
        color: '#000000',
        borderWidth: 1,
        borderColor: '#E5E5EA',
    },
    searchBlock: {
        position: 'relative',
        zIndex: 20,
    },
    searchDropdownContainer: {
        position: 'absolute',
        top: 80,
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E5EA',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
        zIndex: 30,
    },
    dropdownOptionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F2F2F7',
    },
    dropdownLeftContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        flex: 1,
        paddingRight: 10,
    },
    dropdownOptionText: {
        fontSize: 15,
        color: '#000000',
        fontWeight: '500',
        flex: 1,
    },
    dropdownOptionSubText: {
        fontSize: 13,
        color: '#8E8E93',
        fontWeight: '600',
    },
    previewContainer: {
        marginTop: 10,
    },
    previewHeaderLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#8E8E93',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    macroDashboard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 6,
    },
    macroBadge: {
        flex: 0.31,
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    macroValueText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1C1C1E',
    },
    macroLabelText: {
        fontSize: 11,
        fontWeight: '600',
        marginTop: 2,
    },
    commitSaveButton: {
        backgroundColor: '#007AFF',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 'auto',
    },
    disabledButton: {
        backgroundColor: '#C7C7CC',
    },
    commitSaveButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});