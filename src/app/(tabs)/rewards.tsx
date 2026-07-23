import { DailyCriteriaCard } from '@/components/Rewards/RewardsCriteriaCard';
import { StatCard } from '@/components/Rewards/StatCard';
import { useMealsStore } from '@/data/dataStores/meals/useMealsStore';
import { useRewardsStore } from '@/data/dataStores/rewards/useRewardsStore';
import { useGoalsStore } from '@/data/dataStores/useGoalStore';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Rewards() {
  const now = useMemo(() => new Date(), []);
  const currentMonthString = useMemo(() => now.toISOString().slice(0, 7), [now]);

  // Read raw structural state values directly from stores
  const mealsByDay = useMealsStore((state) => state.mealsByDay);

  // Read goals and active daily progress from GoalsStore
  const dailyCaloriesTarget = useGoalsStore((state) => state.dailyCaloriesTarget) || 2000;
  const dailyActiveCaloriesTarget = useGoalsStore((state) => state.dailyActiveCaloriesTarget) || 500;
  const dailyStepsTarget = useGoalsStore((state) => state.dailyStepsTarget) || 10000;

  const activeCaloriesByDay = useGoalsStore((state) => state.activeCaloriesByDay);
  const stepsByDay = useGoalsStore((state) => state.stepsByDay);

  const pointsEarned = useRewardsStore((state) => state.pointsEarned);
  const pointsSpent = useRewardsStore((state) => state.pointsSpent);
  const syncPoints = useRewardsStore((state) => state.syncPoints);
  const redeemPoints = useRewardsStore((state) => state.redeemPoints);

  const currentBalance = useMemo(() => {
    return Math.max(0, pointsEarned - pointsSpent);
  }, [pointsEarned, pointsSpent]);

  // Progress percentage toward the next 50 pts redemption threshold
  const redemptionProgress = useMemo(() => {
    const progress = (currentBalance % 50) / 50;
    return Math.min(100, Math.round(progress * 100));
  }, [currentBalance]);

  // Compute live multi-goal qualification in the effect layer
  useEffect(() => {
    let computedEarned = 0;

    // Collect all date keys across meals, active calories, and steps records
    const allDateKeys = Array.from(
      new Set([
        ...Object.keys(mealsByDay),
        ...Object.keys(activeCaloriesByDay),
        ...Object.keys(stepsByDay),
      ])
    );

    allDateKeys.forEach((dateKey) => {
      if (dateKey.startsWith(currentMonthString)) {
        // 1. Calories Consumed Goal Check
        const dayMeals = mealsByDay[dateKey] || [];
        const dailyTotalCalConsumed = dayMeals.reduce((sum, meal) => sum + meal.totalCalories, 0);
        const isCalorieConsumedMet =
          dailyTotalCalConsumed > 0 && dailyTotalCalConsumed <= dailyCaloriesTarget;

        // 2. Active Calories Burned Goal Check
        const dayActiveCalories = activeCaloriesByDay[dateKey] || 0;
        const isActiveCaloriesMet = dayActiveCalories >= dailyActiveCaloriesTarget;

        // 3. Steps Completed Goal Check
        const daySteps = stepsByDay[dateKey] || 0;
        const isStepsMet = daySteps >= dailyStepsTarget;

        // ALL 3 conditions must be satisfied to earn +10 pts for the day
        if (isCalorieConsumedMet && isActiveCaloriesMet && isStepsMet) {
          computedEarned += 10;
        }
      }
    });

    syncPoints(computedEarned, currentMonthString);
  }, [
    mealsByDay,
    activeCaloriesByDay,
    stepsByDay,
    dailyCaloriesTarget,
    dailyActiveCaloriesTarget,
    dailyStepsTarget,
    currentMonthString,
    syncPoints,
  ]);

  const handleRedeem = () => {
    const success = redeemPoints(50);
    if (success) {
      Alert.alert("🎉 Reward Unlocked!", "50 Points redeemed successfully.");
    } else {
      Alert.alert("Insufficient Balance", "Complete all 3 daily goals to stack up more points!");
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.title}>Rewards Hub</Text>
          <Text style={styles.subtitle}>Points reset automatically on the 1st of each month.</Text>
        </View>

        {/* Hero Balance Card */}
        <View style={styles.heroCard}>
          <View style={styles.badgeHeader}>
            <View style={styles.trophyIconBg}>
              <Ionicons name="trophy" size={20} color="#FFD700" />
            </View>

            <View style={styles.statusChip}>
              <Text style={styles.statusChipText}>Monthly Balance</Text>
            </View>
          </View>

          <Text style={styles.balanceValue}>
            {currentBalance} <Text style={styles.ptsUnit}>PTS</Text>
          </Text>

          {/* Progress Bar towards next 50-point milestone */}
          <View style={styles.progressSection}>
            <View style={styles.progressLabelRow}>
              <Text style={styles.progressText}>Next Reward Goal</Text>
              <Text style={styles.progressPercentText}>{redemptionProgress}%</Text>
            </View>
            <View style={styles.progressBarTrack}>
              <View style={[styles.progressBarFill, { width: `${redemptionProgress}%` }]} />
            </View>
          </View>
        </View>

        {/* Reusable Total Earned vs Total Spent Row */}
        <View style={styles.row}>
          <StatCard label="Total Earned" value={pointsEarned} type="earned" />
          <StatCard label="Total Spent" value={pointsSpent} type="spent" />
        </View>

        {/* Modular Daily Rules Card */}
        <DailyCriteriaCard
          dailyCaloriesTarget={dailyCaloriesTarget}
          dailyActiveCaloriesTarget={dailyActiveCaloriesTarget}
          dailyStepsTarget={dailyStepsTarget}
        />

        {/* Redeem Action Button */}
        <TouchableOpacity
          style={[styles.actionButton, currentBalance < 50 && styles.disabledButton]}
          onPress={handleRedeem}
          disabled={currentBalance < 50}
          activeOpacity={0.8}
        >
          <Ionicons name="gift-outline" size={22} color="#FFFFFF" style={styles.iconGap} />
          <Text style={styles.actionText}>Redeem 50 Points</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: '#F2F2F7' },
  scrollContainer: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  header: { marginBottom: 20 },
  title: { fontSize: 32, fontWeight: '800', color: '#1C1C1E', letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: '#8E8E93', marginTop: 4, lineHeight: 18 },

  /* Hero Card */
  heroCard: {
    backgroundColor: '#111827',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
  },
  badgeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trophyIconBg: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  statusChipText: {
    color: '#9CA3AF',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  balanceValue: {
    fontSize: 52,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 16,
    letterSpacing: -1.5,
  },
  ptsUnit: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFD700',
  },

  /* Progress Bar */
  progressSection: { marginTop: 18 },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressText: { fontSize: 12, color: '#9CA3AF', fontWeight: '500' },
  progressPercentText: { fontSize: 12, color: '#FFD700', fontWeight: '700' },
  progressBarTrack: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 3,
  },

  /* Split Row Layout */
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },

  /* Action Button */
  actionButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  disabledButton: { backgroundColor: '#C7C7CC', shadowOpacity: 0 },
  iconGap: { marginRight: 8 },
  actionText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});