import { saveRecipeToFirestore } from '@/app/firestore/firestore';
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
    (set, get) => ({
      recipes: initialRecipes,
      addRecipe: async (recipe) => {
        // 1. Use the recipe name as the Document ID (trimmed)
        const docId = recipe.id || recipe.name.trim();

        const newRecipe: Recipe = {
          ...recipe,
          id: docId,
          name: recipe.name.trim(),
        };

        // 2. Optimistic local state update
        const currentRecipes = get()?.recipes || [];
        set({
          recipes: [...currentRecipes, newRecipe],
        });

        // 3. Sync to Firestore
        try {
          await saveRecipeToFirestore(newRecipe);
        } catch (error) {
          console.error('Failed to sync recipe to Firestore:', error);
          
          // Revert local state on failure
          set((state) => ({
            recipes: state.recipes.filter((item) => item.id !== newRecipe.id),
          }));
        }
      },

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