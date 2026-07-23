import { useMealsStore } from '@/data/dataStores/meals/useMealsStore';
import { useGoalsStore } from '@/data/dataStores/useGoalStore';
import { SetGoalsModal } from '@/modals/SetGoalsModal';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { CalendarStrip } from '../../components/Calendar/calendarStrip';
import { ActivityCard } from '../../components/progress/ActivityCard';
import { NutritionRings } from '../../components/progress/NutritionRings';

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

        {/* Rings */}
        <NutritionRings
          calories={dailyTotals.calories}
          caloriesTarget={dailyCaloriesTarget}
          protein={dailyTotals.protein}
          proteinTarget={dailyProteinTarget}
          fiber={dailyTotals.fiber}
          fiberTarget={dailyFiberTarget}
        />

        {/* Active Calories Burned Card */}
        <ActivityCard
          title="Active Burn"
          iconName="barbell"
          themeColor="#FF9500"
          badgeBgColor="#FFF4E5"
          currentValue={activeCaloriesBurned}
          targetValue={dailyActiveCaloriesTarget}
          unit="kcal"
          currentLabel="Current Burn"
          targetLabel="Daily Target"
          isSyncing={isSyncingWatch}
          onEditPress={() => {
            setActiveCalInput(activeCaloriesBurned.toString());
            setIsActiveCalModalOpen(true);
          }}
          onSyncPress={handleAppleWatchSync}
        />

        {/* Steps Tracker Card */}
        <ActivityCard
          title="Steps Tracker"
          iconName="footsteps-outline"
          themeColor="#007AFF"
          badgeBgColor="#EBF8FF"
          currentValue={stepsCompleted}
          targetValue={dailyStepsTarget}
          currentLabel="Steps Taken"
          targetLabel="Daily Goal"
          isSyncing={isSyncingWatch}
          onEditPress={() => {
            setStepsInput(stepsCompleted.toString());
            setIsStepsModalOpen(true);
          }}
          onSyncPress={handleAppleWatchSync}
          formatValue={(val) => val.toLocaleString()}
        />
      </ScrollView>

      <SetGoalsModal isVisible={isGoalsModalOpen} onClose={() => setIsGoalsModalOpen(false)} />

      {/* Active Calories Modal */}
      <Modal visible={isActiveCalModalOpen} transparent animationType="fade" onRequestClose={() => setIsActiveCalModalOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Set Active Burned Calories</Text>
            <Text style={styles.modalSubtitle}>Log burned calories for {targetDateString}</Text>
            <TextInput
              style={styles.modalInput}
              keyboardType="numeric"
              placeholder="e.g. 450"
              value={activeCalInput}
              onChangeText={setActiveCalInput}
              autoFocus
            />
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
            <TextInput
              style={styles.modalInput}
              keyboardType="numeric"
              placeholder="e.g. 10000"
              value={stepsInput}
              onChangeText={setStepsInput}
              autoFocus
            />
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
  scrollContent: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  titleWrapper: { flex: 1, marginRight: 8 },
  title: { fontSize: 22, fontWeight: '700', color: '#1C1C1E' },
  subTitle: { fontSize: 13, color: '#8E8E93', marginTop: 2, fontWeight: '500' },
  adjustGoalsButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E1F0FF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  adjustGoalsText: { fontSize: 13, fontWeight: '600', color: '#007AFF', marginLeft: 4 },

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