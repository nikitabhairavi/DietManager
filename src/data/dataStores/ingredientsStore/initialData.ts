import { Ingredient } from "./useIngredientStore";

export const initialIngredients: Ingredient[] = [
  // --- Palak Paneer Elements ---
  { id: 'ing_ginger', name: 'Ginger', caloriesPerUnit: 5, proteinPerUnit: 0, fiberPerUnit: 0, quantityPerUnit: '9g' },
  { id: 'ing_garlic', name: 'Garlic', caloriesPerUnit: 5, proteinPerUnit: 0, fiberPerUnit: 0, quantityPerUnit: '26g' },
  { id: 'ing_spinach', name: 'Spinach', caloriesPerUnit: 50, proteinPerUnit: 5, fiberPerUnit: 5, quantityPerUnit: '1 bag' },
  { id: 'ing_paneer', name: 'Paneer', caloriesPerUnit: 990, proteinPerUnit: 66, fiberPerUnit: 0, quantityPerUnit: '1 block (24 pieces)' },
  { id: 'ing_ghee', name: 'Ghee', caloriesPerUnit: 170, proteinPerUnit: 0, fiberPerUnit: 0, quantityPerUnit: '2 spoons (approx 24g)' },
  { id: 'ing_olive_oil', name: 'Olive Oil', caloriesPerUnit: 90, proteinPerUnit: 0, fiberPerUnit: 0, quantityPerUnit: '10g' },
  { id: 'ing_onion', name: 'Red Onion', caloriesPerUnit: 80, proteinPerUnit: 2, fiberPerUnit: 3, quantityPerUnit: '1.5 onions' },

  // --- Masala Components ---
  { id: 'ing_masalas', name: 'Masalas Blend', caloriesPerUnit: 50, proteinPerUnit: 0, fiberPerUnit: 0, quantityPerUnit: '1 normal serving' },
  { id: 'ing_tomato', name: 'Tomato', caloriesPerUnit: 14, proteinPerUnit: 1, fiberPerUnit: 1, quantityPerUnit: '78g' },
  { id: 'ing_gg_paste', name: 'Ginger Garlic Paste', caloriesPerUnit: 10, proteinPerUnit: 0, fiberPerUnit: 0, quantityPerUnit: '1 normal serving' },
  { id: 'ing_onion_bulk', name: 'Onion (Bulk Curry)', caloriesPerUnit: 80, proteinPerUnit: 2, fiberPerUnit: 3, quantityPerUnit: '200g' },

  // --- Quinoa & Legume Additions ---
  { id: 'ing_olive_oil_5g', name: 'Olive Oil (Light)', caloriesPerUnit: 45, proteinPerUnit: 0, fiberPerUnit: 0, quantityPerUnit: '5g' },
  { id: 'ing_peanuts_10g', name: 'Peanuts (10g)', caloriesPerUnit: 55, proteinPerUnit: 2.5, fiberPerUnit: 0.85, quantityPerUnit: '10g' },
  { id: 'ing_tomato_40g', name: 'Tomato (Small serving)', caloriesPerUnit: 7, proteinPerUnit: 0.5, fiberPerUnit: 0.5, quantityPerUnit: '40g' },
  { id: 'ing_onion_50g', name: 'Onion (Small serving)', caloriesPerUnit: 20, proteinPerUnit: 0.5, fiberPerUnit: 0.75, quantityPerUnit: '50g' },
  { id: 'ing_quinoa', name: 'Quinoa (Raw/Standard)', caloriesPerUnit: 170, proteinPerUnit: 6, fiberPerUnit: 3, quantityPerUnit: '45g' },
  { id: 'ing_mug', name: 'Mug (Moong Dal - 50g)', caloriesPerUnit: 174, proteinPerUnit: 12, fiberPerUnit: 8, quantityPerUnit: '50g' },
  { id: 'ing_peanuts_5g', name: 'Peanuts (Light serving)', caloriesPerUnit: 30, proteinPerUnit: 0.8, fiberPerUnit: 0.8, quantityPerUnit: '5g' },

  // --- Protein Shake & Beverages ---
  { id: 'ing_chia_seeds', name: 'Chia Seeds (10g)', caloriesPerUnit: 50, proteinPerUnit: 1.6, fiberPerUnit: 3, quantityPerUnit: '10g' },
  { id: 'ing_berries', name: 'Mixed Berries (80g)', caloriesPerUnit: 40, proteinPerUnit: 0, fiberPerUnit: 2.28, quantityPerUnit: '80g' },
  { id: 'ing_protein_powder', name: 'Protein Powder (High Pro)', caloriesPerUnit: 180, proteinPerUnit: 36, fiberPerUnit: 0, quantityPerUnit: '1 scoop' },
  { id: 'ing_sugar', name: 'Sugar', caloriesPerUnit: 56, proteinPerUnit: 0, fiberPerUnit: 0, quantityPerUnit: '14g' },
  { id: 'ing_chai_patti', name: 'Chai Patti', caloriesPerUnit: 0, proteinPerUnit: 0, fiberPerUnit: 0, quantityPerUnit: '4g' },
  { id: 'ing_milk', name: 'Milk (190ml)', caloriesPerUnit: 118.75, proteinPerUnit: 6.33, fiberPerUnit: 0, quantityPerUnit: '190ml' },

  // --- Poultry Additions ---
  { id: 'ing_olive_oil_20g', name: 'Olive Oil (Heavy)', caloriesPerUnit: 180, proteinPerUnit: 0, fiberPerUnit: 0, quantityPerUnit: '20g' },
  { id: 'ing_chicken_legs', name: 'Chicken Legs (Bulk Pack)', caloriesPerUnit: 1080, proteinPerUnit: 120, fiberPerUnit: 0, quantityPerUnit: '6 legs' },

  // --- NEW additions from Common Items list ---
  { id: 'ing_moong_100g', name: 'Moong (Whole)', caloriesPerUnit: 347, proteinPerUnit: 24, fiberPerUnit: 16, quantityPerUnit: '100g' },
  { id: 'ing_berries_140g', name: 'Berries (Large serving)', caloriesPerUnit: 70, proteinPerUnit: 0.5, fiberPerUnit: 4, quantityPerUnit: '140g' },
  { id: 'ing_roti_2pcs', name: 'Fulkha Roti', caloriesPerUnit: 170, proteinPerUnit: 5, fiberPerUnit: 3, quantityPerUnit: '2 pieces' },
  { id: 'ing_protein_1scoop_std', name: 'Standard Protein Powder', caloriesPerUnit: 120, proteinPerUnit: 24, fiberPerUnit: 0, quantityPerUnit: '1 scoop' },
  { id: 'ing_sourdough_65g', name: 'Sourdough Bread', caloriesPerUnit: 170, proteinPerUnit: 7, fiberPerUnit: 3, quantityPerUnit: '65g' },
  { id: 'ing_milk_240ml', name: 'Milk (Standard Cup)', caloriesPerUnit: 150, proteinPerUnit: 8, fiberPerUnit: 0, quantityPerUnit: '240ml' },
  { id: 'ing_chia_30g', name: 'Chia Seeds (Bulk serving)', caloriesPerUnit: 150, proteinPerUnit: 5, fiberPerUnit: 10, quantityPerUnit: '30g' },
  { id: 'ing_broccoli_85g', name: 'Broccoli', caloriesPerUnit: 30, proteinPerUnit: 3, fiberPerUnit: 3, quantityPerUnit: '85g' },
  { id: 'ing_chicken_leg_single', name: 'Chicken Leg (Single)', caloriesPerUnit: 180, proteinPerUnit: 20, fiberPerUnit: 0, quantityPerUnit: '83g' },
  { id: 'ing_quinoa_cooked_100g', name: 'Quinoa (Cooked)', caloriesPerUnit: 53, proteinPerUnit: 0.8, fiberPerUnit: 1.8, quantityPerUnit: '100g' },
  { id: 'ing_dry_mung_31g', name: 'Dry Mung', caloriesPerUnit: 110, proteinPerUnit: 5, fiberPerUnit: 5, quantityPerUnit: '31g' },
  { id: 'ing_puri_44g', name: 'Puri', caloriesPerUnit: 141, proteinPerUnit: 0, fiberPerUnit: 0, quantityPerUnit: '44g' },
  { id: 'ing_peanuts_20g', name: 'Peanuts (Standard serving)', caloriesPerUnit: 113.4, proteinPerUnit: 5.16, fiberPerUnit: 1.7, quantityPerUnit: '20g' },
  { id: 'ing_walnuts_28g', name: 'Walnuts', caloriesPerUnit: 180, proteinPerUnit: 4, fiberPerUnit: 2, quantityPerUnit: '28g' },
  { id: 'ing_black_raisins_14g', name: 'Black Raisins', caloriesPerUnit: 90, proteinPerUnit: 2, fiberPerUnit: 1, quantityPerUnit: '14g' },
  { id: 'ing_curd_170g', name: 'Curd', caloriesPerUnit: 120, proteinPerUnit: 7, fiberPerUnit: 0, quantityPerUnit: '170g' }
];