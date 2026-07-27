import { useIngredientsStore } from '@/data/dataStores/ingredientsStore/useIngredientStore';
import { useRecipeStore } from '@/data/dataStores/recipeStore/useRecipeStore';
import { Recipe } from '@/types/RecipeTypes';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
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

interface EditRecipeModalProps {
    isVisible: boolean;
    onClose: () => void;
    recipeToEdit: Recipe | null;
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

export const EditRecipeModal: React.FC<EditRecipeModalProps> = ({
    isVisible,
    onClose,
    recipeToEdit,
}) => {
    const availableIngredients = useIngredientsStore((state) => state.ingredients);
    const updateRecipe = useRecipeStore((state) => state.updateRecipe);

    const [recipeName, setRecipeName] = useState('');
    const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    // Strict Hydration: Fully hydrates existing recipe when modal opens
    useEffect(() => {
        if (isVisible && recipeToEdit) {
            setRecipeName(recipeToEdit.name || '');

            const hydratedItems: SelectedItem[] = (recipeToEdit.ingredients || []).map((ing) => {
                const storeMatch = availableIngredients.find(
                    (item) => String(item.id) === String(ing.ingredientId)
                );

                return {
                    ingredientId: String(ing.ingredientId),
                    name: ing.name || storeMatch?.name || 'Ingredient',
                    units: String(ing.unitsUsed ?? 1),
                    quantityPerUnit: storeMatch?.quantityPerUnit || '1 unit',
                    caloriesPerUnit: storeMatch?.caloriesPerUnit || 0,
                    proteinPerUnit: storeMatch?.proteinPerUnit || 0,
                    fiberPerUnit: storeMatch?.fiberPerUnit || 0,
                };
            });

            setSelectedItems(hydratedItems);
            setSearchQuery('');
            setIsSearching(false);
        }
    }, [recipeToEdit, isVisible, availableIngredients]);

    // Search Filtering
    const filteredAvailableIngredients = useMemo(() => {
        if (!searchQuery.trim()) return availableIngredients;
        return availableIngredients.filter((ing) =>
            ing.name?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [availableIngredients, searchQuery]);

    // Macro Engine
    const totals = useMemo(() => {
        return selectedItems.reduce(
            (acc, item) => {
                const parsedUnits = parseFloat(item.units) || 0;
                acc.calories += (item.caloriesPerUnit || 0) * parsedUnits;
                acc.protein += (item.proteinPerUnit || 0) * parsedUnits;
                acc.fiber += (item.fiberPerUnit || 0) * parsedUnits;
                return acc;
            },
            { calories: 0, protein: 0, fiber: 0 }
        );
    }, [selectedItems]);

    const handleSelectIngredient = (ing: typeof availableIngredients[0]) => {
        const stringId = String(ing.id);
        if (selectedItems.some((item) => String(item.ingredientId) === stringId)) {
            setSearchQuery('');
            setIsSearching(false);
            Keyboard.dismiss();
            return;
        }

        setSelectedItems((prev) => [
            ...prev,
            {
                ingredientId: stringId,
                name: ing.name,
                units: '1',
                quantityPerUnit: ing.quantityPerUnit,
                caloriesPerUnit: ing.caloriesPerUnit,
                proteinPerUnit: ing.proteinPerUnit,
                fiberPerUnit: ing.fiberPerUnit,
            },
        ]);
        setSearchQuery('');
        setIsSearching(false);
        Keyboard.dismiss();
    };

    const handleUpdateUnits = (id: string, text: string) => {
        setSelectedItems((prev) =>
            prev.map((item) =>
                String(item.ingredientId) === String(id) ? { ...item, units: text } : item
            )
        );
    };

    const handleRemoveItem = (id: string) => {
        setSelectedItems((prev) =>
            prev.filter((item) => String(item.ingredientId) !== String(id))
        );
    };

    const handleSaveRecipe = () => {
        if (!recipeToEdit) return;
        if (!recipeName.trim()) {
            alert('Please enter a recipe name.');
            return;
        }
        if (selectedItems.length === 0) {
            alert('Please add at least one ingredient.');
            return;
        }

        updateRecipe(recipeToEdit.id, {
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
                            {/* Header */}
                            <View style={styles.headerRow}>
                                <Text style={styles.modalTitle}>Edit Recipe Details</Text>
                                <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                    <Ionicons name="close" size={24} color="#000" />
                                </TouchableOpacity>
                            </View>

                            {/* Title Input */}
                            <Text style={styles.inputLabel}>Recipe Identity Name</Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder="Recipe Name"
                                placeholderTextColor="#999"
                                value={recipeName}
                                onChangeText={setRecipeName}
                            />

                            {/* Macro Dashboard */}
                            <View style={styles.macroDashboard}>
                                <View style={[styles.macroBadge, { backgroundColor: '#EBF5FF' }]}>
                                    <Text style={[styles.macroValue, { color: '#007AFF' }]}>
                                        {totals.calories.toFixed(0)}
                                    </Text>
                                    <Text style={[styles.macroLabelText, { color: '#007AFF' }]}>kcal</Text>
                                </View>

                                <View style={[styles.macroBadge, { backgroundColor: '#EAF8EA' }]}>
                                    <Text style={[styles.macroValue, { color: '#34C759' }]}>
                                        {totals.protein.toFixed(1)}g
                                    </Text>
                                    <Text style={[styles.macroLabelText, { color: '#34C759' }]}>Protein</Text>
                                </View>

                                <View style={[styles.macroBadge, { backgroundColor: '#F8EAF8' }]}>
                                    <Text style={[styles.macroValue, { color: '#AF52DE' }]}>
                                        {totals.fiber.toFixed(1)}g
                                    </Text>
                                    <Text style={[styles.macroLabelText, { color: '#AF52DE' }]}>Fiber</Text>
                                </View>
                            </View>

                            {/* Search Bar */}
                            <Text style={styles.inputLabel}>Search & Inject Ingredients</Text>
                            <View style={styles.searchBarContainer}>
                                <Ionicons name="search" size={18} color="#999" style={styles.searchIcon} />
                                <TextInput
                                    style={styles.searchInput}
                                    placeholder="Type ingredient name..."
                                    placeholderTextColor="#999"
                                    value={searchQuery}
                                    onChangeText={(text) => {
                                        setSearchQuery(text);
                                        setIsSearching(text.length > 0);
                                    }}
                                    onFocus={() => setIsSearching(true)}
                                />
                                {searchQuery.length > 0 && (
                                    <TouchableOpacity
                                        onPress={() => {
                                            setSearchQuery('');
                                            setIsSearching(false);
                                        }}
                                    >
                                        <Ionicons name="close-circle" size={18} color="#999" />
                                    </TouchableOpacity>
                                )}
                            </View>

                            {/* Inline Search or Composition List */}
                            {isSearching ? (
                                <View style={styles.inlineResultsContainer}>
                                    <View style={styles.resultsHeader}>
                                        <Text style={styles.resultsHeaderText}>Tap an ingredient to add</Text>
                                        <TouchableOpacity onPress={() => setIsSearching(false)}>
                                            <Text style={styles.doneBtnText}>Done</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <FlatList
                                        data={filteredAvailableIngredients}
                                        keyExtractor={(item) => String(item.id)}
                                        keyboardShouldPersistTaps="handled"
                                        renderItem={({ item }) => (
                                            <TouchableOpacity
                                                style={styles.inlineResultRow}
                                                onPress={() => handleSelectIngredient(item)}
                                            >
                                                <View style={styles.resultMainInfo}>
                                                    <Text style={styles.resultTitle} numberOfLines={1} ellipsizeMode="tail">
                                                        {item.name}
                                                    </Text>
                                                    <Text style={styles.resultSubtitle} numberOfLines={1} ellipsizeMode="tail">
                                                        Base: {item.quantityPerUnit} • {item.caloriesPerUnit} kcal
                                                    </Text>
                                                </View>
                                                <Ionicons name="add-circle-outline" size={22} color="#007AFF" />
                                            </TouchableOpacity>
                                        )}
                                        ListEmptyComponent={
                                            <Text style={styles.emptyText}>No matching ingredients found.</Text>
                                        }
                                    />
                                </View>
                            ) : (
                                <View style={styles.selectedListContainer}>
                                    <Text style={styles.inputLabel}>Current Composition</Text>
                                    <FlatList
                                        data={selectedItems}
                                        keyExtractor={(item) => String(item.ingredientId)}
                                        style={styles.selectedItemsList}
                                        showsVerticalScrollIndicator={true}
                                        renderItem={({ item }) => (
                                            <View style={styles.selectedItemRow}>
                                                <View style={styles.selectedItemInfo}>
                                                    <Text style={styles.selectedItemName} numberOfLines={1} ellipsizeMode="tail">
                                                        {item.name}
                                                    </Text>
                                                    <Text style={styles.selectedItemMetric}>
                                                        Base unit: {item.quantityPerUnit}
                                                    </Text>
                                                </View>

                                                <View style={styles.rightControls}>
                                                    <View style={styles.unitInputContainer}>
                                                        <TextInput
                                                            style={styles.unitInput}
                                                            keyboardType="decimal-pad"
                                                            value={item.units}
                                                            onChangeText={(text) => handleUpdateUnits(item.ingredientId, text)}
                                                        />
                                                        <Text style={styles.unitLabel}>x</Text>
                                                    </View>

                                                    <TouchableOpacity
                                                        onPress={() => handleRemoveItem(item.ingredientId)}
                                                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                                    >
                                                        <Ionicons name="close-circle" size={22} color="#FF3B30" />
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        )}
                                        ListEmptyComponent={
                                            <Text style={styles.emptyText}>No ingredients added yet.</Text>
                                        }
                                    />
                                </View>
                            )}

                            {/* Action Matrix */}
                            <View style={styles.actionRow}>
                                <TouchableOpacity style={[styles.btn, styles.btnCancel]} onPress={onClose}>
                                    <Text style={styles.btnCancelText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.btn, styles.btnSave]} onPress={handleSaveRecipe}>
                                    <Text style={styles.btnSaveText}>Update Recipe</Text>
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
        justifyContent: 'flex-end',
    },
    keyboardContainer: {
        width: '100%',
        height: '92%',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: '#FFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111',
    },
    inputLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: '#8E8E93',
        textTransform: 'uppercase',
        marginBottom: 6,
        letterSpacing: 0.5,
    },
    textInput: {
        backgroundColor: '#F2F2F7',
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 16,
        color: '#000',
        marginBottom: 14,
    },
    macroDashboard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
        gap: 8,
    },
    macroBadge: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    macroValue: {
        fontSize: 16,
        fontWeight: '700',
    },
    macroLabelText: {
        fontSize: 12,
        fontWeight: '500',
        marginTop: 2,
    },
    searchBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F2F2F7',
        borderRadius: 10,
        paddingHorizontal: 12,
        marginBottom: 12,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 15,
        color: '#000',
    },
    inlineResultsContainer: {
        flex: 1,
        backgroundColor: '#FAFAFC',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E5EA',
        padding: 10,
        marginBottom: 12,
    },
    resultsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
        marginBottom: 6,
    },
    resultsHeaderText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#8E8E93',
        textTransform: 'uppercase',
    },
    doneBtnText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#007AFF',
    },
    inlineResultRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
        paddingHorizontal: 6,
        borderBottomWidth: 1,
        borderBottomColor: '#F2F2F7',
    },
    resultMainInfo: {
        flex: 1,
        paddingRight: 12,
    },
    resultTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#000',
    },
    resultSubtitle: {
        fontSize: 12,
        color: '#8E8E93',
        marginTop: 2,
    },
    selectedListContainer: {
        flex: 1,
    },
    selectedItemsList: {
        flex: 1,
    },
    selectedItemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FAFAFC',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 10,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#E5E5EA',
    },
    selectedItemInfo: {
        flex: 1,
        paddingRight: 10,
    },
    selectedItemName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1C1C1E',
    },
    selectedItemMetric: {
        fontSize: 12,
        color: '#8E8E93',
        marginTop: 2,
    },
    rightControls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    unitInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    unitInput: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#C7C7CC',
        borderRadius: 6,
        width: 46,
        height: 32,
        textAlign: 'center',
        fontSize: 14,
        color: '#000',
        fontWeight: '600',
        paddingVertical: 0,
    },
    unitLabel: {
        fontSize: 12,
        fontWeight: '500',
        color: '#8E8E93',
    },
    emptyText: {
        textAlign: 'center',
        color: '#8E8E93',
        fontSize: 14,
        marginVertical: 20,
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
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