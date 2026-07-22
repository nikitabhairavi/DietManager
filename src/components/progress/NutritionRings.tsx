import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, G, LinearGradient, Path, Stop } from 'react-native-svg';

interface NutritionRingsProps {
    calories: number;
    caloriesTarget: number;
    protein: number;
    proteinTarget: number;
    fiber: number;
    fiberTarget: number;
}

export const NutritionRings: React.FC<NutritionRingsProps> = ({
    calories,
    caloriesTarget,
    protein,
    proteinTarget,
    fiber,
    fiberTarget,
}) => {
    // Uncapped percentages to handle ring overlap > 100%
    const macroPercentages = useMemo(() => {
        return {
            calories: (calories / (caloriesTarget || 1)) * 100,
            protein: (protein / (proteinTarget || 1)) * 100,
            fiber: (fiber / (fiberTarget || 1)) * 100,
        };
    }, [calories, caloriesTarget, protein, proteinTarget, fiber, fiberTarget]);

    // Concentric Circle Dimensions
    const centerPos = 120; // 240x240 canvas size
    const strokeWidth = 15; // Thick, bold rings

    // Expanded Ring Radii
    const calRadius = 100;
    const proteinRadius = 82;
    const fiberRadius = 64;

    // Circumferences
    const calCircumference = 2 * Math.PI * calRadius;
    const proteinCircumference = 2 * Math.PI * proteinRadius;
    const fiberCircumference = 2 * Math.PI * fiberRadius;

    // Compute polar coordinates & orientation for arrow icons at the active tip
    const getTipTransform = (radius: number, percentage: number) => {
        const angleDeg = -90 + (percentage / 100) * 360;
        const angleRad = (angleDeg * Math.PI) / 180;

        const x = centerPos + radius * Math.cos(angleRad);
        const y = centerPos + radius * Math.sin(angleRad);
        const rotation = angleDeg + 90;

        return { x, y, rotation };
    };

    const calTip = useMemo(() => getTipTransform(calRadius, macroPercentages.calories), [macroPercentages.calories]);
    const proteinTip = useMemo(() => getTipTransform(proteinRadius, macroPercentages.protein), [macroPercentages.protein]);
    const fiberTip = useMemo(() => getTipTransform(fiberRadius, macroPercentages.fiber), [macroPercentages.fiber]);

    const renderRingWithGradient = (
        radius: number,
        circumference: number,
        percentage: number,
        gradientId: string,
        tintColor: string,
        tip: { x: number; y: number; rotation: number }
    ) => {
        const isOver100 = percentage > 100;
        const basePercentage = isOver100 ? 100 : percentage;
        const excessPercentage = isOver100 ? Math.min(percentage - 100, 100) : 0;

        const baseOffset = circumference - (basePercentage / 100) * circumference;
        const excessOffset = circumference - (excessPercentage / 100) * circumference;

        return (
            <G key={gradientId}>
                {/* 1. Base Dark Background Track */}
                <Circle
                    cx={centerPos}
                    cy={centerPos}
                    r={radius}
                    stroke="#1C1C1E"
                    strokeWidth={strokeWidth}
                    fill="none"
                />

                {/* 2. Slightly Darkened Color Tint for Uncompleted Portion */}
                <Circle
                    cx={centerPos}
                    cy={centerPos}
                    r={radius}
                    stroke={tintColor}
                    strokeWidth={strokeWidth}
                    fill="none"
                    opacity={0.2}
                />

                {/* 3. Main Progress Arc (Completed part transitions to dark/vivid colors) */}
                {percentage > 0 && (
                    <Circle
                        cx={centerPos}
                        cy={centerPos}
                        r={radius}
                        stroke={`url(#${gradientId})`}
                        strokeWidth={strokeWidth}
                        fill="none"
                        strokeDasharray={circumference}
                        strokeDashoffset={baseOffset}
                        strokeLinecap="round"
                        rotation="-90"
                        origin={`${centerPos}, ${centerPos}`}
                    />
                )}

                {/* 4. Overlapping Arc for >100% loop completion */}
                {isOver100 && excessPercentage > 0 && (
                    <Circle
                        cx={centerPos}
                        cy={centerPos}
                        r={radius}
                        stroke={`url(#${gradientId})`}
                        strokeWidth={strokeWidth}
                        fill="none"
                        strokeDasharray={circumference}
                        strokeDashoffset={excessOffset}
                        strokeLinecap="round"
                        rotation="-90"
                        origin={`${centerPos}, ${centerPos}`}
                    />
                )}

                {/* Active Tip Arrows (Double chevrons '>>') */}
                {percentage > 1 && (
                    <G transform={`translate(${tip.x}, ${tip.y}) rotate(${tip.rotation})`}>
                        <Path
                            d="M-2 -4 L3 0 L-2 4"
                            stroke="#FFFFFF"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill="none"
                        />
                        <Path
                            d="M-6 -4 L-1 0 L-6 4"
                            stroke="#FFFFFF"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill="none"
                        />
                    </G>
                )}
            </G>
        );
    };

    return (
        <View style={styles.ringsCard}>
            <View style={styles.ringsContainer}>
                <Svg width={240} height={240}>
                    <Defs>
                        {/* Calories Gradient */}
                        <LinearGradient id="caloriesGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <Stop offset="0%" stopColor="#FF859B" />
                            <Stop offset="50%" stopColor="#E60023" />
                            <Stop offset="100%" stopColor="#5C000B" />
                        </LinearGradient>

                        {/* Protein Gradient */}
                        <LinearGradient id="proteinGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <Stop offset="0%" stopColor="#7CDDFF" />
                            <Stop offset="50%" stopColor="#0066FF" />
                            <Stop offset="100%" stopColor="#001852" />
                        </LinearGradient>

                        {/* Fiber Gradient */}
                        <LinearGradient id="fiberGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <Stop offset="0%" stopColor="#C4FF70" />
                            <Stop offset="50%" stopColor="#22C55E" />
                            <Stop offset="100%" stopColor="#053A0A" />
                        </LinearGradient>
                    </Defs>

                    {/* Calories Ring */}
                    {renderRingWithGradient(
                        calRadius,
                        calCircumference,
                        macroPercentages.calories,
                        'caloriesGradient',
                        '#501520', // Darker burgundy-pink uncompleted track
                        calTip
                    )}

                    {/* Protein Ring */}
                    {renderRingWithGradient(
                        proteinRadius,
                        proteinCircumference,
                        macroPercentages.protein,
                        'proteinGradient',
                        '#103050', // Darker navy-blue uncompleted track
                        proteinTip
                    )}

                    {/* Fiber Ring */}
                    {renderRingWithGradient(
                        fiberRadius,
                        fiberCircumference,
                        macroPercentages.fiber,
                        'fiberGradient',
                        '#1A3B1F', // Darker forest-green uncompleted track
                        fiberTip
                    )}
                </Svg>

                {/* Center Summary Overlay */}
                <View style={styles.centerTextOverlay}>
                    <Text style={styles.centerCalValue}>{calories.toFixed(0)}</Text>
                    <Text style={styles.centerCalTarget}>/ {caloriesTarget} kcal</Text>
                </View>
            </View>

            {/* Key Legend Below Rings */}
            <View style={styles.legendRow}>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#E60023' }]} />
                    <View>
                        <Text style={styles.legendTitle}>Calories</Text>
                        <Text style={styles.legendSub}>
                            {calories.toFixed(0)} / {caloriesTarget}
                        </Text>
                    </View>
                </View>

                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#0066FF' }]} />
                    <View>
                        <Text style={styles.legendTitle}>Protein</Text>
                        <Text style={styles.legendSub}>
                            {protein.toFixed(1)} / {proteinTarget}g
                        </Text>
                    </View>
                </View>

                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#22C55E' }]} />
                    <View>
                        <Text style={styles.legendTitle}>Fiber</Text>
                        <Text style={styles.legendSub}>
                            {fiber.toFixed(1)} / {fiberTarget}g
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    ringsCard: {
        backgroundColor: '#000000', // Pitch Black OLED
        borderRadius: 24,
        paddingVertical: 22,
        paddingHorizontal: 16,
        marginBottom: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 4,
    },
    ringsContainer: {
        width: 240,
        height: 240,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    centerTextOverlay: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    centerCalValue: {
        fontSize: 34,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: -0.5,
    },
    centerCalTarget: {
        fontSize: 13,
        fontWeight: '600',
        color: '#8E8E93',
        marginTop: 2,
    },
    legendRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginTop: 18,
        paddingTop: 14,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: '#1C1C1E',
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    legendDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 6,
    },
    legendTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    legendSub: {
        fontSize: 11,
        color: '#8E8E93',
        fontWeight: '500',
    },
});