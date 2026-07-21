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

    const isSameDay = (date1: Date, date2: Date) => {
        if (!date1 || !date2) return false;
        return (
            date1.getDate() === date2.getDate() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getFullYear() === date2.getFullYear()
        );
    };

    // Memoize today's date anchor
    const today = useMemo(() => new Date(), []);

    // Generate an array of 14 days surrounding today's current date
    const daysArray = useMemo(() => {
        const dates = [];
        for (let i = -7; i <= 6; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() + i);
            dates.push(d);
        }
        return dates;
    }, [today]);

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
                    flatListRef.current?.scrollToOffset({
                        offset: info.averageItemLength * info.index,
                        animated: false,
                    });
                    setTimeout(() => {
                        flatListRef.current?.scrollToIndex({
                            index: info.index,
                            animated: false,
                            viewPosition: 0.5,
                        });
                    }, 80);
                }}
                renderItem={({ item }) => {
                    const isSelected = isSameDay(item, selectedDate);
                    const isTodayItem = isSameDay(item, today);

                    const dayName = isTodayItem
                        ? 'TODAY'
                        : item.toLocaleDateString('en-US', { weekday: 'short' });
                    const dayNumber = item.getDate();

                    return (
                        <TouchableOpacity
                            style={[
                                styles.dayCard,
                                isTodayItem && styles.todayCard,
                                isSelected && styles.selectedDayCard,
                            ]}
                            onPress={() => onDateSelect(item)}
                            activeOpacity={0.7}
                        >
                            {/* Blue dot indicator for Today when selected */}
                            {isTodayItem && <View style={[styles.todayDot, isSelected && styles.selectedTodayDot]} />}

                            <Text
                                style={[
                                    styles.dayNameText,
                                    isTodayItem && styles.todayTypeText,
                                    isSelected && styles.selectedTypeText,
                                ]}
                            >
                                {dayName}
                            </Text>
                            <Text
                                style={[
                                    styles.dayNumberText,
                                    isTodayItem && styles.todayNumberText,
                                    isSelected && styles.selectedTypeText,
                                ]}
                            >
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
        position: 'relative',
    },
    todayCard: {
        borderWidth: 1.5,
        borderColor: '#007AFF',
        backgroundColor: '#F0F6FF', // Light blue tint for Today
    },
    selectedDayCard: {
        backgroundColor: '#007AFF',
        borderColor: '#007AFF',
    },
    todayDot: {
        position: 'absolute',
        top: 6,
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#007AFF',
    },
    selectedTodayDot: {
        backgroundColor: '#FFFFFF',
    },
    dayNameText: {
        fontSize: 11,
        fontWeight: '500',
        color: '#8E8E93',
        marginBottom: 2,
    },
    todayTypeText: {
        color: '#007AFF',
        fontWeight: '700',
    },
    dayNumberText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000000',
    },
    todayNumberText: {
        color: '#007AFF',
    },
    selectedTypeText: {
        color: '#FFFFFF',
    },
});