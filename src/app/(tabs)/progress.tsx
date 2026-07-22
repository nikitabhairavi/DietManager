import { useMealsStore } from '@/data/dataStores/meals/useMealsStore';
import { useGoalsStore } from '@/data/dataStores/useGoalStore';
import { SetGoalsModal } from '@/modals/SetGoalsModal';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { CalendarStrip } from '../../components/meals/calendarStrip';
import { NutritionRings } from '../../components/progress/NutritionRings'; // Adjust path as needed

export default function ProgressScreen() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isGoalsModalOpen, setIsGoalsModalOpen] = useState(false);

  // Modals for manual entries
  const [isActiveCalModalOpen, setIsActiveCalModalOpen] = useState(false);
  const [activeCalInput, setActiveCalInput] = useState('');

  const [isStepsModalOpen, setIsStepsModalOpen] = useState(false);
  const [stepsInput, setStepsInput] = useState('');

  const [isSyncingWatch, setIsSyncingWatch] = useState(false);

  const mealsByDay = useMealsStore((state) => state.mealsByDay);

  const {
    dailyCaloriesTarget,
    dailyProteinTarget,
    dailyFiberTarget,
    dailyActiveCaloriesTarget = 500,
    dailyStepsTarget = 10000,
    activeCaloriesByDay = {},
    stepsByDay = {},
    setActiveCaloriesForDate,
    setStepsForDate,
    syncAppleWatchData,
  } = useGoalsStore();

  const formatDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const targetDateString = useMemo(() => formatDateString(selectedDate), [selectedDate]);

  const activeCaloriesBurned = activeCaloriesByDay[targetDateString] || 0;
  const stepsCompleted = stepsByDay[targetDateString] || 0;

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

  const activityPercentages = useMemo(() => {
    return {
      activeCalories: Math.min((activeCaloriesBurned / (dailyActiveCaloriesTarget || 1)) * 100, 100),
      steps: Math.min((stepsCompleted / (dailyStepsTarget || 1)) * 100, 100),
    };
  }, [activeCaloriesBurned, dailyActiveCaloriesTarget, stepsCompleted, dailyStepsTarget]);

  const displayTitle = useMemo(() => {
    return selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }, [selectedDate]);

  const handleSaveActiveCalories = () => {
    const parsedValue = parseFloat(activeCalInput);
    if (!isNaN(parsedValue) && setActiveCaloriesForDate) {
      setActiveCaloriesForDate(targetDateString, parsedValue);
    }
    setIsActiveCalModalOpen(false);
    setActiveCalInput('');
  };

  const handleSaveSteps = () => {
    const parsedValue = parseInt(stepsInput, 10);
    if (!isNaN(parsedValue) && setStepsForDate) {
      setStepsForDate(targetDateString, parsedValue);
    }
    setIsStepsModalOpen(false);
    setStepsInput('');
  };

  const handleAppleWatchSync = async () => {
    if (!syncAppleWatchData) return;
    setIsSyncingWatch(true);
    await syncAppleWatchData(selectedDate, targetDateString);
    setIsSyncingWatch(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <CalendarStrip selectedDate={selectedDate} onDateSelect={(date) => setSelectedDate(date)} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
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

        {/* Separated Circular Component */}
        <NutritionRings
          calories={dailyTotals.calories}
          caloriesTarget={dailyCaloriesTarget}
          protein={dailyTotals.protein}
          proteinTarget={dailyProteinTarget}
          fiber={dailyTotals.fiber}
          fiberTarget={dailyFiberTarget}
        />

        {/* Active Calories Burned */}
        <View style={styles.activityCard}>
          <View style={styles.activityHeader}>
            <View style={styles.activityTitleGroup}>
              <View style={[styles.activityIconBadge, { backgroundColor: '#FFF4E5' }]}>
                <Ionicons name="barbell" size={20} color="#FF9500" />
              </View>
              <Text style={styles.activityTitle}>Active Burn</Text>
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity
                onPress={() => {
                  setActiveCalInput(activeCaloriesBurned.toString());
                  setIsActiveCalModalOpen(true);
                }}
                style={styles.editIconBtn}
              >
                <Ionicons name="pencil-sharp" size={14} color="#007AFF" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleAppleWatchSync}
                style={[styles.editIconBtn, { marginLeft: 6 }]}
                disabled={isSyncingWatch}
              >
                {isSyncingWatch ? (
                  <ActivityIndicator size="small" color="#007AFF" />
                ) : (
                  <Ionicons name="watch-outline" size={15} color="#007AFF" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statColumn}>
              <Text style={styles.statNumber}>{activeCaloriesBurned.toFixed(0)} <Text style={styles.statUnit}>kcal</Text></Text>
              <Text style={styles.statLabel}>Current Burn</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statColumn}>
              <Text style={styles.statNumber}>{dailyActiveCaloriesTarget} <Text style={styles.statUnit}>kcal</Text></Text>
              <Text style={styles.statLabel}>Daily Target</Text>
            </View>

            <View style={[styles.completionBadge, { backgroundColor: '#FFF4E5' }]}>
              <Text style={[styles.completionText, { color: '#FF9500' }]}>
                {((activeCaloriesBurned / (dailyActiveCaloriesTarget || 1)) * 100).toFixed(0)}%
              </Text>
            </View>
          </View>

          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: `${activityPercentages.activeCalories}%`, backgroundColor: '#FF9500' }]} />
          </View>
        </View>

        {/* Steps Completed */}
        <View style={styles.activityCard}>
          <View style={styles.activityHeader}>
            <View style={styles.activityTitleGroup}>
              <View style={[styles.activityIconBadge, { backgroundColor: '#EBF8FF' }]}>
                <Ionicons name="footsteps-outline" size={20} color="#007AFF" />
              </View>
              <Text style={styles.activityTitle}>Steps Tracker</Text>
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity
                onPress={() => {
                  setStepsInput(stepsCompleted.toString());
                  setIsStepsModalOpen(true);
                }}
                style={styles.editIconBtn}
              >
                <Ionicons name="pencil-sharp" size={14} color="#007AFF" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleAppleWatchSync}
                style={[styles.editIconBtn, { marginLeft: 6 }]}
                disabled={isSyncingWatch}
              >
                {isSyncingWatch ? (
                  <ActivityIndicator size="small" color="#007AFF" />
                ) : (
                  <Ionicons name="watch-outline" size={15} color="#007AFF" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statColumn}>
              <Text style={styles.statNumber}>{stepsCompleted.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Steps Taken</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statColumn}>
              <Text style={styles.statNumber}>{dailyStepsTarget.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Daily Goal</Text>
            </View>

            <View style={[styles.completionBadge, { backgroundColor: '#EBF8FF' }]}>
              <Text style={[styles.completionText, { color: '#007AFF' }]}>
                {((stepsCompleted / (dailyStepsTarget || 1)) * 100).toFixed(0)}%
              </Text>
            </View>
          </View>

          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: `${activityPercentages.steps}%`, backgroundColor: '#007AFF' }]} />
          </View>
        </View>
      </ScrollView>

      <SetGoalsModal isVisible={isGoalsModalOpen} onClose={() => setIsGoalsModalOpen(false)} />

      {/* Active Calories Modal */}
      <Modal visible={isActiveCalModalOpen} transparent animationType="fade" onRequestClose={() => setIsActiveCalModalOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Set Active Burned Calories</Text>
            <Text style={styles.modalSubtitle}>Log burned calories for {targetDateString}</Text>
            <TextInput style={styles.modalInput} keyboardType="numeric" placeholder="e.g. 450" value={activeCalInput} onChangeText={setActiveCalInput} autoFocus />
            <View style={styles.modalActionRow}>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setIsActiveCalModalOpen(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={handleSaveActiveCalories}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Steps Modal */}
      <Modal visible={isStepsModalOpen} transparent animationType="fade" onRequestClose={() => setIsStepsModalOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Set Daily Steps</Text>
            <Text style={styles.modalSubtitle}>Log total steps for {targetDateString}</Text>
            <TextInput style={styles.modalInput} keyboardType="numeric" placeholder="e.g. 10000" value={stepsInput} onChangeText={setStepsInput} autoFocus />
            <View style={styles.modalActionRow}>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setIsActiveCalModalOpen(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={handleSaveSteps}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  titleWrapper: { flex: 1, marginRight: 8 },
  title: { fontSize: 22, fontWeight: '700', color: '#1C1C1E' },
  subTitle: { fontSize: 13, color: '#8E8E93', marginTop: 2, fontWeight: '500' },
  adjustGoalsButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E1F0FF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  adjustGoalsText: { fontSize: 13, fontWeight: '600', color: '#007AFF', marginLeft: 4 },

  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  activityTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  activityIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editIconBtn: {
    padding: 6,
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
  },
  statsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9FB',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 14,
    position: 'relative',
  },
  statColumn: {
    flex: 1,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1C1C1E',
  },
  statUnit: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#8E8E93',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#E5E5EA',
    marginRight: 16,
  },
  completionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  completionText: {
    fontSize: 12,
    fontWeight: '700',
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: '#E5E5EA',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '82%', backgroundColor: '#FFFFFF', borderRadius: 18, padding: 20, alignItems: 'center' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#1C1C1E' },
  modalSubtitle: { fontSize: 12, color: '#8E8E93', marginTop: 4, marginBottom: 16 },
  modalInput: { width: '100%', backgroundColor: '#F2F2F7', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 16, color: '#1C1C1E', marginBottom: 20, textAlign: 'center' },
  modalActionRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  modalButton: { flex: 0.47, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  cancelButton: { backgroundColor: '#E5E5EA' },
  cancelButtonText: { color: '#1C1C1E', fontWeight: '600' },
  saveButton: { backgroundColor: '#007AFF' },
  saveButtonText: { color: '#FFFFFF', fontWeight: '600' },
});