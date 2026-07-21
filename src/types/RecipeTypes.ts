
export interface RecipeIngredient {
  ingredientId: string;
  name: string;
  unitsUsed: number;
}

export interface Recipe {
  id: string; // Strictly a string
  name: string;
  totalCalories: number;
  totalProtein: number;
  totalFiber: number;
  ingredients: RecipeIngredient[];
}