import React, { useMemo } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface CalendarStripProps {
    selectedDate: Date;
    onDateSelect: (date: Date) => void;
}

export const CalendarStrip: React.FC<CalendarStripProps> = ({ selectedDate, onDateSelect }) => {
    // Generate an array of 14 days surrounding the current selection (7 days back, 6 days forward)
    const daysArray = useMemo(() => {
        const dates = [];
        const baseDate = new Date(); // Anchor around today's current date

        for (let i = -7; i <= 6; i++) {
            const d = new Date(baseDate);
            d.setDate(baseDate.getDate() + i);
            dates.push(d);
        }
        return dates;
    }, []);

    const isSameDay = (date1: Date, date2: Date) => {
        return (
            date1.getDate() === date2.getDate() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getFullYear() === date2.getFullYear()
        );
    };

    return (
        <View style={styles.stripContainer}>
            <FlatList
                data={daysArray}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.toISOString()}
                contentContainerStyle={styles.listPadding}
                renderItem={({ item }) => {
                    const isSelected = isSameDay(item, selectedDate);
                    const dayName = item.toLocaleDateString('en-US', { weekday: 'short' }); // e.g., "Mon"
                    const dayNumber = item.getDate(); // e.g., 14

                    return (
                        <TouchableOpacity
                            style={[styles.dayCard, isSelected && styles.selectedDayCard]}
                            onPress={() => onDateSelect(item)}
                            activeOpacity={0.7}
                        >
                            <Text style={[styles.dayNameText, isSelected && styles.selectedTypeText]}>
                                {dayName}
                            </Text>
                            <Text style={[styles.dayNumberText, isSelected && styles.selectedTypeText]}>
                                {dayNumber}
                            </Text>
                        </TouchableOpacity>
                    );
                }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    stripContainer: {
        backgroundColor: '#FFFFFF',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderColor: '#E5E5EA',
    },
    listPadding: {
        paddingHorizontal: 16,
    },
    dayCard: {
        width: 50,
        height: 64,
        borderRadius: 10,
        backgroundColor: '#F2F2F7',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 6,
    },
    selectedDayCard: {
        backgroundColor: '#007AFF',
    },
    dayNameText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#8E8E93',
        marginBottom: 4,
    },
    dayNumberText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000000',
    },
    selectedTypeText: {
        color: '#FFFFFF',
    },
});