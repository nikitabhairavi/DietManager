
import { useMealsStore } from '@/data/dataStores/meals/useMealsStore';
import { useGoalsStore } from '@/data/dataStores/useGoalStore';
import { SetGoalsModal } from '@/modals/SetGoalsModal';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CalendarStrip } from '../components/meals/calendarStrip';

export default function ProgressScreen() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isGoalsModalOpen, setIsGoalsModalOpen] = useState(false);

  const mealsByDay = useMealsStore((state) => state.mealsByDay);

  // Destructure targets directly from your existing useGoalsStore implementation
  const { dailyCaloriesTarget, dailyProteinTarget, dailyFiberTarget } = useGoalsStore();

  const formatDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const targetDateString = useMemo(() => formatDateString(selectedDate), [selectedDate]);

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

  // Compute math fulfillment bar ranges tied to your specific store keys
  const macroPercentages = useMemo(() => {
    return {
      calories: Math.min((dailyTotals.calories / dailyCaloriesTarget) * 100, 100),
      protein: Math.min((dailyTotals.protein / dailyProteinTarget) * 100, 100),
      fiber: Math.min((dailyTotals.fiber / dailyFiberTarget) * 100, 100),
    };
  }, [dailyTotals, dailyCaloriesTarget, dailyProteinTarget, dailyFiberTarget]);

  const displayTitle = useMemo(() => {
    return selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }, [selectedDate]);

  return (
    <SafeAreaView style={styles.container}>
      <CalendarStrip selectedDate={selectedDate} onDateSelect={(date) => setSelectedDate(date)} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header containing text title and the operational goals toggle button */}
        <View style={styles.headerRow}>
          <View style={styles.titleWrapper}>
            <Text style={styles.title}>Targets Progression</Text>
            <Text style={styles.subTitle}>{displayTitle}</Text>
          </View>
          <TouchableOpacity
            style={styles.adjustGoalsButton}
            activeOpacity={0.7}
            onPress={() => setIsGoalsModalOpen(true)}
          >
            <Ionicons name="options-outline" size={16} color="#007AFF" />
            <Text style={styles.adjustGoalsText}>Set Goals</Text>
          </TouchableOpacity>
        </View>

        {/* Calories Progress Card */}
        <View style={styles.metricContainer}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricLabel}>Calories</Text>
            <Text style={styles.metricValue}>
              {dailyTotals.calories.toFixed(0)} / {dailyCaloriesTarget} kcal
            </Text>
          </View>
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: `${macroPercentages.calories}%`, backgroundColor: '#007AFF' }]} />
          </View>
          <Text style={styles.percentageText}>
            {((dailyTotals.calories / dailyCaloriesTarget) * 100).toFixed(0)}% Complete
          </Text>
        </View>

        {/* Protein Progress Card */}
        <View style={styles.metricContainer}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricLabel}>Protein</Text>
            <Text style={styles.metricValue}>
              {dailyTotals.protein.toFixed(1)}g / {dailyProteinTarget}g
            </Text>
          </View>
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: `${macroPercentages.protein}%`, backgroundColor: '#34C759' }]} />
          </View>
          <Text style={styles.percentageText}>
            {((dailyTotals.protein / dailyProteinTarget) * 100).toFixed(0)}% Complete
          </Text>
        </View>

        {/* Fiber Progress Card */}
        <View style={styles.metricContainer}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricLabel}>Fiber</Text>
            <Text style={styles.metricValue}>
              {dailyTotals.fiber.toFixed(1)}g / {dailyFiberTarget}g
            </Text>
          </View>
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: `${macroPercentages.fiber}%`, backgroundColor: '#AF52DE' }]} />
          </View>
          <Text style={styles.percentageText}>
            {((dailyTotals.fiber / dailyFiberTarget) * 100).toFixed(0)}% Complete
          </Text>
        </View>
      </ScrollView>

      {/* Target config overlay portal */}
      <SetGoalsModal isVisible={isGoalsModalOpen} onClose={() => setIsGoalsModalOpen(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  scrollContent: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  titleWrapper: { flex: 1, marginRight: 8 },
  title: { fontSize: 22, fontWeight: '700', color: '#1C1C1E' },
  subTitle: { fontSize: 14, color: '#8E8E93', marginTop: 2, fontWeight: '500' },
  adjustGoalsButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E1F0FF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  adjustGoalsText: { fontSize: 13, fontWeight: '600', color: '#007AFF', marginLeft: 4 },
  metricContainer: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 18, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 },
  metricHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  metricLabel: { fontSize: 16, fontWeight: '600', color: '#3A3A3C' },
  metricValue: { fontSize: 14, color: '#666666', fontWeight: '500' },
  progressBarTrack: { height: 12, backgroundColor: '#E5E5EA', borderRadius: 6, overflow: 'hidden', marginBottom: 6 },
  progressBarFill: { height: '100%', borderRadius: 6 },
  percentageText: { fontSize: 12, color: '#8E8E93', textAlign: 'right', fontWeight: '500' },
});