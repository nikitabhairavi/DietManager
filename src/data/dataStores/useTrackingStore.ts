import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { appStorage } from '../storage/dataStorage';
import { useGoalsStore } from './useGoalStore';

export interface ConsumedMeal {
  id: string;
  recipeId: string;
  recipeName: string;
  timeConsumed: string; // e.g., "08:30 AM" or an ISO timestamp string
  portions: number;     // User portion multiplier (e.g., 0.5, 1.0, 2.5)
}

export interface DailyLog {
  date: string;         // Primary key format: YYYY-MM-DD
  meals: ConsumedMeal[];
  caloriesConsumed: number;
  proteinConsumed: number;
  fiberConsumed: number;
  statusColor: 'red' | 'yellow' | 'green';
}

interface TrackingState {
  dailyLogs: Record<string, DailyLog>; // Structured dictionary for O(1) date lookups
  logMeal: (
    date: string, 
    meal: Omit<ConsumedMeal, 'id'>, 
    recipeBaseMacros: { calories: number; protein: number; fiber: number }
  ) => void;
  removeMeal: (date: string, mealId: string, mealPortions: number, recipeBaseMacros: { calories: number; protein: number; fiber: number }) => void;
}

// Internal helper to handle the status rule evaluations
const calculateStatusColor = (calories: number, protein: number, fiber: number): 'red' | 'yellow' | 'green' => {
  const { dailyCaloriesTarget, dailyProteinTarget, dailyFiberTarget } = useGoalsStore.getState();
  
  const proteinMet = protein >= dailyProteinTarget;
  const fiberMet = fiber >= dailyFiberTarget;
  // Green zone: hits both protein and fiber milestones, and keeps calories within a 200 kcal limit under target
  const caloriesWithinRange = calories <= dailyCaloriesTarget && calories >= (dailyCaloriesTarget - 200);

  if (proteinMet && fiberMet && caloriesWithinRange) {
    return 'green';
  }
  // Yellow zone: hitting at least 80% of protein goals or remaining under maximum calorie thresholds
  if (protein >= (dailyProteinTarget * 0.8) || calories <= dailyCaloriesTarget) {
    return 'yellow';
  }
  return 'red';
};

export const useTrackingStore = create<TrackingState>()(
  persist(
    (set) => ({
      dailyLogs: {},
      
      logMeal: (date, meal, recipeBaseMacros) => set((state) => {
        const existingLog = state.dailyLogs[date] || {
          date,
          meals: [],
          caloriesConsumed: 0,
          proteinConsumed: 0,
          fiberConsumed: 0,
          statusColor: 'red',
        };

        const newMeal: ConsumedMeal = { 
          ...meal, 
          id: Math.random().toString(36).substring(7) 
        };
        
        // Scale the macros dynamically against the exact fractional portions logged
        const totalCal = existingLog.caloriesConsumed + (recipeBaseMacros.calories * meal.portions);
        const totalProt = existingLog.proteinConsumed + (recipeBaseMacros.protein * meal.portions);
        const totalFib = existingLog.fiberConsumed + (recipeBaseMacros.fiber * meal.portions);

        return {
          dailyLogs: {
            ...state.dailyLogs,
            [date]: {
              date,
              meals: [...existingLog.meals, newMeal],
              caloriesConsumed: totalCal,
              proteinConsumed: totalProt,
              fiberConsumed: totalFib,
              statusColor: calculateStatusColor(totalCal, totalProt, totalFib),
            },
          },
        };
      }),
      
      removeMeal: (date, mealId, mealPortions, recipeBaseMacros) => set((state) => {
        const existingLog = state.dailyLogs[date];
        if (!existingLog) return state;

        const updatedMeals = existingLog.meals.filter((m) => m.id !== mealId);
        
        // Cleanly subtract out the scaled macro values of the removed portion
        const totalCal = Math.max(0, existingLog.caloriesConsumed - (recipeBaseMacros.calories * mealPortions));
        const totalProt = Math.max(0, existingLog.proteinConsumed - (recipeBaseMacros.protein * mealPortions));
        const totalFib = Math.max(0, existingLog.fiberConsumed - (recipeBaseMacros.fiber * mealPortions));

        return {
          dailyLogs: {
            ...state.dailyLogs,
            [date]: {
              date,
              meals: updatedMeals,
              caloriesConsumed: totalCal,
              proteinConsumed: totalProt,
              fiberConsumed: totalFib,
              statusColor: calculateStatusColor(totalCal, totalProt, totalFib),
            },
          },
        };
      }),
    }),
    {
      name: 'tracking-app-state',
      storage: createJSONStorage(() => appStorage),
    }
  )
);