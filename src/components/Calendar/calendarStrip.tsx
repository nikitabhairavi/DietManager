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

    // Month & Year header text (e.g., "April 2026")
    const headerTitle = useMemo(() => {
        return selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }, [selectedDate]);

    // Generate 14 days surrounding selected/current date
    const daysArray = useMemo(() => {
        const dates = [];
        for (let i = -7; i <= 7; i++) {
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
        <View style={styles.curvedBannerContainer}>
            {/* Header Month / Year */}
            <Text style={styles.monthHeaderText}>{headerTitle}</Text>

            {/* Horizontal Day Selector */}
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

                    // 2-Letter short format matching screenshot: Su, Mo, Tu, We, Th, Fr, Sa
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

                            {/* Optional Today indicator dot */}
                            {isTodayItem && <View style={styles.todayDot} />}
                        </TouchableOpacity>
                    );
                }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    // Scaled container creating the downward curved arc
    curvedBannerContainer: {
        backgroundColor: '#000000', // Deep black theme replacing the green
        paddingTop: 16,
        paddingBottom: 28,
        width: SCREEN_WIDTH * 1.2, // Expanded past screen boundaries to yield arc curvature
        alignSelf: 'center',
        borderBottomLeftRadius: SCREEN_WIDTH * 0.6,
        borderBottomRightRadius: SCREEN_WIDTH * 0.6,
        alignItems: 'center',
        overflow: 'hidden',
    },
    monthHeaderText: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FFFFFF',
        alignSelf: 'flex-start',
        marginLeft: SCREEN_WIDTH * 0.16 + 16, // Aligns header gracefully over screen edge
        marginBottom: 16,
        letterSpacing: -0.3,
    },
    listPadding: {
        paddingHorizontal: SCREEN_WIDTH * 0.6 - FULL_ITEM_SIZE / 2,
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
        backgroundColor: '#1C1C1E', // Elevated dark tile indicator for active selection
    },
    weekdayText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#8E8E93',
        marginBottom: 6,
    },
    dayNumberText: {
        fontSize: 18,
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