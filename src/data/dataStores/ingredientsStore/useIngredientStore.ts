import { saveIngredientToFirestore } from '@/app/firestore/firestore';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { appStorage } from '../../storage/dataStorage';
import { initialIngredients } from './initialData';

export interface Ingredient {
  id: string;
  name: string;
  imageUri?: string;       // Local filepath or captured photo URI
  quantityPerUnit: string; // e.g., 100 for 100g, 1 for a single unit
  caloriesPerUnit: number;
  proteinPerUnit: number;
  fiberPerUnit: number;
}

interface IngredientsState {
  ingredients: Ingredient[];
  addIngredient: (ingredient: Omit<Ingredient, 'id'>) => void;
  updateIngredient: (id: string, updated: Partial<Ingredient>) => void;
  deleteIngredient: (id: string) => void;
}

export const useIngredientsStore = create<IngredientsState>()(
  persist(
    (set) => ({
      ingredients: initialIngredients,

      addIngredient: async (ingredient) => {
        // Generate a unique ID upfront so local state and Firestore stay in sync
        const newIngredient = {
          ...ingredient,
          id: Math.random().toString(36).substring(7),
        };

        // 1. Optimistically update local Zustand state so the UI updates instantly
        set((state) => ({
          ingredients: [...state.ingredients, newIngredient],
        }));

        // 2. Persist to Firestore
        try {
          await saveIngredientToFirestore(newIngredient);
        } catch (error) {
          console.error('Failed to sync ingredient to Firestore:', error);
          // Optional rollback: remove item from local state if save fails
          set((state) => ({
            ingredients: state.ingredients.filter((item) => item.id !== newIngredient.id),
          }));
        }
      },

      updateIngredient: (id, updated) => set((state) => ({
        ingredients: state.ingredients.map((ing) =>
          ing.id === id ? { ...ing, ...updated } : ing
        )
      })),

      deleteIngredient: (id) => set((state) => ({
        ingredients: state.ingredients.filter((ing) => ing.id !== id)
      })),
    }),
    {
      // The distinct key name used to isolate this slice within the single MMKV instance
      name: 'ingredients',
      storage: createJSONStorage(() => appStorage),
    }
  )
);