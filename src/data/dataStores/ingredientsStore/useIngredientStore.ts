import { fetchIngredientsFromFirestore, saveIngredientToFirestore } from '@/app/firestore/firestore';
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
  updateIngredient: (id: string, updated: Partial<Ingredient>) => void;
  deleteIngredient: (id: string) => void;
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

      updateIngredient: (id, updated) =>
        set((state) => ({
          ingredients: state.ingredients.map((ing) =>
            ing.id === id ? { ...ing, ...updated } : ing
          ),
        })),

      deleteIngredient: (id) =>
        set((state) => ({
          ingredients: state.ingredients.filter((ing) => ing.id !== id),
        })),
    }),
    {
      name: 'ingredients',
      storage: createJSONStorage(() => appStorage),
    }
  )
);