import React, { useEffect, useMemo, useRef } from 'react';
import { Dimensions, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface CalendarStripProps {
    selectedDate: Date;
    onDateSelect: (date: Date) => void;
}

const ITEM_WIDTH = 50;
const ITEM_MARGIN = 6;
const FULL_ITEM_SIZE = ITEM_WIDTH + ITEM_MARGIN * 2; // Exactly 62px
const SCREEN_WIDTH = Dimensions.get('window').width;

export const CalendarStrip: React.FC<CalendarStripProps> = ({ selectedDate, onDateSelect }) => {
    const flatListRef = useRef<FlatList<Date>>(null);
    const isInitialMount = useRef(true);

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
        if (!date1 || !date2) return false;
        return (
            date1.getDate() === date2.getDate() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getFullYear() === date2.getFullYear()
        );
    };

    // Find the index of the selected date
    const selectedIndex = useMemo(() => {
        return daysArray.findIndex((date) => isSameDay(date, selectedDate));
    }, [daysArray, selectedDate]);

    // Handle centering logic with layout lifecycles in mind
    useEffect(() => {
        if (selectedIndex === -1) return;

        const scrollToTarget = () => {
            flatListRef.current?.scrollToIndex({
                index: selectedIndex,
                animated: !isInitialMount.current, // Snap instantly on first load, animate on subsequent taps
                viewPosition: 0.5, // Force absolute viewport centering
            });
            isInitialMount.current = false;
        };

        // Execution guard: layout frames need a tiny window to paint when switching screens
        const timeoutId = setTimeout(() => {
            requestAnimationFrame(scrollToTarget);
        }, 60);

        return () => clearTimeout(timeoutId);
    }, [selectedIndex]);

    return (
        <View style={styles.stripContainer}>
            <FlatList
                ref={flatListRef}
                data={daysArray}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.toISOString()}
                contentContainerStyle={styles.listPadding}
                getItemLayout={(_, index) => ({
                    length: FULL_ITEM_SIZE,
                    offset: FULL_ITEM_SIZE * index,
                    index,
                })}
                onScrollToIndexFailed={(info) => {
                    // Fail-safe fallback if the reference index is requested before UI thread calibration
                    flatListRef.current?.scrollToOffset({
                        offset: info.averageItemLength * info.index,
                        animated: false,
                    });
                    setTimeout(() => {
                        flatListRef.current?.scrollToIndex({
                            index: info.index,
                            animated: false,
                            viewPosition: 0.5
                        });
                    }, 80);
                }}
                renderItem={({ item }) => {
                    const isSelected = isSameDay(item, selectedDate);
                    const dayName = item.toLocaleDateString('en-US', { weekday: 'short' });
                    const dayNumber = item.getDate();

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
        paddingHorizontal: SCREEN_WIDTH / 2 - FULL_ITEM_SIZE / 2,
    },
    dayCard: {
        width: ITEM_WIDTH,
        height: 64,
        borderRadius: 10,
        backgroundColor: '#F2F2F7',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: ITEM_MARGIN,
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