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
  View
} from 'react-native';
import { CalendarStrip } from '../components/meals/calendarStrip';

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

  const macroPercentages = useMemo(() => {
    return {
      calories: Math.min((dailyTotals.calories / (dailyCaloriesTarget || 1)) * 100, 100),
      protein: Math.min((dailyTotals.protein / (dailyProteinTarget || 1)) * 100, 100),
      fiber: Math.min((dailyTotals.fiber / (dailyFiberTarget || 1)) * 100, 100),
      activeCalories: Math.min((activeCaloriesBurned / (dailyActiveCaloriesTarget || 1)) * 100, 100),
      steps: Math.min((stepsCompleted / (dailyStepsTarget || 1)) * 100, 100),
    };
  }, [dailyTotals, dailyCaloriesTarget, dailyProteinTarget, dailyFiberTarget, activeCaloriesBurned, dailyActiveCaloriesTarget, stepsCompleted, dailyStepsTarget]);

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

        {/* Calories Consumed */}
        <View style={styles.metricContainer}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricLabel}>Calories Consumed</Text>
            <Text style={styles.metricValue}>
              {dailyTotals.calories.toFixed(0)} / {dailyCaloriesTarget} kcal
            </Text>
          </View>
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: `${macroPercentages.calories}%`, backgroundColor: '#007AFF' }]} />
          </View>
          <Text style={styles.percentageText}>
            {((dailyTotals.calories / (dailyCaloriesTarget || 1)) * 100).toFixed(0)}% Complete
          </Text>
        </View>

        {/* Protein Consumed */}
        <View style={styles.metricContainer}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricLabel}>Protein Consumed</Text>
            <Text style={styles.metricValue}>
              {dailyTotals.protein.toFixed(1)}g / {dailyProteinTarget}g
            </Text>
          </View>
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: `${macroPercentages.protein}%`, backgroundColor: '#34C759' }]} />
          </View>
          <Text style={styles.percentageText}>
            {((dailyTotals.protein / (dailyProteinTarget || 1)) * 100).toFixed(0)}% Complete
          </Text>
        </View>

        {/* Fiber Consumed */}
        <View style={styles.metricContainer}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricLabel}>Fiber Consumed</Text>
            <Text style={styles.metricValue}>
              {dailyTotals.fiber.toFixed(1)}g / {dailyFiberTarget}g
            </Text>
          </View>
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: `${macroPercentages.fiber}%`, backgroundColor: '#AF52DE' }]} />
          </View>
          <Text style={styles.percentageText}>
            {((dailyTotals.fiber / (dailyFiberTarget || 1)) * 100).toFixed(0)}% Complete
          </Text>
        </View>

        {/* Active Calories Burned */}
        <View style={styles.metricContainer}>
          <View style={styles.metricHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.metricLabel}>Active Calories Burned</Text>

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

            <Text style={styles.metricValue}>
              {activeCaloriesBurned.toFixed(0)} / {dailyActiveCaloriesTarget} kcal
            </Text>
          </View>
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: `${macroPercentages.activeCalories}%`, backgroundColor: '#FF9500' }]} />
          </View>
          <Text style={styles.percentageText}>
            {((activeCaloriesBurned / (dailyActiveCaloriesTarget || 1)) * 100).toFixed(0)}% Complete
          </Text>
        </View>

        {/* Steps Completed Card */}
        <View style={styles.metricContainer}>
          <View style={styles.metricHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.metricLabel}>Steps Completed</Text>

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

            <Text style={styles.metricValue}>
              {stepsCompleted.toLocaleString()} / {dailyStepsTarget.toLocaleString()} steps
            </Text>
          </View>
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: `${macroPercentages.steps}%`, backgroundColor: '#5AC8FA' }]} />
          </View>
          <Text style={styles.percentageText}>
            {((stepsCompleted / (dailyStepsTarget || 1)) * 100).toFixed(0)}% Complete
          </Text>
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
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setIsStepsModalOpen(false)}>
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
  editIconBtn: { marginLeft: 8, padding: 4, backgroundColor: '#F2F2F7', borderRadius: 12 },
  progressBarTrack: { height: 12, backgroundColor: '#E5E5EA', borderRadius: 6, overflow: 'hidden', marginBottom: 6 },
  progressBarFill: { height: '100%', borderRadius: 6 },
  percentageText: { fontSize: 12, color: '#8E8E93', textAlign: 'right', fontWeight: '500' },
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