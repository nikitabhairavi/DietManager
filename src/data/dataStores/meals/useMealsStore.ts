import { appStorage } from '@/data/storage/dataStorage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface LoggedMeal {
    id: string;
    recipeId: string;
    name: string;
    portionSize: number; // e.g., 1 for full recipe, 0.5 for half portion, 1.5 for extra portion
    totalCalories: number; // Scaled automatically based on portion size
    totalProtein: number;  // Scaled automatically based on portion size
    totalFiber: number;    // Scaled automatically based on portion size
    loggedAtTime: string;  // HH:MM timestamp representation for timeline layout ordering
}

interface MealsStore {
  mealsByDay: Record<string, LoggedMeal[]>;
  logMeal: (dateString: string, meal: Omit<LoggedMeal, 'id' | 'totalCalories' | 'totalProtein' | 'totalFiber'>, baseMacros: { calories: number; protein: number; fiber: number }) => void;
  updateMeal: (dateString: string, mealId: string, updatedFields: Partial<Omit<LoggedMeal, 'id'>>, baseMacros: { calories: number; protein: number; fiber: number }) => void;
  removeMeal: (dateString: string, mealId: string) => void;
}
export const useMealsStore = create<MealsStore>()(
    persist(
        (set) => ({
            mealsByDay: {},

            logMeal: (dateString, mealData, baseMacros) => set((state) => {
                const currentDaysMeals = state.mealsByDay[dateString] || [];

                // Calculate the dynamic macro impact scaling against the selected portion size multiplier
                const scaledMeal: LoggedMeal = {
                    ...mealData,
                    id: Date.now().toString() + Math.random().toString(36).substring(2, 5), // Bulletproof collision prevention key
                    totalCalories: parseFloat((baseMacros.calories * mealData.portionSize).toFixed(1)),
                    totalProtein: parseFloat((baseMacros.protein * mealData.portionSize).toFixed(1)),
                    totalFiber: parseFloat((baseMacros.fiber * mealData.portionSize).toFixed(1)),
                };

                return {
                    mealsByDay: {
                        ...state.mealsByDay,
                        [dateString]: [...currentDaysMeals, scaledMeal],
                    },
                };
            }),
            updateMeal: (dateString, mealId, updatedFields, baseMacros) => set((state) => {
                const currentDaysMeals = state.mealsByDay[dateString] || [];

                const updatedMeals = currentDaysMeals.map((meal) => {
                    if (meal.id !== mealId) return meal;

                    const portionSize = updatedFields.portionSize ?? meal.portionSize;

                    return {
                        ...meal,
                        ...updatedFields,
                        portionSize,
                        totalCalories: parseFloat((baseMacros.calories * portionSize).toFixed(1)),
                        totalProtein: parseFloat((baseMacros.protein * portionSize).toFixed(1)),
                        totalFiber: parseFloat((baseMacros.fiber * portionSize).toFixed(1)),
                    };
                });

                return {
                    mealsByDay: {
                        ...state.mealsByDay,
                        [dateString]: updatedMeals,
                    },
                };
            }),
            removeMeal: (dateString, mealId) => set((state) => {
                const currentDaysMeals = state.mealsByDay[dateString] || [];
                const updatedMeals = currentDaysMeals.filter((meal) => meal.id !== mealId);

                const newMealsByDay = { ...state.mealsByDay };
                if (updatedMeals.length === 0) {
                    delete newMealsByDay[dateString]; // Clean up structural overhead empty keys
                } else {
                    newMealsByDay[dateString] = updatedMeals;
                }

                return { mealsByDay: newMealsByDay };
            }),
        }),
        {
            name: 'meals-tracker-storage-v1',
            storage: createJSONStorage(() => appStorage),
        }
    )
);