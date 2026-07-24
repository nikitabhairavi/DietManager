import { FoodImage } from '@/components/kitchen/FoodImage';
import { useIngredientsStore } from '@/data/dataStores/ingredientsStore/useIngredientStore';
import { LoggedMeal, useMealsStore } from '@/data/dataStores/meals/useMealsStore';
import { useRecipeStore } from '@/data/dataStores/recipeStore/useRecipeStore';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
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

interface MealItemDraft {
    id: string;
    name: string;
    portionSize: number;
    rawPortionInput: string;
    baseCalories: number;
    baseProtein: number;
    baseFiber: number;
}

const PRESET_MEAL_NAMES = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

const parseQuantity = (value: string | number): number => {
    if (typeof value === 'number') return isNaN(value) ? 0 : value;
    if (!value || typeof value !== 'string') return 0;
    const trimmed = value.trim();
    if (!trimmed) return 0;

    if (trimmed.includes(' ')) {
        const parts = trimmed.split(/\s+/);
        if (parts.length === 2) {
            const whole = parseFloat(parts[0]);
            const frac = parseQuantity(parts[1]);
            return (isNaN(whole) ? 0 : whole) + frac;
        }
    }

    if (trimmed.includes('/')) {
        const [num, den] = trimmed.split('/').map((p) => parseFloat(p));
        if (!isNaN(num) && !isNaN(den) && den !== 0) return num / den;
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

    // Form states
    const [mealName, setMealName] = useState('Breakfast');
    const [itemsDraft, setItemsDraft] = useState<MealItemDraft[]>([]);

    // Item Selection Search Sub-States
    const [searchQuery, setSearchQuery] = useState('');
    const [rawPortionInput, setRawPortionInput] = useState('1');
    const [selectedCatalogItem, setSelectedCatalogItem] = useState<{
        id: string;
        name: string;
        calories: number;
        protein: number;
        fiber: number;
    } | null>(null);
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        if (isVisible) {
            if (mealToEdit) {
                setMealName(mealToEdit.name || 'Meal');
                setItemsDraft([
                    {
                        id: mealToEdit.recipeId || `${Date.now()}`,
                        name: mealToEdit.name,
                        portionSize: mealToEdit.portionSize || 1,
                        rawPortionInput: (mealToEdit.portionSize || 1).toString(),
                        baseCalories: mealToEdit.totalCalories / (mealToEdit.portionSize || 1),
                        baseProtein: mealToEdit.totalProtein / (mealToEdit.portionSize || 1),
                        baseFiber: mealToEdit.totalFiber / (mealToEdit.portionSize || 1),
                    },
                ]);
            } else {
                setMealName('Breakfast');
                setItemsDraft([]);
            }
            setSearchQuery('');
            setSelectedCatalogItem(null);
            setRawPortionInput('1');
            setShowDropdown(false);
        }
    }, [isVisible, mealToEdit]);

    const selectableCatalog = useMemo(() => {
        const recipeItems = recipes.map((r) => ({
            id: `recipe-${r.id}`,
            name: r.name,
            calories: r.totalCalories,
            protein: r.totalProtein,
            fiber: r.totalFiber,
        }));

        const ingredientItems = ingredients.map((i) => ({
            id: `ingredient-${i.id}`,
            name: `${i.name} (${i.quantityPerUnit})`,
            calories: i.caloriesPerUnit,
            protein: i.proteinPerUnit,
            fiber: i.fiberPerUnit,
        }));

        return [...recipeItems, ...ingredientItems];
    }, [recipes, ingredients]);

    const filteredCatalog = useMemo(() => {
        if (!searchQuery.trim()) return [];
        return selectableCatalog
            .filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
            .slice(0, 5); // Limit dropdown items to top 5 results to keep overlay compact
    }, [searchQuery, selectableCatalog]);

    const handleAddItemToDraft = () => {
        if (!selectedCatalogItem) return;
        const portion = parseQuantity(rawPortionInput);
        if (portion <= 0) return;

        const newItem: MealItemDraft = {
            id: `${selectedCatalogItem.id}-${Date.now()}`,
            name: selectedCatalogItem.name,
            portionSize: portion,
            rawPortionInput,
            baseCalories: selectedCatalogItem.calories,
            baseProtein: selectedCatalogItem.protein,
            baseFiber: selectedCatalogItem.fiber,
        };

        setItemsDraft((prev) => [...prev, newItem]);
        setSearchQuery('');
        setSelectedCatalogItem(null);
        setRawPortionInput('1');
        setShowDropdown(false);
    };

    const handleRemoveDraftItem = (index: number) => {
        setItemsDraft((prev) => prev.filter((_, i) => i !== index));
    };

    const combinedTotals = useMemo(() => {
        return itemsDraft.reduce(
            (acc, item) => {
                acc.calories += item.baseCalories * item.portionSize;
                acc.protein += item.baseProtein * item.portionSize;
                acc.fiber += item.baseFiber * item.portionSize;
                return acc;
            },
            { calories: 0, protein: 0, fiber: 0 }
        );
    }, [itemsDraft]);

    const handleSaveLog = () => {
        if (itemsDraft.length === 0) {
            alert('Please add at least one ingredient or recipe to this meal.');
            return;
        }

        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        if (mealToEdit) {
            removeMeal(targetDateString, mealToEdit.id);
        }

        itemsDraft.forEach((item) => {
            logMeal(
                targetDateString,
                {
                    recipeId: item.id,
                    name: `${mealName}: ${item.name}`,
                    portionSize: item.portionSize,
                    loggedAtTime: mealToEdit ? mealToEdit.loggedAtTime : timeString,
                },
                {
                    calories: item.baseCalories,
                    protein: item.baseProtein,
                    fiber: item.baseFiber,
                }
            );
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
                        {/* Header */}
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {mealToEdit ? 'Edit Meal Entry' : 'Create & Log Meal'}
                            </Text>
                            <TouchableOpacity onPress={onClose}>
                                <Ionicons name="close" size={24} color="#1C1C1E" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} nestedScrollEnabled>
                            {/* Meal Name Input & Presets */}
                            <Text style={styles.sectionLabel}>Meal Name / Category</Text>
                            <TextInput
                                style={styles.textInput}
                                value={mealName}
                                onChangeText={setMealName}
                                placeholder="e.g., Lunch, Breakfast, Afternoon Snack"
                                placeholderTextColor="#8E8E93"
                            />

                            <View style={styles.presetChipRow}>
                                {PRESET_MEAL_NAMES.map((preset) => (
                                    <TouchableOpacity
                                        key={preset}
                                        style={[
                                            styles.presetChip,
                                            mealName === preset && styles.presetChipActive,
                                        ]}
                                        onPress={() => setMealName(preset)}
                                    >
                                        <Text
                                            style={[
                                                styles.presetChipText,
                                                mealName === preset && styles.presetChipTextActive,
                                            ]}
                                        >
                                            {preset}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Add Item Block */}
                            <View style={styles.searchBlock}>
                                <Text style={styles.sectionLabel}>Add Recipe or Ingredient</Text>
                                <TextInput
                                    style={styles.textInput}
                                    value={searchQuery}
                                    onChangeText={(text) => {
                                        setSearchQuery(text);
                                        setShowDropdown(text.trim().length > 0);
                                    }}
                                    placeholder="Search recipes or ingredients..."
                                    placeholderTextColor="#8E8E93"
                                />

                                {/* Replaced FlatList with standard View mapping to eliminate warning */}
                                {showDropdown && filteredCatalog.length > 0 && (
                                    <View style={styles.searchDropdownContainer}>
                                        {filteredCatalog.map((item) => (
                                            <TouchableOpacity
                                                key={item.id}
                                                style={styles.dropdownOptionRow}
                                                onPress={() => {
                                                    setSelectedCatalogItem(item);
                                                    setSearchQuery(item.name);
                                                    setShowDropdown(false);
                                                }}
                                            >
                                                <FoodImage name={item.name} size={24} />
                                                <Text style={styles.dropdownOptionText} numberOfLines={1}>
                                                    {item.name}
                                                </Text>
                                                <Text style={styles.dropdownOptionSubText}>
                                                    {item.calories.toFixed(0)} kcal
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}
                            </View>

                            {selectedCatalogItem && (
                                <View style={styles.itemAddControlRow}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.miniLabel}>Qty / Portion</Text>
                                        <TextInput
                                            style={styles.textInputSmall}
                                            value={rawPortionInput}
                                            onChangeText={setRawPortionInput}
                                            placeholder="1 or 1/2"
                                        />
                                    </View>
                                    <TouchableOpacity
                                        style={styles.addItemBtn}
                                        onPress={handleAddItemToDraft}
                                    >
                                        <Ionicons name="add" size={18} color="#FFFFFF" />
                                        <Text style={styles.addItemBtnText}>Add Item</Text>
                                    </TouchableOpacity>
                                </View>
                            )}

                            {/* Added Items List */}
                            <Text style={styles.sectionLabel}>Meal Items ({itemsDraft.length})</Text>
                            {itemsDraft.map((item, idx) => (
                                <View key={`${item.id}-${idx}`} style={styles.draftItemRow}>
                                    <FoodImage name={item.name} size={28} />
                                    <View style={{ flex: 1, marginLeft: 8 }}>
                                        <Text style={styles.draftItemName}>{item.name}</Text>
                                        <Text style={styles.draftItemSub}>
                                            x{item.portionSize} • {(item.baseCalories * item.portionSize).toFixed(0)} kcal
                                        </Text>
                                    </View>
                                    <TouchableOpacity onPress={() => handleRemoveDraftItem(idx)}>
                                        <Ionicons name="trash-outline" size={18} color="#FF3B30" />
                                    </TouchableOpacity>
                                </View>
                            ))}

                            {/* Macro Summary */}
                            {itemsDraft.length > 0 && (
                                <View style={styles.macroDashboard}>
                                    <View style={[styles.macroBadge, { backgroundColor: '#E1F0FF' }]}>
                                        <Text style={styles.macroValueText}>{combinedTotals.calories.toFixed(0)}</Text>
                                        <Text style={[styles.macroLabelText, { color: '#007AFF' }]}>kcal</Text>
                                    </View>
                                    <View style={[styles.macroBadge, { backgroundColor: '#E8F5E8' }]}>
                                        <Text style={styles.macroValueText}>{combinedTotals.protein.toFixed(1)}g</Text>
                                        <Text style={[styles.macroLabelText, { color: '#34C759' }]}>Protein</Text>
                                    </View>
                                    <View style={[styles.macroBadge, { backgroundColor: '#F3E5F5' }]}>
                                        <Text style={styles.macroValueText}>{combinedTotals.fiber.toFixed(1)}g</Text>
                                        <Text style={[styles.macroLabelText, { color: '#AF52DE' }]}>Fiber</Text>
                                    </View>
                                </View>
                            )}
                        </ScrollView>

                        {/* Confirm Button */}
                        <TouchableOpacity
                            style={[styles.commitSaveButton, itemsDraft.length === 0 && styles.disabledButton]}
                            activeOpacity={0.8}
                            onPress={handleSaveLog}
                            disabled={itemsDraft.length === 0}
                        >
                            <Text style={styles.commitSaveButtonText}>Confirm & Log Meal</Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
    keyboardContainer: { width: '100%', height: '85%' },
    modalContainer: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    modalTitle: { fontSize: 20, fontWeight: '700', color: '#1C1C1E' },
    sectionLabel: { fontSize: 12, fontWeight: '600', color: '#8E8E93', textTransform: 'uppercase', marginBottom: 6, marginTop: 14 },
    miniLabel: { fontSize: 11, color: '#8E8E93', marginBottom: 4 },
    textInput: { backgroundColor: '#F2F2F7', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15, color: '#000000', borderWidth: 1, borderColor: '#E5E5EA' },
    textInputSmall: { backgroundColor: '#F2F2F7', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, fontSize: 14, borderWidth: 1, borderColor: '#E5E5EA' },
    presetChipRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
    presetChip: { backgroundColor: '#F2F2F7', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
    presetChipActive: { backgroundColor: '#007AFF' },
    presetChipText: { fontSize: 12, color: '#3A3A3C', fontWeight: '600' },
    presetChipTextActive: { color: '#FFFFFF' },
    searchBlock: { position: 'relative', zIndex: 20 },
    searchDropdownContainer: { position: 'absolute', top: 75, left: 0, right: 0, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E5EA', borderRadius: 10, zIndex: 30, overflow: 'hidden' },
    dropdownOptionRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, gap: 8, borderBottomWidth: 1, borderBottomColor: '#F2F2F7' },
    dropdownOptionText: { flex: 1, fontSize: 14, color: '#1C1C1E' },
    dropdownOptionSubText: { fontSize: 12, color: '#8E8E93', fontWeight: '600' },
    itemAddControlRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 12, marginTop: 10 },
    addItemBtn: { backgroundColor: '#34C759', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8, gap: 4 },
    addItemBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
    draftItemRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F9FA', padding: 10, borderRadius: 10, marginTop: 6 },
    draftItemName: { fontSize: 14, fontWeight: '600', color: '#1C1C1E' },
    draftItemSub: { fontSize: 12, color: '#8E8E93' },
    macroDashboard: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 14 },
    macroBadge: { flex: 0.31, borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
    macroValueText: { fontSize: 15, fontWeight: '700', color: '#1C1C1E' },
    macroLabelText: { fontSize: 11, fontWeight: '600', marginTop: 2 },
    commitSaveButton: { backgroundColor: '#007AFF', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 12 },
    disabledButton: { backgroundColor: '#C7C7CC' },
    commitSaveButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});