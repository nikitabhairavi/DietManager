import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface DailyCriteriaCardProps {
    dailyCaloriesTarget: number;
    dailyProteinTarget: number;
    dailyFiberTarget: number;
    dailyActiveCaloriesTarget: number;
    dailyStepsTarget: number;
}

export const DailyCriteriaCard: React.FC<DailyCriteriaCardProps> = ({
    dailyCaloriesTarget,
    dailyProteinTarget,
    dailyFiberTarget,
    dailyActiveCaloriesTarget,
    dailyStepsTarget,
}) => {
    return (
        <View style={styles.criteriaCard}>
            <Text style={styles.criteriaTitle}>Daily Rewards Breakdown</Text>
            <Text style={styles.criteriaSubtitle}>
                Earn points as you hit each goal, plus bonus points for a perfect day:
            </Text>

            {/* Protein Goal */}
            <View style={styles.criteriaRow}>
                <Ionicons name="fish-outline" size={18} color="#007AFF" style={styles.ruleIcon} />
                <Text style={styles.ruleText}>
                    Protein Goal <Text style={styles.ruleBold}>≥ {dailyProteinTarget}g</Text>
                </Text>
                <View style={styles.pointsBadge}>
                    <Text style={styles.pointsBadgeText}>+5 PTS</Text>
                </View>
            </View>

            {/* Fiber Goal */}
            <View style={styles.criteriaRow}>
                <Ionicons name="leaf-outline" size={18} color="#34C759" style={styles.ruleIcon} />
                <Text style={styles.ruleText}>
                    Fiber Goal <Text style={styles.ruleBold}>≥ {dailyFiberTarget}g</Text>
                </Text>
                <View style={styles.pointsBadge}>
                    <Text style={styles.pointsBadgeText}>+5 PTS</Text>
                </View>
            </View>

            {/* Calorie Limit */}
            <View style={styles.criteriaRow}>
                <Ionicons name="restaurant-outline" size={18} color="#AF52DE" style={styles.ruleIcon} />
                <Text style={styles.ruleText}>
                    Calorie Limit <Text style={styles.ruleBold}>≤ {dailyCaloriesTarget} kcal</Text>
                </Text>
                <View style={styles.pointsBadge}>
                    <Text style={styles.pointsBadgeText}>+5 PTS</Text>
                </View>
            </View>

            {/* Active Burn */}
            <View style={styles.criteriaRow}>
                <Ionicons name="flame-outline" size={18} color="#FF9500" style={styles.ruleIcon} />
                <Text style={styles.ruleText}>
                    Active Burn <Text style={styles.ruleBold}>≥ {dailyActiveCaloriesTarget} kcal</Text>
                </Text>
                <View style={styles.pointsBadge}>
                    <Text style={styles.pointsBadgeText}>+10 PTS</Text>
                </View>
            </View>

            {/* Steps Goal */}
            <View style={styles.criteriaRow}>
                <Ionicons name="footsteps-outline" size={18} color="#5856D6" style={styles.ruleIcon} />
                <Text style={styles.ruleText}>
                    Steps Goal <Text style={styles.ruleBold}>≥ {dailyStepsTarget.toLocaleString()} steps</Text>
                </Text>
                <View style={styles.pointsBadge}>
                    <Text style={styles.pointsBadgeText}>+5 PTS</Text>
                </View>
            </View>

            {/* Perfect Day Bonus Banner */}
            <View style={styles.bonusRow}>
                <Ionicons name="star" size={16} color="#FFD700" style={styles.ruleIcon} />
                <Text style={styles.bonusText}>
                    Complete <Text style={styles.bonusBold}>All 5 Goals</Text> in a Day
                </Text>
                <View style={styles.bonusBadge}>
                    <Text style={styles.bonusBadgeText}>+20 PTS BONUS</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    criteriaCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        padding: 18,
        marginTop: 16,
        borderWidth: 1,
        borderColor: '#E5E5EA',
    },
    criteriaTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1C1C1E',
    },
    criteriaSubtitle: {
        fontSize: 12,
        color: '#8E8E93',
        marginTop: 2,
        marginBottom: 14,
    },
    criteriaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    ruleIcon: {
        marginRight: 10,
        width: 20,
        textAlign: 'center',
    },
    ruleText: {
        fontSize: 13,
        color: '#3A3A3C',
        flex: 1,
    },
    ruleBold: {
        fontWeight: '700',
        color: '#1C1C1E',
    },
    pointsBadge: {
        backgroundColor: '#F2F2F7',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    pointsBadgeText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#007AFF',
    },
    bonusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#F2F2F7',
    },
    bonusText: {
        fontSize: 13,
        color: '#1C1C1E',
        flex: 1,
    },
    bonusBold: {
        fontWeight: '700',
        color: '#B45309',
    },
    bonusBadge: {
        backgroundColor: '#FEF3C7',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    bonusBadgeText: {
        fontSize: 11,
        fontWeight: '800',
        color: '#B45309',
    },
});