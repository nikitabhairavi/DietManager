import { db } from '@/app/firestore/config/firebase';
import { Ingredient } from "@/data/dataStores/ingredientsStore/useIngredientStore";
import { collection, deleteDoc, doc, getDocs, serverTimestamp, setDoc } from 'firebase/firestore';
import { Recipe } from '../types/RecipeTypes';

// Helper to generate search tokens for full-text filtering
const generateSearchTokens = (name: string): string[] => {
  const cleaned = name.toLowerCase().replace(/[^a-z0-9\s]/g, '');
  const words = cleaned.split(/\s+/);
  return Array.from(new Set(words.filter((w) => w.length > 0)));
};
export const saveIngredientToFirestore = async (ingredient: Ingredient) => {
  try {
    const docRef = doc(db, 'ingredients', ingredient.id);

    // Convert object to JSON string and back to automatically strip undefined values
    const cleanedIngredient = JSON.parse(JSON.stringify(ingredient));

    await setDoc(docRef, cleanedIngredient, { merge: true });
  } catch (error) {
    console.error('Failed to save ingredient to Firestore:', error);
    throw error;
  }
};

export const fetchIngredientsFromFirestore = async (): Promise<Ingredient[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'ingredients'));
    const ingredients: Ingredient[] = [];

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      ingredients.push({
        id: docSnap.id,
        name: data.name ?? docSnap.id,
        quantityPerUnit: String(data.quantityPerUnit ?? ''),
        caloriesPerUnit: Number(data.caloriesPerUnit ?? 0),
        proteinPerUnit: Number(data.proteinPerUnit ?? 0),
        fiberPerUnit: Number(data.fiberPerUnit ?? 0),
        imageUri: data.imageUri ?? undefined,
      });
    });

    return ingredients;
  } catch (error) {
    console.error('Failed to fetch ingredients from Firestore:', error);
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


export const deleteRecipeFromFirestore = async (docId: string) => {
  try {
    const docRef = doc(db, 'recipes', docId);
    await deleteDoc(docRef);
    console.log(`Recipe "${docId}" deleted from Firestore`);
  } catch (error) {
    console.error('Failed to delete recipe from Firestore:', error);
    throw error;
  }
};

export const deleteIngredientFromFirestore = async (docId: string) => {
  try {
    const docRef = doc(db, 'ingredients', docId);
    await deleteDoc(docRef);
    console.log(`Ingredient "${docId}" deleted from Firestore`);
  } catch (error) {
    console.error('Failed to delete ingredient from Firestore:', error);
    throw error;
  }
};