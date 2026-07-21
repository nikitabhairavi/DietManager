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
import Svg, { Circle } from 'react-native-svg';
import { CalendarStrip } from '../../components/meals/calendarStrip';

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

  // Concentric Circle Dimensions
  const centerPos = 110;
  const strokeWidth = 12;

  // Ring Radii
  const calRadius = 90;
  const proteinRadius = 72;
  const fiberRadius = 54;

  // Circumferences
  const calCircumference = 2 * Math.PI * calRadius;
  const proteinCircumference = 2 * Math.PI * proteinRadius;
  const fiberCircumference = 2 * Math.PI * fiberRadius;

  // Offsets
  const calOffset = calCircumference - (macroPercentages.calories / 100) * calCircumference;
  const proteinOffset = proteinCircumference - (macroPercentages.protein / 100) * proteinCircumference;
  const fiberOffset = fiberCircumference - (macroPercentages.fiber / 100) * fiberCircumference;

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

        {/* Concentric Macro Rings Card */}
        <View style={styles.ringsCard}>
          <View style={styles.ringsContainer}>
            <Svg width={220} height={220}>
              {/* Outer Ring: Calories Background */}
              <Circle
                cx={centerPos}
                cy={centerPos}
                r={calRadius}
                stroke="#E5E5EA"
                strokeWidth={strokeWidth}
                fill="none"
              />
              {/* Outer Ring: Calories Progress */}
              <Circle
                cx={centerPos}
                cy={centerPos}
                r={calRadius}
                stroke="#FF9500"
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={calCircumference}
                strokeDashoffset={calOffset}
                strokeLinecap="round"
                rotation="-90"
                origin={`${centerPos}, ${centerPos}`}
              />

              {/* Middle Ring: Protein Background */}
              <Circle
                cx={centerPos}
                cy={centerPos}
                r={proteinRadius}
                stroke="#E5E5EA"
                strokeWidth={strokeWidth}
                fill="none"
              />
              {/* Middle Ring: Protein Progress */}
              <Circle
                cx={centerPos}
                cy={centerPos}
                r={proteinRadius}
                stroke="#007AFF"
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={proteinCircumference}
                strokeDashoffset={proteinOffset}
                strokeLinecap="round"
                rotation="-90"
                origin={`${centerPos}, ${centerPos}`}
              />

              {/* Inner Ring: Fiber Background */}
              <Circle
                cx={centerPos}
                cy={centerPos}
                r={fiberRadius}
                stroke="#E5E5EA"
                strokeWidth={strokeWidth}
                fill="none"
              />
              {/* Inner Ring: Fiber Progress */}
              <Circle
                cx={centerPos}
                cy={centerPos}
                r={fiberRadius}
                stroke="#34C759"
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={fiberCircumference}
                strokeDashoffset={fiberOffset}
                strokeLinecap="round"
                rotation="-90"
                origin={`${centerPos}, ${centerPos}`}
              />
            </Svg>

            {/* Center Summary Label */}
            <View style={styles.centerTextOverlay}>
              <Text style={styles.centerCalValue}>
                {dailyTotals.calories.toFixed(0)}
              </Text>
              <Text style={styles.centerCalTarget}>/ {dailyCaloriesTarget} kcal</Text>
            </View>
          </View>

          {/* Key Legend Below Rings */}
          <View style={styles.legendRow}>
            {/* Calories Legend */}
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#FF9500' }]} />
              <View>
                <Text style={styles.legendTitle}>Calories</Text>
                <Text style={styles.legendSub}>
                  {dailyTotals.calories.toFixed(0)} / {dailyCaloriesTarget}
                </Text>
              </View>
            </View>

            {/* Protein Legend */}
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#007AFF' }]} />
              <View>
                <Text style={styles.legendTitle}>Protein</Text>
                <Text style={styles.legendSub}>
                  {dailyTotals.protein.toFixed(1)} / {dailyProteinTarget}g
                </Text>
              </View>
            </View>

            {/* Fiber Legend */}
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#34C759' }]} />
              <View>
                <Text style={styles.legendTitle}>Fiber</Text>
                <Text style={styles.legendSub}>
                  {dailyTotals.fiber.toFixed(1)} / {dailyFiberTarget}g
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Active Calories Burned (Weight Lifting / Workout focus) */}
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

          {/* Stats Dashboard Grid */}
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

          {/* Progress Bar */}
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: `${macroPercentages.activeCalories}%`, backgroundColor: '#FF9500' }]} />
          </View>
        </View>

        {/* Steps Completed Card (Boot / Walking focus) */}
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

          {/* Stats Dashboard Grid */}
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

          {/* Progress Bar */}
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: `${macroPercentages.steps}%`, backgroundColor: '#007AFF' }]} />
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

  // Concentric Rings Section
  ringsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  ringsContainer: {
    width: 220,
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  centerTextOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerCalValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1C1C1E',
  },
  centerCalTarget: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
    marginTop: 2,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E5EA',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  legendSub: {
    fontSize: 11,
    color: '#8E8E93',
    fontWeight: '500',
  },

  // Dynamic Activity Dashboard Cards
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

  // Modals
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