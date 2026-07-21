import { useMealsStore } from '@/data/dataStores/meals/useMealsStore';
import { LogMealModal } from '@/modals/LogMealsModal';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CalendarStrip } from '../../components/meals/calendarStrip';

export default function DailyMealsScreen() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

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

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Horizontal Calendar Strip */}
      <CalendarStrip
        selectedDate={selectedDate}
        onDateSelect={(date) => setSelectedDate(date)}
      />

      {/* Dynamic Summary Micro Dashboard */}
      {currentDayMeals.length > 0 && (
        <View style={styles.daySummaryDashboard}>
          <Text style={styles.summaryText}>
            Logged: <Text style={styles.summaryValue}>{dailyTotals.calories.toFixed(0)} kcal</Text> | P: <Text style={styles.summaryValue}>{dailyTotals.protein.toFixed(1)}g</Text> | F: <Text style={styles.summaryValue}>{dailyTotals.fiber.toFixed(1)}g</Text>
          </Text>
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
          <View style={styles.mealCard}>
            <View style={styles.mealMeta}>
              <View style={styles.mealHeaderRow}>
                <Text style={styles.mealName}>{item.name}</Text>
                <Text style={styles.portionBadge}>x{item.portionSize}</Text>
              </View>
              <Text style={styles.mealMacros}>
                {item.totalCalories} kcal | P: {item.totalProtein}g | F: {item.totalFiber}g
              </Text>
              <Text style={styles.logTimeStr}>{item.loggedAtTime}</Text>
            </View>

            {/* Quick-action single entry inline deletion removal trigger */}
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => removeMeal(targetDateString, item.id)}
              activeOpacity={0.6}
            >
              <Ionicons name="trash-outline" size={18} color="#FF3B30" />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No food logs entered for this date.</Text>
          </View>
        }
      />

      {/* Sticky Bottom Floating Action Logging Button */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.8}
        onPress={() => setIsLogModalOpen(true)}
      >
        <Ionicons name="add" size={30} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Log Meal Interface Sheet Overlay Portal */}
      <LogMealModal
        isVisible={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        targetDateString={targetDateString}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  daySummaryDashboard: {
    backgroundColor: '#E5E5EA',
    paddingVertical: 8,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  summaryText: {
    fontSize: 14,
    color: '#48484A',
    fontWeight: '500',
  },
  summaryValue: {
    color: '#007AFF',
    fontWeight: '700',
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
    paddingBottom: 90, // Room so elements don't drop behind the floating FAB layout
  },
  mealCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  mealMeta: {
    flex: 1,
    flexDirection: 'column',
  },
  mealHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  mealName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
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
  mealMacros: {
    fontSize: 14,
    color: '#666666',
  },
  logTimeStr: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  emptyText: {
    color: '#8E8E93',
    fontSize: 16,
    textAlign: 'center',
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