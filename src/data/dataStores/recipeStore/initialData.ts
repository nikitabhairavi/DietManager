import { Recipe } from "./useRecipeStore";

export const initialRecipes: Recipe[] = [
  {
    id: 'rec_palak_paneer',
    name: 'Palak Paneer',
    totalCalories: 1390,
    totalProtein: 73,
    totalFiber: 8,
    ingredients: [
      { ingredientId: 'ing_ginger', name: 'Ginger (9g)', unitsUsed: 1 },
      { ingredientId: 'ing_garlic', name: 'Garlic (26g)', unitsUsed: 1 },
      { ingredientId: 'ing_spinach', name: 'Spinach (1 bag)', unitsUsed: 1 },
      { ingredientId: 'ing_paneer', name: 'Paneer (1 block / 24 pcs)', unitsUsed: 1 },
      { ingredientId: 'ing_ghee', name: 'Ghee (2 spoons)', unitsUsed: 1 },
      { ingredientId: 'ing_olive_oil', name: 'Olive Oil (10g)', unitsUsed: 1 },
      { ingredientId: 'ing_onion', name: 'Red Onion (1.5 onions)', unitsUsed: 1 }
    ]
  },
  {
    id: 'rec_masala_chicken',
    name: 'Masala for chicken',
    totalCalories: 244,
    totalProtein: 3,
    totalFiber: 4,
    ingredients: [
      { ingredientId: 'ing_olive_oil', name: 'Olive Oil (10g)', unitsUsed: 1 },
      { ingredientId: 'ing_masalas', name: 'Masalas Blend', unitsUsed: 1 },
      { ingredientId: 'ing_tomato', name: 'Tomato (78g)', unitsUsed: 1 },
      { ingredientId: 'ing_onion_bulk', name: 'Onion (Bulk Curry - 200g)', unitsUsed: 1 },
      { ingredientId: 'ing_gg_paste', name: 'Ginger Garlic Paste', unitsUsed: 1 }
    ]
  },
  {
    id: 'rec_quinoa',
    name: 'Quinoa',
    totalCalories: 302,
    totalProtein: 9.5,
    totalFiber: 5.1,
    ingredients: [
      { ingredientId: 'ing_olive_oil_5g', name: 'Olive Oil (Light - 5g)', unitsUsed: 1 },
      { ingredientId: 'ing_peanuts_10g', name: 'Peanuts (10g)', unitsUsed: 1 },
      { ingredientId: 'ing_tomato_40g', name: 'Tomato (40g)', unitsUsed: 1 },
      { ingredientId: 'ing_onion_50g', name: 'Onion (50g)', unitsUsed: 1 },
      { ingredientId: 'ing_garlic', name: 'Garlic (26g)', unitsUsed: 1 },
      { ingredientId: 'ing_quinoa', name: 'Quinoa (Raw/Standard - 45g)', unitsUsed: 1 }
    ]
  },
  {
    id: 'rec_mugacha_medaga',
    name: 'Mugacha medaga',
    totalCalories: 249,
    totalProtein: 12,
    totalFiber: 8.8,
    ingredients: [
      { ingredientId: 'ing_mug', name: 'Mug (Moong Dal - 50g)', unitsUsed: 1 },
      { ingredientId: 'ing_peanuts_5g', name: 'Peanuts (Light serving - 5g)', unitsUsed: 1 },
      { ingredientId: 'ing_olive_oil_5g', name: 'Olive Oil (Light - 5g)', unitsUsed: 1 }
    ]
  },
  {
    id: 'rec_protein_shake',
    name: 'Protein Shake',
    totalCalories: 270,
    totalProtein: 37.6,
    totalFiber: 5.28,
    ingredients: [
      { ingredientId: 'ing_chia_seeds', name: 'Chia Seeds (10g)', unitsUsed: 1 },
      { ingredientId: 'ing_berries', name: 'Mixed Berries (80g)', unitsUsed: 1 },
      { ingredientId: 'ing_protein_powder', name: 'Protein Powder (High Pro)', unitsUsed: 1 }
    ]
  },
  {
    id: 'rec_chai',
    name: 'Chai',
    totalCalories: 174.75,
    totalProtein: 6.33,
    totalFiber: 0,
    ingredients: [
      { ingredientId: 'ing_sugar', name: 'Sugar (14g)', unitsUsed: 1 },
      { ingredientId: 'ing_chai_patti', name: 'Chai Patti (4g)', unitsUsed: 1 },
      { ingredientId: 'ing_milk', name: 'Milk (190ml)', unitsUsed: 1 }
    ]
  },
  {
    id: 'rec_chicken_legs_curry',
    name: 'Chicken legs curry',
    totalCalories: 1464,
    totalProtein: 123,
    totalFiber: 4,
    ingredients: [
      { ingredientId: 'ing_olive_oil_20g', name: 'Olive Oil (Heavy - 20g)', unitsUsed: 1 },
      { ingredientId: 'ing_masalas', name: 'Masalas Blend', unitsUsed: 1 },
      { ingredientId: 'ing_tomato', name: 'Tomato (78g)', unitsUsed: 1 },
      { ingredientId: 'ing_onion_bulk', name: 'Onion (Bulk Curry - 200g)', unitsUsed: 1 },
      { ingredientId: 'ing_gg_paste', name: 'Ginger Garlic Paste', unitsUsed: 1 },
      { ingredientId: 'ing_chicken_legs', name: 'Chicken Legs (Bulk Pack - 6 legs)', unitsUsed: 1 }
    ]
  }
];