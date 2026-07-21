import { fetchRecipesFromFirestore, saveRecipeToFirestore } from '@/app/firestore/firestore';
import { Recipe } from '@/app/types/RecipeTypes';
import { appStorage } from '@/data/storage/dataStorage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';


interface RecipesState {
  recipes: Recipe[];
  isInitialLoading: boolean;
  isRefreshing: boolean;
  loadInitialRecipes: () => Promise<void>;
  fetchRecipes: () => Promise<void>;
  addRecipe: (recipe: Recipe) => Promise<void>;
  deleteRecipe: (id: string) => void;
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

      deleteRecipe: (id) => set((state) => ({
        recipes: state.recipes.filter((rec) => rec.id !== id),
      })),
    }),
    {
      name: 'recipes-store-1',
      storage: createJSONStorage(() => appStorage),
    }
  )
);