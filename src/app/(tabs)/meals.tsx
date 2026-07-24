import { FoodImage } from '@/components/kitchen/FoodImage';
import { LoggedMeal, useMealsStore } from '@/data/dataStores/meals/useMealsStore';
import { LogMealModal } from '@/modals/LogMealsModal';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CalendarStrip } from '../../components/Calendar/calendarStrip';

export default function DailyMealsScreen() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [selectedMealForEdit, setSelectedMealForEdit] = useState<LoggedMeal | null>(null);

  const mealsByDay = useMealsStore((state) => state.mealsByDay);
  const removeMeal = useMealsStore((state) => state.removeMeal);

  const formatDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const targetDateString = useMemo(() => formatDateString(selectedDate), [selectedDate]);
  const currentDayMeals = useMemo(() => mealsByDay[targetDateString] || [], [mealsByDay, targetDateString]);

  const dailyTotals = useMemo(() => {
    return currentDayMeals.reduce(
      (acc, meal) => {
        acc.calories += meal.totalCalories;
        acc.protein += meal.totalProtein;
        acc.fiber += meal.totalFiber;
        return acc;
      },
      { calories: 0, protein: 0, fiber: 0 }
    );
  }, [currentDayMeals]);

  const groupedMeals = useMemo(() => {
    const groups: { [key: string]: LoggedMeal[] } = {};
    currentDayMeals.forEach((meal) => {
      const category = meal.name.includes(':') ? meal.name.split(':')[0].trim() : 'General';
      if (!groups[category]) groups[category] = [];
      groups[category].push(meal);
    });
    return Object.entries(groups);
  }, [currentDayMeals]);

  const handleNavigateToPlan = () => {
    router.push({
      pathname: '/meals/PlannedMealsScreen',
      params: { dateKey: targetDateString },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <CalendarStrip selectedDate={selectedDate} onDateSelect={setSelectedDate} />

      {currentDayMeals.length > 0 && (
        <View style={styles.daySummaryDashboard}>
          <View style={styles.summaryItem}>
            <View style={[styles.bullet, { backgroundColor: '#007AFF' }]} />
            <Text style={styles.summaryLabel}>Cal:</Text>
            <Text style={[styles.summaryValue, { color: '#007AFF' }]}>{dailyTotals.calories.toFixed(0)} kcal</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <View style={[styles.bullet, { backgroundColor: '#34C759' }]} />
            <Text style={styles.summaryLabel}>Protein:</Text>
            <Text style={[styles.summaryValue, { color: '#34C759' }]}>{dailyTotals.protein.toFixed(1)}g</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <View style={[styles.bullet, { backgroundColor: '#AF52DE' }]} />
            <Text style={styles.summaryLabel}>Fiber:</Text>
            <Text style={[styles.summaryValue, { color: '#AF52DE' }]}>{dailyTotals.fiber.toFixed(1)}g</Text>
          </View>
        </View>
      )}

      <FlatList
        data={groupedMeals}
        keyExtractor={([category]) => category}
        contentContainerStyle={styles.listPadding}
        renderItem={({ item: [category, meals] }) => (
          <View style={styles.categorySection}>
            <Text style={styles.categoryTitle}>{category}</Text>

            {meals.map((meal) => {
              const displayName = meal.name.includes(':') ? meal.name.split(':')[1].trim() : meal.name;
              return (
                <TouchableOpacity
                  key={meal.id}
                  style={styles.mealCard}
                  onPress={() => {
                    setSelectedMealForEdit(meal);
                    setIsLogModalOpen(true);
                  }}
                >
                  <FoodImage name={displayName} size={40} />
                  <View style={styles.mealMeta}>
                    <Text style={styles.mealName}>{displayName}</Text>
                    <View style={styles.cardMacroRow}>
                      <Text style={styles.calText}>{meal.totalCalories} kcal</Text>
                      <Text style={styles.macroDot}>•</Text>
                      <Text style={styles.proteinText}>P: {meal.totalProtein}g</Text>
                      <Text style={styles.macroDot}>•</Text>
                      <Text style={styles.fiberText}>F: {meal.totalFiber}g</Text>
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => removeMeal(targetDateString, meal.id)}>
                    <Ionicons name="trash-outline" size={18} color="#FF3B30" />
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="restaurant-outline" size={48} color="#C7C7CC" />
            <Text style={styles.emptyText}>No food logs entered for this date.</Text>
          </View>
        }
      />

      {/* Floating Action Button Group */}
      <View style={styles.fabContainer}>
        {/* Plan Meals Button (To-Do Checklist Icon) */}
        <TouchableOpacity
          style={[styles.fab, styles.planFab]}
          activeOpacity={0.8}
          onPress={handleNavigateToPlan}
        >
          <Ionicons name="checkbox-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Add Meal FAB */}
        <TouchableOpacity
          style={styles.fab}
          activeOpacity={0.8}
          onPress={() => {
            setSelectedMealForEdit(null);
            setIsLogModalOpen(true);
          }}
        >
          <Ionicons name="add" size={30} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <LogMealModal
        isVisible={isLogModalOpen}
        onClose={() => {
          setIsLogModalOpen(false);
          setSelectedMealForEdit(null);
        }}
        targetDateString={targetDateString}
        mealToEdit={selectedMealForEdit}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  daySummaryDashboard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  summaryItem: { flexDirection: 'row', alignItems: 'center' },
  bullet: { width: 7, height: 7, borderRadius: 3.5, marginRight: 5 },
  summaryLabel: { fontSize: 12, color: '#8E8E93', fontWeight: '600', marginRight: 3 },
  summaryValue: { fontSize: 13, fontWeight: '700' },
  summaryDivider: { width: 1, height: 14, backgroundColor: '#E5E5EA' },
  listPadding: { paddingHorizontal: 20, paddingBottom: 90 },
  categorySection: { marginTop: 16 },
  categoryTitle: { fontSize: 16, fontWeight: '700', color: '#1C1C1E', marginBottom: 6 },
  mealCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 10,
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  mealMeta: { flex: 1 },
  mealName: { fontSize: 15, fontWeight: '600', color: '#1C1C1E' },
  cardMacroRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  calText: { fontSize: 12, fontWeight: '600', color: '#007AFF' },
  proteinText: { fontSize: 12, fontWeight: '600', color: '#34C759' },
  fiberText: { fontSize: 12, fontWeight: '600', color: '#AF52DE' },
  macroDot: { fontSize: 10, color: '#C7C7CC', marginHorizontal: 4 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 60 },
  emptyText: { color: '#8E8E93', fontSize: 15, textAlign: 'center', marginTop: 8 },

  /* Side-by-side FAB container */
  fabContainer: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    zIndex: 10,
  },
  fab: {
    backgroundColor: '#007AFF',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  planFab: {
    backgroundColor: '#34C759',
  },
});