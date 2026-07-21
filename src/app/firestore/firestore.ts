import { db } from '@/app/firestore/config/firebase';
import { Ingredient } from "@/data/dataStores/ingredientsStore/useIngredientStore";
import { collection, doc, getDocs, serverTimestamp, setDoc } from 'firebase/firestore';
import { Recipe } from '../types/RecipeTypes';

// Helper to generate search tokens for full-text filtering
const generateSearchTokens = (name: string): string[] => {
  const cleaned = name.toLowerCase().replace(/[^a-z0-9\s]/g, '');
  const words = cleaned.split(/\s+/);
  return Array.from(new Set(words.filter((w) => w.length > 0)));
};
export const saveIngredientToFirestore = async (ingredient: Ingredient) => {
  try {
    const { id, ...data } = ingredient;

    // Sanitize the name so it can safely be used as a document ID key
    const docId = ingredient.name.trim();

    // Use the ingredient name as the document ID
    const docRef = doc(db, 'ingredients', docId);

    await setDoc(docRef, {
      ...data,
      id: docId, // Keep id consistent with document ID
      searchTokens: generateSearchTokens(ingredient.name),
      isCustom: true,
      createdAt: serverTimestamp(),
    });

    console.log(`Ingredient ${ingredient.name} saved to Firestore!`);
  } catch (error) {
    console.error('Failed to save ingredient to Firestore:', error);
    throw error;
  }
};
export const fetchRecipesFromFirestore = async (): Promise<Recipe[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'recipes'));
    const recipes: Recipe[] = [];

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      
      recipes.push({
        id: docSnap.id, // Always guaranteed to be a string
        name: data.name ?? docSnap.id,
        totalCalories: Number(data.totalCalories ?? 0),
        totalProtein: Number(data.totalProtein ?? 0),
        totalFiber: Number(data.totalFiber ?? 0),
        ingredients: data.ingredients ?? [],
      });
    });

    return recipes;
  } catch (error) {
    console.error('Failed to fetch recipes from Firestore:', error);
    throw error;
  }
};

export const saveRecipeToFirestore = async (recipe: Recipe) => {
  try {
    const docId = recipe.id || recipe.name.trim();
    const docRef = doc(db, 'recipes', docId);

    const recipeData = {
      id: docId,
      name: docId,
      totalCalories: Number(recipe.totalCalories),
      totalProtein: Number(recipe.totalProtein),
      totalFiber: Number(recipe.totalFiber),
      ingredients: recipe.ingredients,
      searchTokens: generateSearchTokens(docId),
      isCustom: true,
      createdAt: serverTimestamp(),
    };

    await setDoc(docRef, recipeData, { merge: true });
    console.log(`Recipe "${docId}" saved to Firestore!`);
  } catch (error) {
    console.error('Failed to save recipe to Firestore:', error);
    throw error;
  }
};