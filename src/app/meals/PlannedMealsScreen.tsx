import { FoodImage } from '@/components/kitchen/FoodImage';
import { PlannedMealItem, useMealPlanStore } from '@/data/dataStores/meals/useMealPlanStore';
import { useMealsStore } from '@/data/dataStores/meals/useMealsStore';
import { LogMealModal } from '@/modals/LogMealsModal';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function PlannedMealsScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const targetDateString = (params.dateKey as string) || new Date().toISOString().slice(0, 10);

    const [isLogModalOpen, setIsLogModalOpen] = useState(false);

    const plansByDay = useMealPlanStore((state) => state.plansByDay);
    const toggleCompletePlannedMeal = useMealPlanStore((state) => state.toggleCompletePlannedMeal);
    const removePlannedMeal = useMealPlanStore((state) => state.removePlannedMeal);

    const logMeal = useMealsStore((state) => state.logMeal);
    const removeMeal = useMealsStore((state) => state.removeMeal);
    const mealsByDay = useMealsStore((state) => state.mealsByDay);

    const currentDayPlan = useMemo(() => {
        return plansByDay[targetDateString] || [];
    }, [plansByDay, targetDateString]);

    // Aggregate macros for the whole plan
    const planTotals = useMemo(() => {
        return currentDayPlan.reduce(
            (acc, item) => {
                acc.calories += item.baseCalories * item.portionSize;
                acc.protein += item.baseProtein * item.portionSize;
                acc.fiber += item.baseFiber * item.portionSize;
                return acc;
            },
            { calories: 0, protein: 0, fiber: 0 }
        );
    }, [currentDayPlan]);

    // Group items by meal category
    const groupedPlan = useMemo(() => {
        const groups: Record<string, PlannedMealItem[]> = {};
        currentDayPlan.forEach((item) => {
            const category = item.category || 'General';
            if (!groups[category]) groups[category] = [];
            groups[category].push(item);
        });
        return Object.entries(groups);
    }, [currentDayPlan]);

    const handleToggleCheckbox = (item: PlannedMealItem) => {
        const result = toggleCompletePlannedMeal(targetDateString, item.id);
        if (!result) return;

        const fullMealName = `${item.category}: ${item.name}`;

        if (result.isNowCompleted) {
            // Checkbox checked: Log meal into actual daily tracking store with timestamp
            logMeal(
                targetDateString,
                {
                    recipeId: item.recipeId,
                    name: fullMealName,
                    portionSize: item.portionSize,
                    loggedAtTime: result.timestamp,
                },
                {
                    calories: item.baseCalories,
                    protein: item.baseProtein,
                    fiber: item.baseFiber,
                }
            );
        } else {
            // Checkbox unchecked: Remove logged instance matching the name from actual store
            const dayMeals = mealsByDay[targetDateString] || [];
            const match = dayMeals.find((m) => m.name === fullMealName);
            if (match) {
                removeMeal(targetDateString, match.id);
            }
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Top Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color="#1C1C1E" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Meal Plan ({targetDateString})</Text>
                <TouchableOpacity onPress={() => setIsLogModalOpen(true)} style={styles.addPlanHeaderBtn}>
                    <Ionicons name="add-circle-outline" size={26} color="#007AFF" />
                </TouchableOpacity>
            </View>

            {/* Planned Macro Summary Card */}
            <View style={styles.planSummaryCard}>
                <Text style={styles.planSummaryTitle}>Planned Daily Totals</Text>
                <View style={styles.macroDashboard}>
                    <View style={[styles.macroBadge, { backgroundColor: '#E1F0FF' }]}>
                        <Text style={styles.macroValueText}>{planTotals.calories.toFixed(0)}</Text>
                        <Text style={[styles.macroLabelText, { color: '#007AFF' }]}>kcal</Text>
                    </View>
                    <View style={[styles.macroBadge, { backgroundColor: '#E8F5E8' }]}>
                        <Text style={styles.macroValueText}>{planTotals.protein.toFixed(1)}g</Text>
                        <Text style={[styles.macroLabelText, { color: '#34C759' }]}>Protein</Text>
                    </View>
                    <View style={[styles.macroBadge, { backgroundColor: '#F3E5F5' }]}>
                        <Text style={styles.macroValueText}>{planTotals.fiber.toFixed(1)}g</Text>
                        <Text style={[styles.macroLabelText, { color: '#AF52DE' }]}>Fiber</Text>
                    </View>
                </View>
            </View>

            {/* Planned Items List */}
            <FlatList
                data={groupedPlan}
                keyExtractor={([category]) => category}
                contentContainerStyle={styles.listPadding}
                renderItem={({ item: [category, items] }) => (
                    <View style={styles.categorySection}>
                        <Text style={styles.categoryTitle}>{category}</Text>
                        {items.map((item) => (
                            <View key={item.id} style={[styles.planCard, item.isCompleted && styles.completedPlanCard]}>
                                {/* Checkbox Trigger */}
                                <TouchableOpacity
                                    style={styles.checkboxTouch}
                                    onPress={() => handleToggleCheckbox(item)}
                                    activeOpacity={0.7}
                                >
                                    <Ionicons
                                        name={item.isCompleted ? 'checkbox' : 'square-outline'}
                                        size={24}
                                        color={item.isCompleted ? '#34C759' : '#8E8E93'}
                                    />
                                </TouchableOpacity>

                                <FoodImage name={item.name} size={36} />

                                <View style={styles.mealMeta}>
                                    <Text style={[styles.mealName, item.isCompleted && styles.completedText]}>
                                        {item.name}
                                    </Text>
                                    <Text style={styles.macroSub}>
                                        x{item.portionSize} • {(item.baseCalories * item.portionSize).toFixed(0)} kcal • P:{' '}
                                        {(item.baseProtein * item.portionSize).toFixed(1)}g • F:{' '}
                                        {(item.baseFiber * item.portionSize).toFixed(1)}g
                                    </Text>
                                    {item.isCompleted && item.completedAtTime && (
                                        <Text style={styles.timestampText}>Logged at {item.completedAtTime}</Text>
                                    )}
                                </View>

                                <TouchableOpacity
                                    onPress={() => removePlannedMeal(targetDateString, item.id)}
                                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                >
                                    <Ionicons name="trash-outline" size={18} color="#FF3B30" />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                )}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="calendar-outline" size={54} color="#C7C7CC" />
                        <Text style={styles.emptyTitle}>No Meals Planned</Text>
                        <Text style={styles.emptySub}>
                            Tap below to plan your recipes and ingredients for this day.
                        </Text>
                        <TouchableOpacity style={styles.addFirstPlanBtn} onPress={() => setIsLogModalOpen(true)}>
                            <Ionicons name="add" size={18} color="#FFFFFF" />
                            <Text style={styles.addFirstPlanText}>Add Meals to Plan</Text>
                        </TouchableOpacity>
                    </View>
                }
            />

            {/* Reuse LogMealModal for Planning */}
            <LogMealModal
                isVisible={isLogModalOpen}
                onClose={() => setIsLogModalOpen(false)}
                targetDateString={targetDateString}
                isPlanningMode={true}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F2F2F7' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
    },
    backButton: { padding: 4 },
    headerTitle: { fontSize: 17, fontWeight: '700', color: '#1C1C1E' },
    addPlanHeaderBtn: { padding: 4 },

    planSummaryCard: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 16,
        marginTop: 14,
        borderRadius: 16,
        padding: 14,
        borderWidth: 1,
        borderColor: '#E5E5EA',
    },
    planSummaryTitle: { fontSize: 13, fontWeight: '700', color: '#1C1C1E', marginBottom: 8 },
    macroDashboard: { flexDirection: 'row', justifyContent: 'space-between' },
    macroBadge: { flex: 0.31, borderRadius: 10, paddingVertical: 8, alignItems: 'center' },
    macroValueText: { fontSize: 15, fontWeight: '700', color: '#1C1C1E' },
    macroLabelText: { fontSize: 11, fontWeight: '600', marginTop: 1 },

    listPadding: { paddingHorizontal: 16, paddingBottom: 40 },
    categorySection: { marginTop: 16 },
    categoryTitle: { fontSize: 15, fontWeight: '700', color: '#1C1C1E', marginBottom: 8 },

    planCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 10,
        marginTop: 6,
        gap: 10,
        borderWidth: 1,
        borderColor: '#E5E5EA',
    },
    completedPlanCard: { backgroundColor: '#F2F9F2', borderColor: '#D0E8D0' },
    checkboxTouch: { padding: 2 },
    mealMeta: { flex: 1 },
    mealName: { fontSize: 15, fontWeight: '600', color: '#1C1C1E' },
    completedText: { textDecorationLine: 'line-through', color: '#8E8E93' },
    macroSub: { fontSize: 11, color: '#8E8E93', marginTop: 2 },
    timestampText: { fontSize: 11, fontWeight: '700', color: '#34C759', marginTop: 3 },

    emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 80, paddingHorizontal: 20 },
    emptyTitle: { fontSize: 18, fontWeight: '700', color: '#1C1C1E', marginTop: 12 },
    emptySub: { fontSize: 13, color: '#8E8E93', textAlign: 'center', marginTop: 4, marginBottom: 16 },
    addFirstPlanBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#007AFF',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 10,
        gap: 6,
    },
    addFirstPlanText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
});