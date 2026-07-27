import { appStorage } from '@/data/storage/dataStorage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface PlannedMealItem {
  id: string;
  category: string; // e.g., "Breakfast", "Lunch"
  recipeId: string;
  name: string;
  portionSize: number;
  baseCalories: number;
  baseProtein: number;
  baseFiber: number;
  isCompleted: boolean;
  completedAtTime?: string;
}

interface MealPlanState {
  plansByDay: Record<string, PlannedMealItem[]>; // Key: YYYY-MM-DD
  addPlannedMeal: (dateKey: string, meal: Omit<PlannedMealItem, 'id' | 'isCompleted'>) => void;
  removePlannedMeal: (dateKey: string, id: string) => void;
  toggleCompletePlannedMeal: (dateKey: string, id: string) => { isNowCompleted: boolean; timestamp: string } | null;
}

export const useMealPlanStore = create<MealPlanState>()(
  persist(
    (set, get) => ({
      plansByDay: {},

      addPlannedMeal: (dateKey, meal) => {
        const newMeal: PlannedMealItem = {
          ...meal,
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          isCompleted: false,
        };

        set((state) => ({
          plansByDay: {
            ...state.plansByDay,
            [dateKey]: [...(state.plansByDay[dateKey] || []), newMeal],
          },
        }));
      },

      removePlannedMeal: (dateKey, id) => {
        set((state) => ({
          plansByDay: {
            ...state.plansByDay,
            [dateKey]: (state.plansByDay[dateKey] || []).filter((item) => item.id !== id),
          },
        }));
      },

      toggleCompletePlannedMeal: (dateKey, id) => {
        const dayPlans = get().plansByDay[dateKey] || [];
        const targetItem = dayPlans.find((item) => item.id === id);
        if (!targetItem) return null;

        const isNowCompleted = !targetItem.isCompleted;
        const now = new Date();
        const timestamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        set((state) => ({
          plansByDay: {
            ...state.plansByDay,
            [dateKey]: (state.plansByDay[dateKey] || []).map((item) =>
              item.id === id
                ? {
                    ...item,
                    isCompleted: isNowCompleted,
                    completedAtTime: isNowCompleted ? timestamp : undefined,
                  }
                : item
            ),
          },
        }));

        return { isNowCompleted, timestamp };
      },
    }),
    {
      name: 'meal-plans-app-state',
      storage: createJSONStorage(() => appStorage),
    }
  )
);