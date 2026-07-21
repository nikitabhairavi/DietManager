import {
  deleteIngredientFromFirestore,
  fetchIngredientsFromFirestore,
  saveIngredientToFirestore,
} from '@/app/firestore/firestore';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { appStorage } from '../../storage/dataStorage';

export interface Ingredient {
  id: string;
  name: string;
  imageUri?: string;
  quantityPerUnit: string;
  caloriesPerUnit: number;
  proteinPerUnit: number;
  fiberPerUnit: number;
}

interface IngredientsState {
  ingredients: Ingredient[];
  isInitialLoading: boolean;
  isRefreshing: boolean;
  loadInitialIngredients: () => Promise<void>;
  fetchIngredients: () => Promise<void>;
  addIngredient: (ingredient: Omit<Ingredient, 'id'>) => Promise<void>;
  updateIngredient: (id: string, updated: Partial<Ingredient>) => Promise<void>;
  deleteIngredient: (id: string) => Promise<void>;
}

export const useIngredientsStore = create<IngredientsState>()(
  persist(
    (set, get) => ({
      ingredients: [],
      isInitialLoading: true,
      isRefreshing: false,

      loadInitialIngredients: async () => {
        set({ isInitialLoading: true });
        try {
          const remoteIngredients = await fetchIngredientsFromFirestore();
          set({ ingredients: remoteIngredients });
        } catch (error) {
          console.error('Failed to load initial ingredients:', error);
        } finally {
          set({ isInitialLoading: false });
        }
      },

      fetchIngredients: async () => {
        set({ isRefreshing: true });
        try {
          const remoteIngredients = await fetchIngredientsFromFirestore();
          set({ ingredients: remoteIngredients });
        } catch (error) {
          console.error('Error refreshing ingredients:', error);
        } finally {
          set({ isRefreshing: false });
        }
      },

      addIngredient: async (ingredient) => {
        const docId = ingredient.name.trim();

        const newIngredient: Ingredient = {
          ...ingredient,
          id: docId,
        };

        const current = get()?.ingredients || [];
        set({ ingredients: [...current, newIngredient] });

        try {
          await saveIngredientToFirestore(newIngredient);
        } catch (error) {
          console.error('Failed to sync ingredient to Firestore:', error);
          set((state) => ({
            ingredients: state.ingredients.filter((item) => item.id !== docId),
          }));
        }
      },

      updateIngredient: async (id, updated) => {
        const previousIngredients = get()?.ingredients || [];
        const existingIngredient = previousIngredients.find((ing) => ing.id === id);

        if (!existingIngredient) return;

        const mergedIngredient: Ingredient = {
          ...existingIngredient,
          ...updated,
          id, // Preserve ID constraint
        };

        // 1. Optimistic update locally
        set({
          ingredients: previousIngredients.map((ing) =>
            ing.id === id ? mergedIngredient : ing
          ),
        });

        // 2. Sync with Firestore
        try {
          await saveIngredientToFirestore(mergedIngredient);
        } catch (error) {
          console.error('Failed to update ingredient in Firestore:', error);
          // Rollback on failure
          set({ ingredients: previousIngredients });
        }
      },

      deleteIngredient: async (id) => {
        const previousIngredients = get()?.ingredients || [];
        const targetIngredient = previousIngredients.find((ing) => ing.id === id);

        if (!targetIngredient) return;

        // 1. Optimistic deletion locally
        set({
          ingredients: previousIngredients.filter((ing) => ing.id !== id),
        });

        // 2. Sync deletion with Firestore
        try {
          await deleteIngredientFromFirestore(id);
        } catch (error) {
          console.error('Failed to delete ingredient from Firestore:', error);
          // Rollback on failure
          set({ ingredients: previousIngredients });
        }
      },
    }),
    {
      name: 'ingredients',
      storage: createJSONStorage(() => appStorage),
    }
  )
);