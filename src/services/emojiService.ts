import emojiData from 'unicode-emoji-json';

// Updated interface to match unicode-emoji-json's exact schema
interface EmojiMeta {
  name: string;
  slug: string;
  group: string;
  emoji_version: string;
  unicode_version: string;
  skin_tone_support: boolean;
}

// Cast through unknown to safely satisfy TypeScript
const allEmojis = (emojiData as unknown) as Record<string, EmojiMeta>;

export const getEmojiForIngredient = (ingredientName: string): string => {
  if (!ingredientName || typeof ingredientName !== 'string') return '🥗';

  const normalized = ingredientName.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
  const words = normalized.split(/\s+/);

  let bestFoodMatch = '';
  let fallbackMatch = '';

  // Reverse iterate so main nouns (e.g., "chicken" in "grilled chicken") are evaluated first
  for (const word of [...words].reverse()) {
    if (word.length < 2) continue;

    for (const [char, meta] of Object.entries(allEmojis)) {
      const slug = meta.slug.replace(/_/g, ' ');
      // unicode-emoji-json groups food under "Food & Drink"
      const isFoodCategory = meta.group.toLowerCase().includes('food');

      // 1. Exact slug match
      if (slug === word) {
        if (isFoodCategory) return char; // Instant win for Food & Drink
        if (!fallbackMatch) fallbackMatch = char;
      }

      // 2. Exact word match in annotation name
      const nameWords = meta.name.toLowerCase().split(/\s+/);
      if (nameWords.includes(word)) {
        if (isFoodCategory && !bestFoodMatch) {
          bestFoodMatch = char;
        } else if (!fallbackMatch) {
          fallbackMatch = char;
        }
      }
    }

    if (bestFoodMatch) return bestFoodMatch;
  }

  return fallbackMatch || '🥗';
};