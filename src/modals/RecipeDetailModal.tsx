import { FoodImage } from '@/components/kitchen/FoodImage';
import { useIngredientsStore } from '@/data/dataStores/ingredientsStore/useIngredientStore';
import { useRecipeStore } from '@/data/dataStores/recipeStore/useRecipeStore';
import { Recipe, RecipeIngredient } from '@/types/RecipeTypes';
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

interface RecipeDetailModalProps {
    recipe: Recipe | null;
    isVisible: boolean;
    onClose: () => void;
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

    // Fallback to standard decimal float
    const parsed = parseFloat(trimmed);
    return isNaN(parsed) ? 0 : parsed;
};

export const RecipeDetailModal: React.FC<RecipeDetailModalProps> = ({ recipe, isVisible, onClose }) => {
    const addRecipe = useRecipeStore((state) => state.addRecipe);
    const deleteRecipe = useRecipeStore((state) => state.deleteRecipe);
    const initialIngredients = useIngredientsStore((state) => state.ingredients);
    const [recipeName, setRecipeName] = useState('');
    const [ingredientsList, setIngredientsList] = useState<(RecipeIngredient & { rawUnitInput?: string })[]>([]);
    const [ingredientSearch, setIngredientSearch] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);

    // Sync internal state cleanly with the recipe format whenever opened
    useEffect(() => {
        if (recipe && isVisible) {
            setRecipeName(recipe.name);
            setIngredientsList(
                recipe.ingredients.map((item) => ({
                    ...item,
                    rawUnitInput: item.unitsUsed === 0 ? '' : item.unitsUsed.toString(),
                }))
            );
        } else {
            setRecipeName('');
            setIngredientsList([]);
        }
        setIngredientSearch('');
        setShowDropdown(false);
    }, [recipe, isVisible]);

    // Fast O(1) ingredient lookup map
    const ingredientsLookup = useMemo(() => {
        return initialIngredients.reduce((acc, ing) => {
            acc[ing.id] = ing;
            return acc;
        }, {} as Record<string, typeof initialIngredients[0]>);
    }, [initialIngredients]);

    // Compute dynamic cumulative macros using parseQuantity
    const computedTotals = useMemo(() => {
        return ingredientsList.reduce(
            (acc, item) => {
                const match = ingredientsLookup[item.ingredientId];
                if (match) {
                    const numericUnits = parseQuantity(item.rawUnitInput ?? item.unitsUsed);
                    acc.calories += match.caloriesPerUnit * numericUnits;
                    acc.protein += match.proteinPerUnit * numericUnits;
                    acc.fiber += match.fiberPerUnit * numericUnits;
                }
                return acc;
            },
            { calories: 0, protein: 0, fiber: 0 }
        );
    }, [ingredientsList, ingredientsLookup]);

    const filteredSearchIngredients = useMemo(() => {
        if (!ingredientSearch.trim()) return [];
        return initialIngredients.filter((ing) =>
            ing.name.toLowerCase().includes(ingredientSearch.toLowerCase())
        );
    }, [ingredientSearch, initialIngredients]);

    // --- Core Mutation Actions ---
    const handleModifyUnits = (ingredientId: string, text: string) => {
        const parsedValue = parseQuantity(text);

        setIngredientsList((current) =>
            current.map((item) =>
                item.ingredientId === ingredientId
                    ? { ...item, rawUnitInput: text, unitsUsed: parsedValue }
                    : item
            )
        );
    };

    const handleRemoveIngredient = (ingredientId: string) => {
        setIngredientsList((current) => current.filter((item) => item.ingredientId !== ingredientId));
    };

    const handleAddIngredient = (item: typeof initialIngredients[0]) => {
        if (ingredientsList.some((existing) => existing.ingredientId === item.id)) {
            alert('Ingredient is already added to this recipe composition.');
            return;
        }

        setIngredientsList((current) => [
            ...current,
            {
                ingredientId: item.id,
                name: `${item.name} (${item.quantityPerUnit})`,
                unitsUsed: 1,
                rawUnitInput: '1',
            },
        ]);
        setIngredientSearch('');
        setShowDropdown(false);
    };

    const handleSaveChanges = () => {
        if (!recipeName.trim()) {
            alert('Recipe name cannot be empty.');
            return;
        }
        if (ingredientsList.length === 0) {
            alert('Recipe requires at least one composition ingredient.');
            return;
        }

        if (recipe) {
            deleteRecipe(recipe.id);
        }

        // Clean up internal rawUnitInput state before persisting to store
        const cleanedIngredients: RecipeIngredient[] = ingredientsList.map((item) => ({
            ingredientId: item.ingredientId,
            name: item.name,
            unitsUsed: parseQuantity(item.rawUnitInput ?? item.unitsUsed),
        }));

        addRecipe({
            id: recipe?.id || `rec_${Date.now()}`,
            name: recipeName,
            ingredients: cleanedIngredients,
            totalCalories: parseFloat(computedTotals.calories.toFixed(1)),
            totalProtein: parseFloat(computedTotals.protein.toFixed(1)),
            totalFiber: parseFloat(computedTotals.fiber.toFixed(1)),
        });

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
                                {recipe ? 'Edit Recipe Details' : 'Create Recipe Blueprint'}
                            </Text>
                            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                <Ionicons name="close" size={24} color="#1C1C1E" />
                            </TouchableOpacity>
                        </View>

                        {/* Name Input */}
                        <Text style={styles.sectionLabel}>Recipe Identity Name</Text>
                        <TextInput
                            style={styles.textInput}
                            value={recipeName}
                            onChangeText={setRecipeName}
                            placeholder="e.g., High-Protein Chicken Curry"
                            placeholderTextColor="#8E8E93"
                        />

                        {/* Real-time Macro Dashboard */}
                        <View style={styles.macroDashboard}>
                            <View style={[styles.macroBadge, { backgroundColor: '#E1F0FF' }]}>
                                <Text style={styles.macroValueText}>{computedTotals.calories.toFixed(0)}</Text>
                                <Text style={[styles.macroLabelText, { color: '#007AFF' }]}>kcal</Text>
                            </View>
                            <View style={[styles.macroBadge, { backgroundColor: '#E8F5E8' }]}>
                                <Text style={styles.macroValueText}>{computedTotals.protein.toFixed(1)}g</Text>
                                <Text style={[styles.macroLabelText, { color: '#34C759' }]}>Protein</Text>
                            </View>
                            <View style={[styles.macroBadge, { backgroundColor: '#F3E5F5' }]}>
                                <Text style={styles.macroValueText}>{computedTotals.fiber.toFixed(1)}g</Text>
                                <Text style={[styles.macroLabelText, { color: '#AF52DE' }]}>Fiber</Text>
                            </View>
                        </View>

                        {/* Search Block */}
                        <View style={styles.searchBlock}>
                            <Text style={styles.sectionLabel}>Search & Inject Ingredients</Text>
                            <TextInput
                                style={styles.textInput}
                                value={ingredientSearch}
                                onChangeText={(text) => {
                                    setIngredientSearch(text);
                                    setShowDropdown(text.trim().length > 0);
                                }}
                                placeholder="Type catalog elements..."
                                placeholderTextColor="#8E8E93"
                            />

                            {showDropdown && filteredSearchIngredients.length > 0 && (
                                <View style={styles.searchDropdownContainer}>
                                    <FlatList
                                        data={filteredSearchIngredients}
                                        keyExtractor={(item) => item.id}
                                        style={{ maxHeight: 180 }}
                                        nestedScrollEnabled
                                        keyboardShouldPersistTaps="handled"
                                        renderItem={({ item }) => (
                                            <TouchableOpacity
                                                style={styles.dropdownOptionRow}
                                                onPress={() => handleAddIngredient(item)}
                                            >
                                                <View style={styles.dropdownLeftContainer}>
                                                    <FoodImage name={item.name} size={28} />
                                                    <Text style={styles.dropdownOptionText}>{item.name}</Text>
                                                </View>
                                                <Text style={styles.dropdownOptionSubText}>
                                                    {item.quantityPerUnit}
                                                </Text>
                                            </TouchableOpacity>
                                        )}
                                    />
                                </View>
                            )}
                        </View>

                        {/* Formulation Matrix */}
                        <Text style={styles.sectionLabel}>Active Ingredients Formulation</Text>
                        <View style={styles.listContainer}>
                            <FlatList
                                data={ingredientsList}
                                keyExtractor={(item) => item.ingredientId}
                                style={styles.ingredientsListMax}
                                showsVerticalScrollIndicator={true}
                                renderItem={({ item }) => {
                                    const match = ingredientsLookup[item.ingredientId];
                                    const lookupName = match ? match.name : item.name.split(' (')[0];

                                    return (
                                        <View style={styles.ingredientRowCard}>
                                            <FoodImage name={lookupName} size={36} />
                                            <View style={styles.ingredientMeta}>
                                                <Text style={styles.ingredientNameText} numberOfLines={1}>
                                                    {item.name}
                                                </Text>
                                            </View>
                                            <View style={styles.quantityEditWrapper}>
                                                <Text style={styles.multiplierLabel}>Units:</Text>
                                                <TextInput
                                                    style={styles.unitInput}
                                                    keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'default'}
                                                    value={item.rawUnitInput !== undefined ? item.rawUnitInput : item.unitsUsed.toString()}
                                                    placeholder="1"
                                                    onChangeText={(text) => handleModifyUnits(item.ingredientId, text)}
                                                    autoCapitalize="none"
                                                    autoCorrect={false}
                                                />
                                            </View>
                                            <TouchableOpacity
                                                style={styles.inlineRemoveButton}
                                                onPress={() => handleRemoveIngredient(item.ingredientId)}
                                                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                                            >
                                                <Ionicons name="remove-circle" size={22} color="#FF3B30" />
                                            </TouchableOpacity>
                                        </View>
                                    );
                                }}
                                ListEmptyComponent={
                                    <Text style={styles.emptyIngredientsText}>
                                        No ingredients added to this formulation yet.
                                    </Text>
                                }
                            />
                        </View>

                        {/* Footer Action */}
                        <TouchableOpacity
                            style={styles.commitSaveButton}
                            activeOpacity={0.8}
                            onPress={handleSaveChanges}
                        >
                            <Text style={styles.commitSaveButtonText}>Save Recipe Specifications</Text>
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
        height: '92%',
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
        marginTop: 10,
    },
    textInput: {
        backgroundColor: '#F2F2F7',
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 10,
        fontSize: 16,
        color: '#000000',
        borderWidth: 1,
        borderColor: '#E5E5EA',
    },
    macroDashboard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 10,
    },
    macroBadge: {
        flex: 0.31,
        borderRadius: 10,
        paddingVertical: 10,
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
    searchBlock: {
        position: 'relative',
        zIndex: 20,
        marginBottom: 8,
    },
    searchDropdownContainer: {
        position: 'absolute',
        top: 68,
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
    },
    dropdownOptionText: {
        fontSize: 15,
        color: '#000000',
        fontWeight: '500',
    },
    dropdownOptionSubText: {
        fontSize: 13,
        color: '#8E8E93',
    },
    listContainer: {
        flex: 1,
        marginVertical: 4,
    },
    ingredientsListMax: {
        flex: 1,
    },
    ingredientRowCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F8FA',
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginBottom: 6,
        borderWidth: 1,
        borderColor: '#E5E5EA',
        gap: 10,
    },
    ingredientMeta: {
        flex: 1,
        paddingRight: 4,
    },
    ingredientNameText: {
        fontSize: 15,
        fontWeight: '500',
        color: '#1C1C1E',
    },
    quantityEditWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 4,
    },
    multiplierLabel: {
        fontSize: 12,
        color: '#666666',
        marginRight: 6,
    },
    unitInput: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#C7C7CC',
        borderRadius: 6,
        width: 64, // Slightly wider to accommodate strings like "1 1/2"
        height: 32,
        textAlign: 'center',
        fontSize: 13,
        fontWeight: '600',
        color: '#000000',
    },
    inlineRemoveButton: {
        padding: 4,
        marginLeft: 2,
    },
    emptyIngredientsText: {
        textAlign: 'center',
        color: '#8E8E93',
        fontSize: 14,
        marginVertical: 20,
    },
    commitSaveButton: {
        backgroundColor: '#007AFF',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 6,
    },
    commitSaveButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});