import { useMealsStore } from '@/data/dataStores/meals/useMealsStore';
import { useRewardsStore } from '@/data/dataStores/rewards/useRewardsStore';
import { useGoalsStore } from '@/data/dataStores/useGoalStore';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo } from 'react';
import { Alert, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Rewards() {
  const now = useMemo(() => new Date(), []);
  const currentMonthString = useMemo(() => now.toISOString().slice(0, 7), [now]);

  // Read raw structural state values directly
  const mealsByDay = useMealsStore((state) => state.mealsByDay);
  const dailyCalorieGoal = useGoalsStore((state) => state.dailyCaloriesTarget) || 2000;

  const pointsEarned = useRewardsStore((state) => state.pointsEarned);
  const pointsSpent = useRewardsStore((state) => state.pointsSpent);
  const syncPoints = useRewardsStore((state) => state.syncPoints);
  const redeemPoints = useRewardsStore((state) => state.redeemPoints);

  const currentBalance = useMemo(() => {
    return Math.max(0, pointsEarned - pointsSpent);
  }, [pointsEarned, pointsSpent]);

  // Compute live calorie limits safely in the effect layer
  useEffect(() => {
    let computedEarned = 0;

    Object.keys(mealsByDay).forEach((dateKey) => {
      if (dateKey.startsWith(currentMonthString)) {
        const dayMeals = mealsByDay[dateKey] || [];
        const dailyTotalCal = dayMeals.reduce((sum, meal) => sum + meal.totalCalories, 0);

        if (dailyTotalCal > 0 && dailyTotalCal < dailyCalorieGoal) {
          computedEarned += 10;
        }
      }
    });

    syncPoints(computedEarned, currentMonthString);
  }, [mealsByDay, dailyCalorieGoal, currentMonthString, syncPoints]);

  const handleRedeem = () => {
    const success = redeemPoints(50);
    if (success) {
      Alert.alert("Success!", "50 Points redeemed successfully.");
    } else {
      Alert.alert("Insufficient Balance", "Keep tracking consistently to earn more reward points!");
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Rewards</Text>
          <Text style={styles.subtitle}>Points reset automatically on the 1st of each month.</Text>
        </View>

        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceValue}>
            {currentBalance} <Text style={styles.ptsUnit}>pts</Text>
          </Text>
        </View>

        <View style={styles.row}>
          <View style={[styles.splitCard, styles.earnedCard]}>
            <View style={styles.iconContainer}>
              <Ionicons name="trending-up-outline" size={20} color="#34C759" />
            </View>
            <Text style={styles.splitLabel}>Total Earned</Text>
            <Text style={styles.splitValue}>{pointsEarned} pts</Text>
          </View>

          <View style={[styles.splitCard, styles.spentCard]}>
            <View style={styles.iconContainer}>
              <Ionicons name="trending-down-outline" size={20} color="#FF3B30" />
            </View>
            <Text style={styles.splitLabel}>Total Spent</Text>
            <Text style={styles.splitValue}>{pointsSpent} pts</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.actionButton, currentBalance < 50 && styles.disabledButton]}
          onPress={handleRedeem}
          disabled={currentBalance < 50}
          activeOpacity={0.8}
        >
          <Ionicons name="gift-outline" size={20} color="#FFFFFF" style={styles.iconGap} />
          <Text style={styles.actionText}>Spend 50 Points</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: '#F2F2F7' },
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 16 },
  header: { marginBottom: 24 },
  title: { fontSize: 34, fontWeight: '700', color: '#1C1C1E', letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: '#8E8E93', marginTop: 4, lineHeight: 18 },
  balanceCard: { backgroundColor: '#1C1C1E', borderRadius: 24, padding: 28, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.12, shadowRadius: 10, elevation: 4 },
  balanceLabel: { fontSize: 13, fontWeight: '600', color: '#AEAEB2', textTransform: 'uppercase', letterSpacing: 0.8 },
  balanceValue: { fontSize: 52, fontWeight: '800', color: '#FFFFFF', marginTop: 6, letterSpacing: -1 },
  ptsUnit: { fontSize: 24, fontWeight: '600', color: '#FFD700' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  splitCard: { flex: 0.48, borderRadius: 20, padding: 18, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E5EA' },
  earnedCard: { borderTopWidth: 4, borderTopColor: '#34C759' },
  spentCard: { borderTopWidth: 4, borderTopColor: '#FF3B30' },
  iconContainer: { marginBottom: 10 },
  splitLabel: { fontSize: 13, color: '#8E8E93', fontWeight: '500' },
  splitValue: { fontSize: 22, fontWeight: '700', color: '#1C1C1E', marginTop: 4 },
  actionButton: { backgroundColor: '#007AFF', flexDirection: 'row', borderRadius: 16, paddingVertical: 16, alignItems: 'center', justifyContent: 'center', marginTop: 32, shadowColor: '#007AFF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 6 },
  disabledButton: { backgroundColor: '#AEAEB2', shadowOpacity: 0 },
  iconGap: { marginRight: 8 },
  actionText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' }
});