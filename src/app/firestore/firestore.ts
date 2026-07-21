import { db } from '@/app/firestore/config/firebase';
import { Ingredient } from "@/data/dataStores/ingredientsStore/useIngredientStore";
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';

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