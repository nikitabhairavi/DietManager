import { FoodImage } from '@/components/kitchen/FoodImage';
import { LoggedMeal, useMealsStore } from '@/data/dataStores/meals/useMealsStore'; // Using LoggedMeal directly
import { LogMealModal } from '@/modals/LogMealsModal';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CalendarStrip } from '../../components/Calendar/calendarStrip';

export default function DailyMealsScreen() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [selectedMealForEdit, setSelectedMealForEdit] = useState<LoggedMeal | null>(null);

  // Hook into your live Zustand day-tracking store slice
  const mealsByDay = useMealsStore((state) => state.mealsByDay);
  const removeMeal = useMealsStore((state) => state.removeMeal);

  // Utility to match structured key dates (e.g., YYYY-MM-DD)
  const formatDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const targetDateString = useMemo(() => formatDateString(selectedDate), [selectedDate]);

  // O(1) live lookup pulling directly from the structural dictionary array
  const currentDayMeals = useMemo(() => {
    return mealsByDay[targetDateString] || [];
  }, [mealsByDay, targetDateString]);

  const displayTitle = useMemo(() => {
    return selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }, [selectedDate]);

  // Dynamic daily summation tracking accumulator loops
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

  // --- Modal Open/Close Handlers ---
  const handleOpenEdit = (meal: LoggedMeal) => {
    setSelectedMealForEdit(meal);
    setIsLogModalOpen(true);
  };

  const handleOpenCreate = () => {
    setSelectedMealForEdit(null);
    setIsLogModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsLogModalOpen(false);
    setSelectedMealForEdit(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Horizontal Calendar Strip */}
      <CalendarStrip
        selectedDate={selectedDate}
        onDateSelect={(date) => setSelectedDate(date)}
      />

      {/* Dynamic Summary Micro Dashboard (Color Bullet Strip) */}
      {currentDayMeals.length > 0 && (
        <View style={styles.daySummaryDashboard}>
          <View style={styles.summaryItem}>
            <View style={[styles.bullet, { backgroundColor: '#007AFF' }]} />
            <Text style={styles.summaryLabel}>Cal:</Text>
            <Text style={[styles.summaryValue, { color: '#007AFF' }]}>
              {dailyTotals.calories.toFixed(0)} kcal
            </Text>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryItem}>
            <View style={[styles.bullet, { backgroundColor: '#34C759' }]} />
            <Text style={styles.summaryLabel}>Protein:</Text>
            <Text style={[styles.summaryValue, { color: '#34C759' }]}>
              {dailyTotals.protein.toFixed(1)}g
            </Text>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryItem}>
            <View style={[styles.bullet, { backgroundColor: '#AF52DE' }]} />
            <Text style={styles.summaryLabel}>Fiber:</Text>
            <Text style={[styles.summaryValue, { color: '#AF52DE' }]}>
              {dailyTotals.fiber.toFixed(1)}g
            </Text>
          </View>
        </View>
      )}

      {/* Header Context Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Meals on {displayTitle}</Text>
      </View>

      {/* Meals Construction List Matrix */}
      <FlatList
        data={currentDayMeals}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listPadding}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.mealCard}
            activeOpacity={0.7}
            onPress={() => handleOpenEdit(item)}
          >
            {/* Meal Ingredient/Dish Thumbnail Image */}
            <FoodImage name={item.name} size={48} />

            <View style={styles.mealMeta}>
              <View style={styles.mealHeaderRow}>
                <Text style={styles.mealName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.portionBadge}>x{item.portionSize}</Text>
              </View>

              {/* Highlighted Macro Bullets */}
              <View style={styles.cardMacroRow}>
                <Text style={styles.calText}>{item.totalCalories} kcal</Text>
                <Text style={styles.macroDot}>•</Text>
                <Text style={styles.proteinText}>P: {item.totalProtein}g</Text>
                <Text style={styles.macroDot}>•</Text>
                <Text style={styles.fiberText}>F: {item.totalFiber}g</Text>
              </View>

              <Text style={styles.logTimeStr}>{item.loggedAtTime}</Text>
            </View>

            {/* Quick-action inline deletion */}
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => removeMeal(targetDateString, item.id)}
              activeOpacity={0.6}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="trash-outline" size={18} color="#FF3B30" />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="restaurant-outline" size={48} color="#C7C7CC" />
            <Text style={styles.emptyText}>No food logs entered for this date.</Text>
          </View>
        }
      />

      {/* Sticky Bottom Floating Action Logging Button */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.8}
        onPress={handleOpenCreate}
      >
        <Ionicons name="add" size={30} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Log Meal Interface Sheet Overlay Portal */}
      <LogMealModal
        isVisible={isLogModalOpen}
        onClose={handleCloseModal}
        targetDateString={targetDateString}
        mealToEdit={selectedMealForEdit}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },

  /* Enhanced Summary Dashboard Strip */
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bullet: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginRight: 5,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '600',
    marginRight: 3,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  summaryDivider: {
    width: 1,
    height: 14,
    backgroundColor: '#E5E5EA',
  },

  sectionHeader: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
  },
  listPadding: {
    paddingHorizontal: 20,
    paddingBottom: 90,
  },
  mealCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
    gap: 12,
  },
  mealMeta: {
    flex: 1,
    flexDirection: 'column',
  },
  mealHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  mealName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    flexShrink: 1,
  },
  portionBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: '#007AFF',
    backgroundColor: '#E1F0FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 8,
    overflow: 'hidden',
  },

  /* Card Macro Bullet Row */
  cardMacroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  calText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#007AFF',
  },
  proteinText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#34C759',
  },
  fiberText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#AF52DE',
  },
  macroDot: {
    fontSize: 10,
    color: '#C7C7CC',
    marginHorizontal: 5,
  },

  logTimeStr: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 3,
  },
  deleteButton: {
    padding: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  emptyText: {
    color: '#8E8E93',
    fontSize: 15,
    textAlign: 'center',
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
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
    zIndex: 10,
  },
});