import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { appStorage } from '../storage/dataStorage';

export interface RecipeIngredient {
  ingredientId: string;
  name: string;      // Snapshotted at the time of addition for quick presentation
  unitsUsed: number; // Decimal or integer multiplier of the ingredient's base unit
}

export interface Recipe {
  id: string;
  name: string;
  ingredients: RecipeIngredient[];
  totalCalories: number;
  totalProtein: number;
  totalFiber: number;
}

interface RecipesState {
  recipes: Recipe[];
  addRecipe: (
    name: string, 
    ingredients: RecipeIngredient[], 
    totals: { calories: number; protein: number; fiber: number }
  ) => void;
  deleteRecipe: (id: string) => void;
}

export const useRecipesStore = create<RecipesState>()(
  persist(
    (set) => ({
      recipes: [],
      
      addRecipe: (name, ingredients, totals) => set((state) => ({
        recipes: [
          ...state.recipes,
          {
            id: Math.random().toString(36).substring(7),
            name,
            ingredients,
            totalCalories: totals.calories,
            totalProtein: totals.protein,
            totalFiber: totals.fiber,
          }
        ]
      })),
      
      deleteRecipe: (id) => set((state) => ({
        recipes: state.recipes.filter((rec) => rec.id !== id)
      })),
    }),
    {
      // Distinct key used to save this data slice inside your shared MMKV database
      name: 'recipes-app-state',
      storage: createJSONStorage(() => appStorage),
    }
  )
);