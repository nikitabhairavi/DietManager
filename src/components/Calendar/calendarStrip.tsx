import React, { useEffect, useMemo, useRef } from 'react';
import { Dimensions, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface CalendarStripProps {
    selectedDate: Date;
    onDateSelect: (date: Date) => void;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const ITEM_WIDTH = 48;
const ITEM_MARGIN = 4;
const FULL_ITEM_SIZE = ITEM_WIDTH + ITEM_MARGIN * 2; // 56px

// Calculate side padding based on exact physical screen width so item centers at SCREEN_WIDTH / 2
const CENTER_PADDING = SCREEN_WIDTH / 2 - FULL_ITEM_SIZE / 2;

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

    // Month & Year text (e.g., "April 2026")
    const monthYearTitle = useMemo(() => {
        return selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }, [selectedDate]);

    // Generate days centered around today
    const daysArray = useMemo(() => {
        const dates = [];
        const baseDate = today;
        for (let i = -30; i <= 30; i++) {
            const d = new Date(baseDate);
            d.setDate(baseDate.getDate() + i);
            dates.push(d);
        }
        return dates;
    }, [today]);

    const selectedIndex = useMemo(() => {
        const idx = daysArray.findIndex((date) => isSameDay(date, selectedDate));
        return idx !== -1 ? idx : Math.floor(daysArray.length / 2);
    }, [daysArray, selectedDate]);

    // Scroll exact offset to center item precisely
    useEffect(() => {
        if (selectedIndex === -1) return;

        const scrollToTarget = () => {
            const targetOffset = selectedIndex * FULL_ITEM_SIZE;

            flatListRef.current?.scrollToOffset({
                offset: targetOffset,
                animated: !isInitialMount.current,
            });
            isInitialMount.current = false;
        };

        const timeoutId = setTimeout(() => {
            requestAnimationFrame(scrollToTarget);
        }, 50);

        return () => clearTimeout(timeoutId);
    }, [selectedIndex]);

    return (
        <View style={styles.bannerContainer}>
            {/* Top Separator Divider */}
            <View style={styles.topDivider} />

            {/* Month & Year Sub-Header */}
            <Text style={styles.monthSubHeaderText}>{monthYearTitle}</Text>

            {/* Day Selector */}
            <View style={styles.flatListWrapper}>
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
                    renderItem={({ item }) => {
                        const isSelected = isSameDay(item, selectedDate);
                        const isTodayItem = isSameDay(item, today);

                        const weekday = item.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 2);
                        const dayNumber = item.getDate();

                        return (
                            <TouchableOpacity
                                style={[styles.dayColumn, isSelected && styles.selectedDayColumn]}
                                onPress={() => onDateSelect(item)}
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.weekdayText, isSelected && styles.selectedText]}>
                                    {weekday}
                                </Text>

                                <Text style={[styles.dayNumberText, isSelected && styles.selectedText]}>
                                    {dayNumber}
                                </Text>

                                {isTodayItem && <View style={styles.todayDot} />}
                            </TouchableOpacity>
                        );
                    }}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    bannerContainer: {
        backgroundColor: '#000000',
        paddingBottom: 16,
        width: '100%',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#1C1C1E',
    },
    topDivider: {
        width: '100%',
        height: StyleSheet.hairlineWidth,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        marginBottom: 12,
    },
    monthSubHeaderText: {
        fontSize: 15,
        fontWeight: '500',
        color: '#A1A1A6',
        paddingHorizontal: 16,
        marginBottom: 12,
        letterSpacing: -0.2,
    },
    flatListWrapper: {
        width: '100%',
    },
    listPadding: {
        paddingHorizontal: CENTER_PADDING,
    },
    dayColumn: {
        width: ITEM_WIDTH,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: ITEM_MARGIN,
        paddingVertical: 6,
        borderRadius: 12,
    },
    selectedDayColumn: {
        backgroundColor: '#1C1C1E',
    },
    weekdayText: {
        fontSize: 13,
        fontWeight: '500',
        color: '#8E8E93',
        marginBottom: 4,
    },
    dayNumberText: {
        fontSize: 17,
        fontWeight: '600',
        color: '#E5E5EA',
    },
    selectedText: {
        color: '#FFFFFF',
        fontWeight: '800',
    },
    todayDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#0A84FF',
        marginTop: 4,
    },
});