import { Ingredient } from '@/data/dataStores/ingredientsStore/useIngredientStore';
import { getEmojiForIngredient } from '@/services/emojiService';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface IngredientCardProps {
    item: Ingredient;
    onPress: (ingredient: Ingredient) => void;
    onDelete: (id: string) => void;
}

export const IngredientCard: React.FC<IngredientCardProps> = ({ item, onPress, onDelete }) => {
    // Resolve food emoji dynamically based on Unicode Food & Drink category matching
    const emoji = useMemo(() => getEmojiForIngredient(item.name), [item.name]);

    return (
        <TouchableOpacity
            style={styles.card}
            activeOpacity={0.7}
            onPress={() => onPress(item)}
        >
            {/* 1. Left Emoji Square Container */}
            <View style={styles.emojiContainer}>
                <Text style={styles.emojiText}>{emoji}</Text>
            </View>

            {/* 2. Title + Unit Hierarchy */}
            <View style={styles.infoContainer}>
                <Text style={styles.title} numberOfLines={1}>
                    {item.name}
                </Text>
                <Text style={styles.unitText}>
                    Unit: {item.quantityPerUnit || '1 serving'}
                </Text>

                {/* 3. Styled Macro Badges & Chips */}
                <View style={styles.macroRow}>
                    {/* Calories Badge (Orange) */}
                    <View style={[styles.badge, styles.calBadge]}>
                        <Text style={[styles.badgeText, styles.calText]}>
                            {item.caloriesPerUnit ?? 0} kcal
                        </Text>
                    </View>

                    {/* Protein Badge (Blue) */}
                    <View style={[styles.badge, styles.proteinBadge]}>
                        <Text style={[styles.badgeText, styles.proteinText]}>
                            P: {item.proteinPerUnit ?? 0}g
                        </Text>
                    </View>

                    {/* Fiber Badge (Green) */}
                    <View style={[styles.badge, styles.fiberBadge]}>
                        <Text style={[styles.badgeText, styles.fiberText]}>
                            F: {item.fiberPerUnit ?? 0}g
                        </Text>
                    </View>
                </View>
            </View>

            {/* 4. Soft-Tinted Delete Action Button */}
            <TouchableOpacity
                style={styles.deleteButton}
                onPress={(e) => {
                    e.stopPropagation();
                    onDelete(item.id);
                }}
                activeOpacity={0.6}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
                <Ionicons name="trash-outline" size={18} color="#FF3B30" />
            </TouchableOpacity>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 14,
        marginBottom: 12,
        // Soft Apple-style shadow and card depth
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
        elevation: 2,
    },
    // Left Emoji Square Tile
    emojiContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#F8F9FA',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    emojiText: {
        fontSize: 24,
    },
    infoContainer: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1C1C1E',
        marginBottom: 2,
    },
    unitText: {
        fontSize: 12,
        color: '#8E8E93',
        marginBottom: 8,
    },
    macroRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 6,
    },
    // Common Badge Style
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: '700',
    },
    // Calories (Orange)
    calBadge: {
        backgroundColor: '#FFF4E5',
    },
    calText: {
        color: '#FF9500',
    },
    // Protein (Blue)
    proteinBadge: {
        backgroundColor: '#EBF5FF',
    },
    proteinText: {
        color: '#007AFF',
    },
    // Fiber (Green)
    fiberBadge: {
        backgroundColor: '#EAF8E6',
    },
    fiberText: {
        color: '#34C759',
    },
    deleteButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: '#FFF2F2',
        marginLeft: 12,
    },
});