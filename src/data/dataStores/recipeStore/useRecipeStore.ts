import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { appStorage } from '../../storage/dataStorage';
import { initialRecipes } from './initialData';
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
  addRecipe: (recipe: Recipe) => void;
  deleteRecipe: (id: string) => void;
}

export const useRecipeStore = create<RecipesState>()(
  persist(
    (set) => ({
      recipes: initialRecipes,
      addRecipe: (recipe) => set((state) => {
        // Safe validation check against unhydrated state cache
        const currentRecipes = state && state.recipes ? state.recipes : [];

        return {
          recipes: [
            ...currentRecipes,
            {
              id: recipe.id || Math.random().toString(36).substring(7),
              name: recipe.name,
              ingredients: recipe.ingredients,
              totalCalories: recipe.totalCalories,
              totalProtein: recipe.totalProtein,
              totalFiber: recipe.totalFiber,
            }
          ]
        };
      }),

      deleteRecipe: (id) => set((state) => ({
        recipes: state.recipes.filter((rec) => rec.id !== id)
      })),
    }),
    {
      // Distinct key used to save this data slice inside your shared MMKV database
      name: 'recipes-store',
      storage: createJSONStorage(() => appStorage),
    }
  )
);