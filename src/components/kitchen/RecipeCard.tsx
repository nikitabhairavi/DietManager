import { Recipe } from '@/types/RecipeTypes';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface RecipeCardProps {
    item: Recipe;
    onPress: (recipe: Recipe) => void;
    onDelete: (id: string) => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ item, onPress, onDelete }) => {
    return (
        <TouchableOpacity
            style={styles.card}
            activeOpacity={0.7}
            onPress={() => onPress(item)}
        >
            {/* 1. Title + Subtitle */}
            <View style={styles.infoContainer}>
                <Text style={styles.title} numberOfLines={1}>
                    {item.name}
                </Text>
                <Text style={styles.subText}>
                    {item.ingredients?.length || 0} ingredient{item.ingredients?.length === 1 ? '' : 's'}
                </Text>

                {/* 2. Matching Macro Badges */}
                <View style={styles.macroRow}>
                    {/* Calories (Orange) */}
                    <View style={[styles.badge, styles.calBadge]}>
                        <Text style={[styles.badgeText, styles.calText]}>
                            {item.totalCalories ?? 0} kcal
                        </Text>
                    </View>

                    {/* Protein (Blue) */}
                    <View style={[styles.badge, styles.proteinBadge]}>
                        <Text style={[styles.badgeText, styles.proteinText]}>
                            P: {item.totalProtein ?? 0}g
                        </Text>
                    </View>

                    {/* Fiber (Green) */}
                    <View style={[styles.badge, styles.fiberBadge]}>
                        <Text style={[styles.badgeText, styles.fiberText]}>
                            F: {item.totalFiber ?? 0}g
                        </Text>
                    </View>
                </View>
            </View>

            {/* 3. Soft-Tinted Delete Action Button */}
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
    infoContainer: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1C1C1E',
        marginBottom: 2,
    },
    subText: {
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