import React, { useEffect, useMemo, useRef } from 'react';
import { Dimensions, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface CalendarStripProps {
    selectedDate: Date;
    onDateSelect: (date: Date) => void;
}

const ITEM_WIDTH = 52;
const ITEM_MARGIN = 5;
const FULL_ITEM_SIZE = ITEM_WIDTH + ITEM_MARGIN * 2; // 62px
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

    const today = useMemo(() => new Date(), []);

    // Generate 14 days surrounding today
    const daysArray = useMemo(() => {
        const dates = [];
        for (let i = -7; i <= 6; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() + i);
            dates.push(d);
        }
        return dates;
    }, [today]);

    const selectedIndex = useMemo(() => {
        return daysArray.findIndex((date) => isSameDay(date, selectedDate));
    }, [daysArray, selectedDate]);

    useEffect(() => {
        if (selectedIndex === -1) return;

        const scrollToTarget = () => {
            flatListRef.current?.scrollToIndex({
                index: selectedIndex,
                animated: !isInitialMount.current,
                viewPosition: 0.5,
            });
            isInitialMount.current = false;
        };

        const timeoutId = setTimeout(() => {
            requestAnimationFrame(scrollToTarget);
        }, 60);

        return () => clearTimeout(timeoutId);
    }, [selectedIndex]);

    return (
        <View style={styles.stripWrapper}>
            <FlatList
                ref={flatListRef}
                data={daysArray}
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToInterval={FULL_ITEM_SIZE}
                decelerationRate="fast"
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
                        : item.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
                    const dayNumber = item.getDate();

                    return (
                        <TouchableOpacity
                            style={[
                                styles.dayCard,
                                isTodayItem && styles.todayCard,
                                isSelected && styles.selectedDayCard,
                            ]}
                            onPress={() => onDateSelect(item)}
                            activeOpacity={0.8}
                        >
                            {/* Today Accent Dot */}
                            {isTodayItem && (
                                <View style={[styles.todayDot, isSelected && styles.selectedTodayDot]} />
                            )}

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
    stripWrapper: {
        backgroundColor: '#FFFFFF',
        paddingVertical: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 6,
        elevation: 2,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#E5E5EA',
    },
    listPadding: {
        paddingHorizontal: SCREEN_WIDTH / 2 - FULL_ITEM_SIZE / 2,
    },
    dayCard: {
        width: ITEM_WIDTH,
        height: 68,
        borderRadius: 16,
        backgroundColor: '#F2F2F7',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: ITEM_MARGIN,
        paddingVertical: 6,
    },
    todayCard: {
        backgroundColor: '#EBF5FF',
        borderWidth: 1,
        borderColor: '#B3D7FF',
    },
    selectedDayCard: {
        backgroundColor: '#007AFF',
        borderColor: '#007AFF',
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 4,
    },
    todayDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#007AFF',
        marginBottom: 2,
    },
    selectedTodayDot: {
        backgroundColor: '#FFFFFF',
    },
    dayNameText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#8E8E93',
        letterSpacing: 0.2,
        marginBottom: 2,
    },
    todayTypeText: {
        color: '#007AFF',
    },
    dayNumberText: {
        fontSize: 19,
        fontWeight: '800',
        color: '#1C1C1E',
        letterSpacing: -0.3,
    },
    todayNumberText: {
        color: '#007AFF',
    },
    selectedTypeText: {
        color: '#FFFFFF',
    },
});