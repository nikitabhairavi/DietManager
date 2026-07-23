import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface StatCardProps {
  label: string;
  value: number;
  type: 'earned' | 'spent';
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, type }) => {
  const isEarned = type === 'earned';

  const accentColor = isEarned ? '#34C759' : '#FF3B30';
  const iconBgColor = isEarned ? '#E8F5E8' : '#FFEBEE';
  const iconName = isEarned ? 'trending-up' : 'trending-down';
  const valuePrefix = isEarned ? '+' : '-';

  return (
    <View style={[styles.splitCard, { borderLeftColor: accentColor }]}>
      <View style={[styles.iconContainer, { backgroundColor: iconBgColor }]}>
        <Ionicons name={iconName} size={18} color={accentColor} />
      </View>
      <Text style={styles.splitLabel}>{label}</Text>
      <Text style={styles.splitValue}>
        {valuePrefix}{value} <Text style={styles.miniUnit}>pts</Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  splitCard: {
    flex: 0.48,
    borderRadius: 18,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  splitLabel: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '600'
  },
  splitValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1E',
    marginTop: 2
  },
  miniUnit: {
    fontSize: 13,
    fontWeight: '500',
    color: '#8E8E93'
  },
});