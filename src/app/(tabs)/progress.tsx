import { useMealsStore } from '@/data/dataStores/meals/useMealsStore';
import React, { useMemo, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { CalendarStrip } from '../components/meals/calendarStrip';

// Define static daily tracking baselines
const MACRO_TARGETS = {
  calories: 2000, // target baseline threshold kcal
  protein: 130,   // target protein metric grams
  fiber: 30,      // target digestive fiber grams
};

export default function ProgressScreen() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const mealsByDay = useMealsStore((state) => state.mealsByDay);

  // Utility to match structured key dates (e.g., YYYY-MM-DD)
  const formatDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const targetDateString = useMemo(() => formatDateString(selectedDate), [selectedDate]);

  // Aggregate total consumption for the chosen calendar day
  const dailyTotals = useMemo(() => {
    const dayMeals = mealsByDay[targetDateString] || [];
    return dayMeals.reduce(
      (acc, meal) => {
        acc.calories += meal.totalCalories;
        acc.protein += meal.totalProtein;
        acc.fiber += meal.totalFiber;
        return acc;
      },
      { calories: 0, protein: 0, fiber: 0 }
    );
  }, [mealsByDay, targetDateString]);

  // Calculate percentage fulfillment capped at 100% for layout bounding constraints
  const macroPercentages = useMemo(() => {
    return {
      calories: Math.min((dailyTotals.calories / MACRO_TARGETS.calories) * 100, 100),
      protein: Math.min((dailyTotals.protein / MACRO_TARGETS.protein) * 100, 100),
      fiber: Math.min((dailyTotals.fiber / MACRO_TARGETS.fiber) * 100, 100),
    };
  }, [dailyTotals]);

  const displayTitle = useMemo(() => {
    return selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }, [selectedDate]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Horizontal Calendar Strip */}
      <CalendarStrip
        selectedDate={selectedDate}
        onDateSelect={(date) => setSelectedDate(date)}
      />

      <View style={styles.content}>
        <Text style={styles.title}>Macro Targets for {displayTitle}</Text>

        {/* --- Calories Bar Progress Row --- */}
        <View style={styles.metricContainer}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricLabel}>Calories</Text>
            <Text style={styles.metricValue}>
              {dailyTotals.calories.toFixed(0)} / {MACRO_TARGETS.calories} kcal
            </Text>
          </View>
          <View style={styles.progressBarTrack}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${macroPercentages.calories}%`, backgroundColor: '#007AFF' }
              ]}
            />
          </View>
          <Text style={styles.percentageText}>{((dailyTotals.calories / MACRO_TARGETS.calories) * 100).toFixed(0)}% Complete</Text>
        </View>

        {/* --- Protein Bar Progress Row --- */}
        <View style={styles.metricContainer}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricLabel}>Protein</Text>
            <Text style={styles.metricValue}>
              {dailyTotals.protein.toFixed(1)}g / {MACRO_TARGETS.protein}g
            </Text>
          </View>
          <View style={styles.progressBarTrack}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${macroPercentages.protein}%`, backgroundColor: '#34C759' }
              ]}
            />
          </View>
          <Text style={styles.percentageText}>{((dailyTotals.protein / MACRO_TARGETS.protein) * 100).toFixed(0)}% Complete</Text>
        </View>

        {/* --- Fiber Bar Progress Row --- */}
        <View style={styles.metricContainer}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricLabel}>Fiber</Text>
            <Text style={styles.metricValue}>
              {dailyTotals.fiber.toFixed(1)}g / {MACRO_TARGETS.fiber}g
            </Text>
          </View>
          <View style={styles.progressBarTrack}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${macroPercentages.fiber}%`, backgroundColor: '#AF52DE' }
              ]}
            />
          </View>
          <Text style={styles.percentageText}>{((dailyTotals.fiber / MACRO_TARGETS.fiber) * 100).toFixed(0)}% Complete</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 24,
  },
  metricContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  metricLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3A3A3C',
  },
  metricValue: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  progressBarTrack: {
    height: 12,
    backgroundColor: '#E5E5EA',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 6,
  },
  percentageText: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'right',
    fontWeight: '500',
  },
});