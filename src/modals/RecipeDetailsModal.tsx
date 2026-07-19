import { initialIngredients } from '@/data/dataStores/ingredientsStore/initialData';
import { Recipe, RecipeIngredient, useRecipeStore } from '@/data/dataStores/recipeStore/useRecipeStore';
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

export const RecipeDetailModal: React.FC<RecipeDetailModalProps> = ({ recipe, isVisible, onClose }) => {
    const addRecipe = useRecipeStore((state) => state.addRecipe);
    const deleteRecipe = useRecipeStore((state) => state.deleteRecipe);

    const [recipeName, setRecipeName] = useState('');
    const [ingredientsList, setIngredientsList] = useState<RecipeIngredient[]>([]);
    const [ingredientSearch, setIngredientSearch] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);

    // Sync internal state cleanly with the recipe format whenever opened
    useEffect(() => {
        if (recipe && isVisible) {
            setRecipeName(recipe.name);
            setIngredientsList([...recipe.ingredients]);
        } else {
            setRecipeName('');
            setIngredientsList([]);
        }
        setIngredientSearch('');
        setShowDropdown(false);
    }, [recipe, isVisible]);

    // Fast O(1) ingredient lookup map for dynamic macro processing
    const ingredientsLookup = useMemo(() => {
        return initialIngredients.reduce((acc, ing) => {
            acc[ing.id] = ing;
            return acc;
        }, {} as Record<string, typeof initialIngredients[0]>);
    }, []);

    // Compute live cumulative macros dynamically based on unitsUsed fields
    const computedTotals = useMemo(() => {
        return ingredientsList.reduce(
            (acc, item) => {
                const match = ingredientsLookup[item.ingredientId];
                if (match) {
                    acc.calories += match.caloriesPerUnit * item.unitsUsed;
                    acc.protein += match.proteinPerUnit * item.unitsUsed;
                    acc.fiber += match.fiberPerUnit * item.unitsUsed;
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
    }, [ingredientSearch]);

    // --- Core Mutation Actions ---
    const handleModifyUnits = (ingredientId: string, text: string) => {
        const numericValue = parseFloat(text);
        const safeValue = isNaN(numericValue) ? 0 : numericValue;

        setIngredientsList((current) =>
            current.map((item) =>
                item.ingredientId === ingredientId ? { ...item, unitsUsed: safeValue } : item
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

        // Inserts new elements adhering exactly to your RecipeIngredient interface schema
        setIngredientsList((current) => [
            ...current,
            {
                ingredientId: item.id,
                name: `${item.name} (${item.quantityPerUnit})`,
                unitsUsed: 1
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

        // Atomically swap old definitions out if editing an existing model layout
        if (recipe) {
            deleteRecipe(recipe.id);
        }

        // Commit completely parsed object upstream matching your core model interface
        addRecipe({
            id: recipe?.id || `rec_${Date.now()}`,
            name: recipeName,
            ingredients: ingredientsList,
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
                    style={styles.modalContainer}
                >
                    {/* Top Title Banner layout */}
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>{recipe ? 'Edit Recipe Details' : 'Create Recipe Blueprint'}</Text>
                        <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                            <Ionicons name="close" size={24} color="#1C1C1E" />
                        </TouchableOpacity>
                    </View>

                    {/* Identity Parameters field */}
                    <Text style={styles.sectionLabel}>Recipe Identity Name</Text>
                    <TextInput
                        style={styles.textInput}
                        value={recipeName}
                        onChangeText={setRecipeName}
                        placeholder="e.g., High-Protein Chicken Curry"
                        placeholderTextColor="#8E8E93"
                    />

                    {/* Real-time Scaled Macro Telemetry Summary Grid */}
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

                    {/* Composition Breakdown Matrix */}
                    <Text style={styles.sectionLabel}>Active Ingredients Formulation</Text>
                    <FlatList
                        data={ingredientsList}
                        keyExtractor={(item) => item.ingredientId}
                        style={styles.ingredientsListMax}
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item }) => (
                            <View style={styles.ingredientRowCard}>
                                <View style={styles.ingredientMeta}>
                                    <Text style={styles.ingredientNameText} numberOfLines={1}>{item.name}</Text>
                                </View>
                                <View style={styles.quantityEditWrapper}>
                                    <Text style={styles.multiplierLabel}>Units:</Text>
                                    <TextInput
                                        style={styles.unitInput}
                                        keyboardType="numeric"
                                        value={item.unitsUsed === 0 ? '' : item.unitsUsed.toString()}
                                        placeholder="0"
                                        onChangeText={(text) => handleModifyUnits(item.ingredientId, text)}
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
                        )}
                        ListEmptyComponent={
                            <Text style={styles.emptyIngredientsText}>No ingredients added to this formulation yet.</Text>
                        }
                    />

                    {/* Catalog Selection Interceptor Search */}
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
                                    style={{ maxHeight: 130 }}
                                    nestedScrollEnabled
                                    keyboardShouldPersistTaps="handled"
                                    renderItem={({ item }) => (
                                        <TouchableOpacity
                                            style={styles.dropdownOptionRow}
                                            onPress={() => handleAddIngredient(item)}
                                        >
                                            <Text style={styles.dropdownOptionText}>{item.name}</Text>
                                            <Text style={styles.dropdownOptionSubText}>{item.quantityPerUnit}</Text>
                                        </TouchableOpacity>
                                    )}
                                />
                            </View>
                        )}
                    </View>

                    {/* Action Submission Grid Footer */}
                    <TouchableOpacity style={styles.commitSaveButton} activeOpacity={0.8} onPress={handleSaveChanges}>
                        <Text style={styles.commitSaveButtonText}>Save Recipe Specifications</Text>
                    </TouchableOpacity>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'center',
    },
    modalContainer: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: Platform.OS === 'ios' ? 44 : 24,
        maxHeight: '88%'
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1C1C1E'
    },
    sectionLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#8E8E93',
        textTransform: 'uppercase',
        marginBottom: 6,
        marginTop: 12
    },
    textInput: {
        backgroundColor: '#F2F2F7',
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 10,
        fontSize: 16,
        color: '#000000',
        borderWidth: 1,
        borderColor: '#E5E5EA'
    },
    macroDashboard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 12
    },
    macroBadge: {
        flex: 0.31,
        borderRadius: 10,
        paddingVertical: 10,
        alignItems: 'center',
        justifyContent: 'center'
    },
    macroValueText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1C1C1E'
    },
    macroLabelText: {
        fontSize: 11,
        fontWeight: '600',
        marginTop: 2
    },
    ingredientsListMax: {
        maxHeight: 180,
        marginVertical: 4
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
        borderColor: '#E5E5EA'
    },
    ingredientMeta: {
        flex: 1,
        paddingRight: 8
    },
    ingredientNameText: {
        fontSize: 15,
        fontWeight: '500',
        color: '#1C1C1E'
    },
    quantityEditWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 4
    },
    multiplierLabel: {
        fontSize: 12,
        color: '#666666',
        marginRight: 6
    },
    unitInput: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#C7C7CC',
        borderRadius: 6,
        width: 52,
        height: 32,
        textAlign: 'center',
        fontSize: 14,
        fontWeight: '600',
        color: '#000000'
    },
    inlineRemoveButton: {
        padding: 4,
        marginLeft: 6
    },
    emptyIngredientsText: {
        textAlign: 'center',
        color: '#8E8E93',
        fontSize: 14,
        marginVertical: 14
    },
    searchBlock: {
        position: 'relative',
        zIndex: 20,
        marginBottom: 12
    },
    searchDropdownContainer: {
        position: 'absolute',
        top: 78,
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
        elevation: 3,
        zIndex: 30
    },
    dropdownOptionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F2F2F7'
    },
    dropdownOptionText: {
        fontSize: 15,
        color: '#000000',
        fontWeight: '500'
    },
    dropdownOptionSubText: {
        fontSize: 13,
        color: '#8E8E93'
    },
    commitSaveButton: {
        backgroundColor: '#007AFF',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        marginBottom: 10

    },
    commitSaveButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});