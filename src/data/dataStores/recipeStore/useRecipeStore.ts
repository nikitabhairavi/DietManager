import { appStorage } from '@/data/storage/dataStorage';
import {
  deleteRecipeFromFirestore,
  fetchRecipesFromFirestore,
  saveRecipeToFirestore,
} from '@/firestore/firestore';
import { Recipe } from '@/types/RecipeTypes';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface RecipesState {
  recipes: Recipe[];
  isInitialLoading: boolean;
  isRefreshing: boolean;
  loadInitialRecipes: () => Promise<void>;
  fetchRecipes: () => Promise<void>;
  addRecipe: (recipe: Recipe) => Promise<void>;
  updateRecipe: (id: string, updatedRecipe: Partial<Recipe>) => Promise<void>;
  deleteRecipe: (id: string) => Promise<void>;
}

export const useRecipeStore = create<RecipesState>()(
  persist(
    (set, get) => ({
      recipes: [],
      isInitialLoading: true,
      isRefreshing: false,

      loadInitialRecipes: async () => {
        set({ isInitialLoading: true });
        try {
          const remoteRecipes = await fetchRecipesFromFirestore();
          set({ recipes: remoteRecipes });
        } catch (error) {
          console.error('Failed to load initial recipes from Firestore:', error);
        } finally {
          set({ isInitialLoading: false });
        }
      },

      fetchRecipes: async () => {
        set({ isRefreshing: true });
        try {
          const remoteRecipes = await fetchRecipesFromFirestore();
          set({ recipes: remoteRecipes });
        } catch (error) {
          console.error('Error refreshing recipes:', error);
        } finally {
          set({ isRefreshing: false });
        }
      },

      addRecipe: async (recipe) => {
        const docId = recipe.name.trim();

        const newRecipe: Recipe = {
          id: docId,
          name: docId,
          totalCalories: Number(recipe.totalCalories),
          totalProtein: Number(recipe.totalProtein),
          totalFiber: Number(recipe.totalFiber),
          ingredients: recipe.ingredients,
        };

        const currentRecipes = get()?.recipes || [];
        set({ recipes: [...currentRecipes, newRecipe] });

        try {
          await saveRecipeToFirestore(newRecipe);
        } catch (error) {
          console.error('Failed to sync recipe to Firestore:', error);
          set((state) => ({
            recipes: state.recipes.filter((item) => item.id !== docId),
          }));
        }
      },

      updateRecipe: async (id, updatedRecipe) => {
        const previousRecipes = get()?.recipes || [];
        const existingRecipe = previousRecipes.find((rec) => rec.id === id);

        if (!existingRecipe) return;

        // Merge existing recipe with partial updates
        const mergedRecipe: Recipe = {
          ...existingRecipe,
          ...updatedRecipe,
          id, // Guarantee ID remains intact
        };

        // 1. Optimistic update
        set({
          recipes: previousRecipes.map((rec) =>
            rec.id === id ? mergedRecipe : rec
          ),
        });

        // 2. Sync to Firestore
        try {
          await saveRecipeToFirestore(mergedRecipe);
        } catch (error) {
          console.error('Failed to update recipe in Firestore:', error);
          // Rollback on write failure
          set({ recipes: previousRecipes });
        }
      },

      deleteRecipe: async (id) => {
        const previousRecipes = get()?.recipes || [];
        const targetRecipe = previousRecipes.find((rec) => rec.id === id);

        if (!targetRecipe) return;

        // 1. Optimistic delete
        set({
          recipes: previousRecipes.filter((rec) => rec.id !== id),
        });

        // 2. Sync deletion to Firestore
        try {
          await deleteRecipeFromFirestore(id);
        } catch (error) {
          console.error('Failed to delete recipe from Firestore:', error);
          // Rollback on delete failure
          set({ recipes: previousRecipes });
        }
      },
    }),
    {
      name: 'recipes-store-1',
      storage: createJSONStorage(() => appStorage),
    }
  )
);