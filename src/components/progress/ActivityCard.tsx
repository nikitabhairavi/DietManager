import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export interface ActivityCardProps {
    title: string;
    iconName: keyof typeof Ionicons.glyphMap;
    themeColor: string;
    badgeBgColor: string; // Light initial state color for the track
    currentValue: number;
    targetValue: number;
    unit?: string;
    currentLabel: string;
    targetLabel: string;
    isSyncing?: boolean;
    onEditPress: () => void;
    onSyncPress?: () => void;
    formatValue?: (value: number) => string;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({
    title,
    iconName,
    themeColor,
    badgeBgColor,
    currentValue,
    targetValue,
    unit,
    currentLabel,
    targetLabel,
    isSyncing = false,
    onEditPress,
    onSyncPress,
    formatValue,
}) => {
    const percentage = useMemo(() => {
        return Math.min((currentValue / (targetValue || 1)) * 100, 100);
    }, [currentValue, targetValue]);

    const formattedCurrent = useMemo(() => {
        return formatValue ? formatValue(currentValue) : currentValue.toFixed(0);
    }, [currentValue, formatValue]);

    const formattedTarget = useMemo(() => {
        return formatValue ? formatValue(targetValue) : targetValue.toLocaleString();
    }, [targetValue, formatValue]);

    return (
        <View style={styles.activityCard}>
            {/* Header */}
            <View style={styles.activityHeader}>
                <View style={styles.activityTitleGroup}>
                    <View style={[styles.activityIconBadge, { backgroundColor: badgeBgColor }]}>
                        <Ionicons name={iconName} size={20} color={themeColor} />
                    </View>
                    <Text style={styles.activityTitle}>{title}</Text>
                </View>

                <View style={styles.actionRow}>
                    <TouchableOpacity onPress={onEditPress} style={styles.editIconBtn} activeOpacity={0.7}>
                        <Ionicons name="pencil-sharp" size={14} color="#007AFF" />
                    </TouchableOpacity>

                    {onSyncPress && (
                        <TouchableOpacity
                            onPress={onSyncPress}
                            style={[styles.editIconBtn, { marginLeft: 6 }]}
                            disabled={isSyncing}
                            activeOpacity={0.7}
                        >
                            {isSyncing ? (
                                <ActivityIndicator size="small" color="#007AFF" />
                            ) : (
                                <Ionicons name="watch-outline" size={15} color="#007AFF" />
                            )}
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
                <View style={styles.statColumn}>
                    <Text style={styles.statNumber}>
                        {formattedCurrent} {unit ? <Text style={styles.statUnit}>{unit}</Text> : null}
                    </Text>
                    <Text style={styles.statLabel}>{currentLabel}</Text>
                </View>

                <View style={styles.statDivider} />

                <View style={styles.statColumn}>
                    <Text style={styles.statNumber}>
                        {formattedTarget} {unit ? <Text style={styles.statUnit}>{unit}</Text> : null}
                    </Text>
                    <Text style={styles.statLabel}>{targetLabel}</Text>
                </View>

                <View style={[styles.completionBadge, { backgroundColor: badgeBgColor }]}>
                    <Text style={[styles.completionText, { color: themeColor }]}>
                        {((currentValue / (targetValue || 1)) * 100).toFixed(0)}%
                    </Text>
                </View>
            </View>

            {/* Progress Bar Track */}
            <View style={[styles.progressBarTrack, { backgroundColor: badgeBgColor }]}>
                {/* Completed Progress Fill */}
                <View
                    style={[
                        styles.progressBarFill,
                        { width: `${percentage}%`, backgroundColor: themeColor },
                    ]}
                />

                {/* Double Chevron (>>) Arrow positioned at the active progress edge */}
                {percentage > 2 && (
                    <View style={[styles.chevronContainer, { left: `${percentage}%` }]}>
                        <Ionicons name="chevron-forward-sharp" size={10} color="#FFFFFF" style={styles.chevronLeading} />
                        <Ionicons name="chevron-forward-sharp" size={10} color="#FFFFFF" style={styles.chevronTrailing} />
                    </View>
                )}
            </View>
        </View>
    );
};

export default ActivityCard;

const styles = StyleSheet.create({
    activityCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    activityHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
    },
    activityTitleGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    activityIconBadge: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    activityTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#1C1C1E',
    },
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    editIconBtn: {
        padding: 6,
        backgroundColor: '#F2F2F7',
        borderRadius: 10,
    },
    statsGrid: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9F9FB',
        borderRadius: 14,
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginBottom: 14,
        position: 'relative',
    },
    statColumn: {
        flex: 1,
    },
    statNumber: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1C1C1E',
    },
    statUnit: {
        fontSize: 12,
        fontWeight: '600',
        color: '#8E8E93',
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '500',
        color: '#8E8E93',
        marginTop: 2,
    },
    statDivider: {
        width: 1,
        height: 28,
        backgroundColor: '#E5E5EA',
        marginRight: 16,
    },
    completionBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
    },
    completionText: {
        fontSize: 12,
        fontWeight: '700',
    },

    /* Progress Bar */
    progressBarTrack: {
        height: 12,
        borderRadius: 6,
        position: 'relative',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 6,
    },
    chevronContainer: {
        position: 'absolute',
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: -14, // Fits chevrons smoothly inside the active tip
    },
    chevronLeading: {
        marginRight: -6,
    },
    chevronTrailing: {
        marginRight: 0,
    },
});