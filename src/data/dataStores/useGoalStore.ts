import { fetchActiveCaloriesForDate, initHealthKit } from '@/app/services/healthKitService';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { appStorage } from '../storage/dataStorage';

interface GoalsState {
  dailyProteinTarget: number;
  dailyFiberTarget: number;
  dailyCaloriesTarget: number;
  dailyActiveCaloriesTarget: number;
  activeCaloriesByDay: Record<string, number>;
  
  setTargets: (targets: { 
    protein: number; 
    fiber: number; 
    calories: number; 
    activeCalories?: number;
  }) => void;
  
  setActiveCaloriesForDate: (dateString: string, caloriesBurned: number) => void;
  syncAppleWatchCalories: (date: Date, dateString: string) => Promise<number>;
}

export const useGoalsStore = create<GoalsState>()(
  persist(
    (set, get) => ({
      dailyProteinTarget: 130,
      dailyFiberTarget: 30,
      dailyCaloriesTarget: 2000,
      dailyActiveCaloriesTarget: 500,
      activeCaloriesByDay: {},

      setTargets: (targets) =>
        set((state) => ({
          dailyProteinTarget: targets.protein,
          dailyFiberTarget: targets.fiber,
          dailyCaloriesTarget: targets.calories,
          dailyActiveCaloriesTarget:
            targets.activeCalories !== undefined
              ? targets.activeCalories
              : state.dailyActiveCaloriesTarget,
        })),

      setActiveCaloriesForDate: (dateString, caloriesBurned) =>
        set((state) => ({
          activeCaloriesByDay: {
            ...state.activeCaloriesByDay,
            [dateString]: caloriesBurned,
          },
        })),

      // Sync active calories from Apple Watch into Zustand state
      syncAppleWatchCalories: async (date, dateString) => {
        const isAuthorized = await initHealthKit();
        if (!isAuthorized) return 0;

        const burned = await fetchActiveCaloriesForDate(date);
        get().setActiveCaloriesForDate(dateString, burned);
        return burned;
      },
    }),
    {
      name: 'goals-app-state',
      storage: createJSONStorage(() => appStorage),
    }
  )
);