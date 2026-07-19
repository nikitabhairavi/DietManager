import { Ingredient } from "./useIngredientStore";

export const initialIngredients: Ingredient[] = [
  { id: 'init-moong', name: 'moong', quantityPerUnit: 100, proteinPerUnit: 24, caloriesPerUnit: 347, fiberPerUnit: 16 },
  { id: 'init-berries', name: 'berries', quantityPerUnit: 140, proteinPerUnit: 0.5, caloriesPerUnit: 70, fiberPerUnit: 4 }, // '<1' normalized to 0.5
  { id: 'init-roti', name: 'roti', quantityPerUnit: 2, proteinPerUnit: 5, caloriesPerUnit: 170, fiberPerUnit: 3 },
  { id: 'init-protein', name: 'protein', quantityPerUnit: 1, proteinPerUnit: 24, caloriesPerUnit: 120, fiberPerUnit: 0 },
  { id: 'init-sourdough', name: 'sourdough', quantityPerUnit: 65, proteinPerUnit: 7, caloriesPerUnit: 170, fiberPerUnit: 3 },
  { id: 'init-milk', name: 'milk', quantityPerUnit: 240, proteinPerUnit: 8, caloriesPerUnit: 150, fiberPerUnit: 0 },
  { id: 'init-chia-seeds', name: 'chia seeds', quantityPerUnit: 30, proteinPerUnit: 5, caloriesPerUnit: 150, fiberPerUnit: 10 },
  { id: 'init-broccoli', name: 'Broccoli', quantityPerUnit: 85, proteinPerUnit: 3, caloriesPerUnit: 30, fiberPerUnit: 3 },
  { id: 'init-chicken-leg', name: 'Chciken leg', quantityPerUnit: 83, proteinPerUnit: 20, caloriesPerUnit: 180, fiberPerUnit: 0 },
  { id: 'init-quinoa-45g', name: 'Quinoa (45g)', quantityPerUnit: 45, proteinPerUnit: 6, caloriesPerUnit: 170, fiberPerUnit: 3 },
  { id: 'init-quinoa-100g', name: 'Quinoa (100g)', quantityPerUnit: 100, proteinPerUnit: 0.8, caloriesPerUnit: 53, fiberPerUnit: 1.8 },
  { id: 'init-dry-mung', name: 'dry mung', quantityPerUnit: 31, proteinPerUnit: 5, caloriesPerUnit: 110, fiberPerUnit: 5 },
  { id: 'init-puri', name: 'Puri', quantityPerUnit: 44, proteinPerUnit: 0, caloriesPerUnit: 141, fiberPerUnit: 0 },
  { id: 'init-peanuts', name: 'peanuts', quantityPerUnit: 20, proteinPerUnit: 5.16, caloriesPerUnit: 113.4, fiberPerUnit: 1.7 },
  { id: 'init-walnuts', name: 'walnuts', quantityPerUnit: 28, proteinPerUnit: 4, caloriesPerUnit: 180, fiberPerUnit: 2 },
  { id: 'init-black-raisins', name: 'black raisins', quantityPerUnit: 14, proteinPerUnit: 2, caloriesPerUnit: 90, fiberPerUnit: 1 },
  { id: 'init-curd', name: 'curd', quantityPerUnit: 170, proteinPerUnit: 7, caloriesPerUnit: 120, fiberPerUnit: 0 }
];