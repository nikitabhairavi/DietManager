// components/FoodImage.tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';

interface FoodImageProps {
    name: string;
    size?: number;
}

const STOP_WORDS = new Set([
    'and', 'with', 'in', 'on', 'of', 'style', 'dish', 'fresh', 'raw', 'organic', 'homemade', 'seed', 'seeds'
]);

/**
 * Maps unindexed or regional ingredient queries to standard CDN key strings
 */
const ALIAS_MAP: Record<string, string[]> = {
    // Seeds & Grains
    'chia seeds': ['Chia Seeds', 'Flaxseed', 'Sesame Seed'],
    'chia seed': ['Chia Seeds'],
    chia: ['Chia Seeds'],

    // Drinks / Teas
    chai: ['Tea', 'Milk'],
    'chai tea': ['Tea'],
    coffee: ['Milk'],

    // Plurals & Generic Produce
    berries: ['Strawberries', 'Blueberries'],
    berry: ['Strawberries'],
    oranges: ['Orange'],
    apples: ['Apple'],
    bananas: ['Banana'],

    // Indian / Regional staples
    chole: ['Chickpeas'],
    rajma: ['Kidney Beans'],
    curry: ['Chicken', 'Turmeric'],
    roti: ['Bread', 'Flour'],
    fulka: ['Bread'],
};

/**
 * Basic naive singularization for common plurals (e.g., "oranges" -> "orange")
 */
const singularize = (word: string): string => {
    if (word.endsWith('ies') && word.length > 4) {
        return word.slice(0, -3) + 'y'; // e.g., berries -> berry (handled by alias)
    }
    if (word.endsWith('es') && word.length > 3) {
        return word.slice(0, -2);
    }
    if (word.endsWith('s') && !word.endsWith('ss') && word.length > 3) {
        return word.slice(0, -1); // e.g., oranges -> orange
    }
    return word;
};

const generateCandidateUrls = (rawName: string): string[] => {
    if (!rawName) return [];

    const capitalize = (str: string) =>
        str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

    const cleanLower = rawName.trim().toLowerCase();
    const searchPhrases: string[] = [];

    // 1. Direct Alias Match
    if (ALIAS_MAP[cleanLower]) {
        searchPhrases.push(...ALIAS_MAP[cleanLower]);
    }

    // 2. Singularized Direct Match
    const singularRaw = singularize(cleanLower);
    if (ALIAS_MAP[singularRaw]) {
        searchPhrases.push(...ALIAS_MAP[singularRaw]);
    }

    // Extract clean words
    const words = cleanLower
        .split(/\s+/)
        .map((w) => w.replace(/[^a-zA-Z0-9]/g, ''))
        .filter((w) => w.length > 0);

    if (words.length > 0) {
        // 3. Exact full phrase
        searchPhrases.push(words.map(capitalize).join('%20'));

        // 4. Singularized full phrase
        const singularWords = words.map(singularize);
        searchPhrases.push(singularWords.map(capitalize).join('%20'));

        if (words.length > 1) {
            // 5. Reversed phrase
            searchPhrases.push([...words].reverse().map(capitalize).join('%20'));

            // 6. Sub-words (filtered through stop words & singularization)
            words.forEach((word) => {
                const sWord = singularize(word);
                if (!STOP_WORDS.has(word)) {
                    if (ALIAS_MAP[word]) searchPhrases.push(...ALIAS_MAP[word]);
                    if (ALIAS_MAP[sWord]) searchPhrases.push(...ALIAS_MAP[sWord]);
                    searchPhrases.push(capitalize(word));
                    searchPhrases.push(capitalize(sWord));
                }
            });
        }
    }

    // Deduplicate candidates preserving priority
    const uniquePhrases = Array.from(new Set(searchPhrases));

    return uniquePhrases.map(
        (phrase) => `https://www.themealdb.com/images/ingredients/${phrase}-Small.png`
    );
};

export const FoodImage: React.FC<FoodImageProps> = ({ name, size = 48 }) => {
    const [candidateIndex, setCandidateIndex] = useState(0);
    const [hasError, setHasError] = useState(false);

    const candidateUrls = generateCandidateUrls(name);
    const currentUrl = candidateUrls[candidateIndex];

    useEffect(() => {
        setCandidateIndex(0);
        setHasError(false);
    }, [name]);

    const handleImageError = () => {
        if (candidateIndex < candidateUrls.length - 1) {
            setCandidateIndex((prev) => prev + 1);
        } else {
            setHasError(true);
        }
    };

    return (
        <View style={[styles.container, { width: size, height: size, borderRadius: size / 4 }]}>
            {!hasError && currentUrl ? (
                <Image
                    key={currentUrl}
                    source={{ uri: currentUrl }}
                    style={styles.image}
                    resizeMode="contain"
                    onError={handleImageError}
                />
            ) : (
                <View style={styles.fallbackContainer}>
                    <Ionicons name="fast-food-outline" size={size * 0.45} color="#A0A0A5" />
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#F2F2F7',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    image: {
        width: '80%',
        height: '80%',
    },
    fallbackContainer: {
        width: '100%',
        height: '100%',
        backgroundColor: '#E5E5EA',
        alignItems: 'center',
        justifyContent: 'center',
    },
});