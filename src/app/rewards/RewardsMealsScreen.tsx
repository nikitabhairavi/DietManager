import { useRewardsStore } from '@/data/dataStores/rewards/useRewardsStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Alert, FlatList, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface RewardMeal {
    id: string;
    name: string;
    cost: number;
    calories: number;
    protein: number;
    image: string;
    category: string;
}

const REWARD_MEALS: RewardMeal[] = [
    {
        id: '1',
        name: 'Artisanal Ice Cream Sundae',
        cost: 800,
        calories: 450,
        protein: 8,
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500',
        category: 'Dessert',
    },
    {
        id: '2',
        name: 'Loaded Cheese Pizza',
        cost: 800,
        calories: 850,
        protein: 28,
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500',
        category: 'Cheat Meal',
    },
    {
        id: '3',
        name: 'Garlic Naan & Chicken Curry',
        cost: 500,
        calories: 680,
        protein: 45,
        image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=500',
        category: 'Indian Classic',
    },
    {
        id: '4',
        name: 'Mumbai Wada Pav',
        cost: 500,
        calories: 320,
        protein: 9,
        image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500',
        category: 'Street Food',
    },
    {
        id: '5',
        name: 'Spicy Masala Pizza',
        cost: 500,
        calories: 720,
        protein: 22,
        image: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=500',
        category: 'Fusion',
    },
];

export default function RewardMealsScreen() {
    const router = useRouter();
    const pointsEarned = useRewardsStore((state) => state.pointsEarned);
    const pointsSpent = useRewardsStore((state) => state.pointsSpent);
    const redeemPoints = useRewardsStore((state) => state.redeemPoints);

    // Live balance subtraction
    const currentBalance = useMemo(() => {
        return Math.max(0, pointsEarned - pointsSpent);
    }, [pointsEarned, pointsSpent]);

    const handleRedeemMeal = (meal: RewardMeal) => {
        if (currentBalance < meal.cost) {
            Alert.alert(
                'Insufficient Balance',
                `You need ${meal.cost - currentBalance} more points to unlock ${meal.name}.`
            );
            return;
        }

        Alert.alert(
            'Redeem Reward?',
            `Deduct ${meal.cost} PTS to unlock ${meal.name}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Redeem',
                    onPress: () => {
                        // Subtracts points by recording spent amount in store
                        const success = redeemPoints(meal.cost);
                        if (success) {
                            Alert.alert('🎉 Reward Unlocked!', `${meal.cost} PTS deducted. Enjoy your ${meal.name}!`);
                        }
                    },
                },
            ]
        );
    };

    const renderMealCard = ({ item }: { item: RewardMeal }) => {
        const canAfford = currentBalance >= item.cost;

        return (
            <View style={styles.mealCard}>
                <Image source={{ uri: item.image }} style={styles.mealImage} />

                <View style={styles.mealInfo}>
                    <View style={styles.categoryBadge}>
                        <Text style={styles.categoryText}>{item.category}</Text>
                    </View>

                    <Text style={styles.mealTitle}>{item.name}</Text>

                    <Text style={styles.macroText}>
                        🔥 {item.calories} kcal  •  💪 {item.protein}g protein
                    </Text>

                    <View style={styles.cardFooter}>
                        <View style={styles.costBadge}>
                            <Ionicons name="trophy" size={14} color="#FFD700" />
                            <Text style={styles.costText}>{item.cost} PTS</Text>
                        </View>

                        <TouchableOpacity
                            style={[styles.claimButton, !canAfford && styles.claimButtonDisabled]}
                            onPress={() => handleRedeemMeal(item)}
                            disabled={!canAfford}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.claimButtonText}>
                                {canAfford ? 'Claim Reward' : 'Locked'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.safeContainer}>
            <View style={styles.topHeader}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color="#1C1C1E" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Reward Meals</Text>
                <View style={styles.balancePill}>
                    <Ionicons name="trophy" size={14} color="#FFD700" />
                    <Text style={styles.balancePillText}>{currentBalance} PTS</Text>
                </View>
            </View>

            <FlatList
                data={REWARD_MEALS}
                keyExtractor={(item) => item.id}
                renderItem={renderMealCard}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeContainer: { flex: 1, backgroundColor: '#F2F2F7' },
    topHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
    },
    backButton: { padding: 4 },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#1C1C1E' },
    balancePill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#111827',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
        gap: 4,
    },
    balancePillText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
    listContainer: { padding: 16, gap: 16 },
    mealCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#E5E5EA',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
    },
    mealImage: { width: '100%', height: 160 },
    mealInfo: { padding: 16 },
    categoryBadge: {
        alignSelf: 'flex-start',
        backgroundColor: '#EBF5FF',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
        marginBottom: 6,
    },
    categoryText: { fontSize: 11, fontWeight: '700', color: '#007AFF' },
    mealTitle: { fontSize: 18, fontWeight: '700', color: '#1C1C1E' },
    macroText: { fontSize: 13, color: '#8E8E93', marginTop: 4 },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 14,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F2F2F7',
    },
    costBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    costText: { fontSize: 15, fontWeight: '800', color: '#1C1C1E' },
    claimButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 10,
    },
    claimButtonDisabled: { backgroundColor: '#C7C7CC' },
    claimButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
});