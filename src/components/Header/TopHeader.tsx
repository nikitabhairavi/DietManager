import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface TopHeaderProps {
    title: string;
    showBackButton?: boolean;
    backText?: string;
    onBackPress?: () => void;
    rightElement?: React.ReactNode;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
    title,
    showBackButton = false,
    backText,
    onBackPress,
    rightElement,
}) => {
    const router = useRouter();

    const handleBack = () => {
        if (onBackPress) {
            onBackPress();
        } else {
            router.back();
        }
    };

    return (
        <View style={styles.headerContainer}>
            {/* Left Action / Back Button */}
            <View style={styles.sideSlot}>
                {showBackButton && (
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={handleBack}
                        activeOpacity={0.7}
                        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    >
                        <Ionicons name="chevron-back" size={26} color="#FFFFFF" />
                        {backText && <Text style={styles.backText}>{backText}</Text>}
                    </TouchableOpacity>
                )}
            </View>

            {/* Prominent Screen Title (Matching Mockup Hierarchy) */}
            <View style={styles.titleSlot}>
                <Text style={styles.titleText} numberOfLines={1}>
                    {title}
                </Text>
            </View>

            {/* Right Action Slot */}
            <View style={[styles.sideSlot, styles.rightSlot]}>
                {rightElement}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        height: 60, // Taller header to give the primary title room
        width: '100%',
        backgroundColor: '#000000',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
    },
    sideSlot: {
        width: 70,
        justifyContent: 'center',
    },
    rightSlot: {
        alignItems: 'flex-end',
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: -4,
    },
    backText: {
        fontSize: 15,
        color: '#0A84FF',
        fontWeight: '500',
        marginLeft: 2,
    },
    titleSlot: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    titleText: {
        fontSize: 22, // Significantly larger than the month text
        fontWeight: '700',
        color: '#FFFFFF',
        letterSpacing: -0.4,
    },
});