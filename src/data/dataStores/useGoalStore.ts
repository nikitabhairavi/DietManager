import {
  fetchActiveCaloriesForDate,
  fetchStepsForDate,
  initHealthKit
} from '@/services/healthKitService';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { appStorage } from '../storage/dataStorage';

interface GoalsState {
  dailyProteinTarget: number;
  dailyFiberTarget: number;
  dailyCaloriesTarget: number;
  dailyActiveCaloriesTarget: number;
  dailyStepsTarget: number;
  
  activeCaloriesByDay: Record<string, number>;
  stepsByDay: Record<string, number>;

  setTargets: (targets: { 
    protein: number; 
    fiber: number; 
    calories: number; 
    activeCalories?: number;
    steps?: number;
  }) => void;
  
  setActiveCaloriesForDate: (dateString: string, caloriesBurned: number) => void;
  setStepsForDate: (dateString: string, steps: number) => void;
  
  syncAppleWatchCalories: (date: Date, dateString: string) => Promise<number>;
  syncAppleWatchData: (date: Date, dateString: string) => Promise<{ calories: number; steps: number }>;
}

export const useGoalsStore = create<GoalsState>()(
  persist(
    (set, get) => ({
      dailyProteinTarget: 130,
      dailyFiberTarget: 30,
      dailyCaloriesTarget: 2000,
      dailyActiveCaloriesTarget: 500,
      dailyStepsTarget: 10000,

      activeCaloriesByDay: {},
      stepsByDay: {},

      setTargets: (targets) =>
        set((state) => ({
          dailyProteinTarget: targets.protein,
          dailyFiberTarget: targets.fiber,
          dailyCaloriesTarget: targets.calories,
          dailyActiveCaloriesTarget:
            targets.activeCalories !== undefined
              ? targets.activeCalories
              : state.dailyActiveCaloriesTarget,
          dailyStepsTarget:
            targets.steps !== undefined
              ? targets.steps
              : state.dailyStepsTarget,
        })),

      setActiveCaloriesForDate: (dateString, caloriesBurned) =>
        set((state) => ({
          activeCaloriesByDay: {
            ...state.activeCaloriesByDay,
            [dateString]: caloriesBurned,
          },
        })),

      setStepsForDate: (dateString, steps) =>
        set((state) => ({
          stepsByDay: {
            ...state.stepsByDay,
            [dateString]: steps,
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

      // Combined sync for both Active Calories and Steps
      syncAppleWatchData: async (date, dateString) => {
        const isAuthorized = await initHealthKit();
        if (!isAuthorized) return { calories: 0, steps: 0 };

        const [calories, steps] = await Promise.all([
          fetchActiveCaloriesForDate(date),
          fetchStepsForDate(date),
        ]);

        get().setActiveCaloriesForDate(dateString, calories);
        get().setStepsForDate(dateString, steps);

        return { calories, steps };
      },
    }),
    {
      name: 'goals-app-state',
      storage: createJSONStorage(() => appStorage),
    }
  )
);