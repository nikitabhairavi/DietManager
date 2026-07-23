import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface DailyCriteriaCardProps {
    dailyCaloriesTarget: number;
    dailyActiveCaloriesTarget: number;
    dailyStepsTarget: number;
}

export const DailyCriteriaCard: React.FC<DailyCriteriaCardProps> = ({
    dailyCaloriesTarget,
    dailyActiveCaloriesTarget,
    dailyStepsTarget,
}) => {
    return (
        <View style={styles.criteriaCard}>
            <Text style={styles.criteriaTitle}>How to Earn +10 Points Daily</Text>
            <Text style={styles.criteriaSubtitle}>
                Complete all 3 goals in a single day to unlock daily points:
            </Text>

            <View style={styles.criteriaRow}>
                <Ionicons name="restaurant-outline" size={18} color="#007AFF" style={styles.ruleIcon} />
                <Text style={styles.ruleText}>
                    Calories Consumed <Text style={styles.ruleBold}>≤ {dailyCaloriesTarget} kcal</Text>
                </Text>
            </View>

            <View style={styles.criteriaRow}>
                <Ionicons name="flame-outline" size={18} color="#FF9500" style={styles.ruleIcon} />
                <Text style={styles.ruleText}>
                    Active Calories <Text style={styles.ruleBold}>≥ {dailyActiveCaloriesTarget} kcal</Text>
                </Text>
            </View>

            <View style={styles.criteriaRow}>
                <Ionicons name="footsteps-outline" size={18} color="#34C759" style={styles.ruleIcon} />
                <Text style={styles.ruleText}>
                    Steps Completed <Text style={styles.ruleBold}>≥ {dailyStepsTarget.toLocaleString()} steps</Text>
                </Text>
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
        color: '#1C1C1E'
    },
    criteriaSubtitle: {
        fontSize: 12,
        color: '#8E8E93',
        marginTop: 2,
        marginBottom: 12
    },
    criteriaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    ruleIcon: {
        marginRight: 10,
        width: 20,
        textAlign: 'center'
    },
    ruleText: {
        fontSize: 13,
        color: '#3A3A3C'
    },
    ruleBold: {
        fontWeight: '700',
        color: '#1C1C1E'
    },
});