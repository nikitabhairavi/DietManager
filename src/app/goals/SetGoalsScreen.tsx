import { useGoalsStore } from '@/data/dataStores/useGoalStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function SetGoalsScreen() {
    const router = useRouter();

    // Pull current values and available updater actions
    const store = useGoalsStore();
    const {
        dailyCaloriesTarget,
        dailyProteinTarget,
        dailyFiberTarget,
        dailyActiveCaloriesTarget = 500,
        dailyStepsTarget = 10000,
    } = store;

    const [calories, setCalories] = useState(dailyCaloriesTarget.toString());
    const [protein, setProtein] = useState(dailyProteinTarget.toString());
    const [fiber, setFiber] = useState(dailyFiberTarget.toString());
    const [activeCalories, setActiveCalories] = useState(dailyActiveCaloriesTarget.toString());
    const [steps, setSteps] = useState(dailyStepsTarget.toString());

    const handleSave = () => {
        // Directly batch-update state in Zustand store
        useGoalsStore.setState({
            dailyCaloriesTarget: parseFloat(calories) || 0,
            dailyProteinTarget: parseFloat(protein) || 0,
            dailyFiberTarget: parseFloat(fiber) || 0,
            dailyActiveCaloriesTarget: parseFloat(activeCalories) || 0,
            dailyStepsTarget: parseInt(steps, 10) || 0,
        });

        router.back();
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Navigation Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
                    <Ionicons name="chevron-back" size={24} color="#007AFF" />
                    <Text style={styles.backText}>Account</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Daily Goals</Text>
                <TouchableOpacity style={styles.saveHeaderButton} onPress={handleSave} activeOpacity={0.7}>
                    <Text style={styles.saveHeaderText}>Save</Text>
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {/* Nutrition Targets Section */}
                    <Text style={styles.sectionTitle}>Nutrition Targets</Text>
                    <View style={styles.card}>
                        <View style={styles.inputRow}>
                            <View style={styles.labelWrapper}>
                                <Ionicons name="flame-outline" size={20} color="#FF2D55" />
                                <Text style={styles.inputLabel}>Calories</Text>
                            </View>
                            <View style={styles.inputFieldWrapper}>
                                <TextInput
                                    style={styles.input}
                                    keyboardType="numeric"
                                    value={calories}
                                    onChangeText={setCalories}
                                    placeholder="2000"
                                />
                                <Text style={styles.unitText}>kcal</Text>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.inputRow}>
                            <View style={styles.labelWrapper}>
                                <Ionicons name="fitness-outline" size={20} color="#30D158" />
                                <Text style={styles.inputLabel}>Protein</Text>
                            </View>
                            <View style={styles.inputFieldWrapper}>
                                <TextInput
                                    style={styles.input}
                                    keyboardType="numeric"
                                    value={protein}
                                    onChangeText={setProtein}
                                    placeholder="130"
                                />
                                <Text style={styles.unitText}>g</Text>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.inputRow}>
                            <View style={styles.labelWrapper}>
                                <Ionicons name="leaf-outline" size={20} color="#64D2FF" />
                                <Text style={styles.inputLabel}>Fiber</Text>
                            </View>
                            <View style={styles.inputFieldWrapper}>
                                <TextInput
                                    style={styles.input}
                                    keyboardType="numeric"
                                    value={fiber}
                                    onChangeText={setFiber}
                                    placeholder="30"
                                />
                                <Text style={styles.unitText}>g</Text>
                            </View>
                        </View>
                    </View>

                    {/* Activity Targets Section */}
                    <Text style={styles.sectionTitle}>Activity Targets</Text>
                    <View style={styles.card}>
                        <View style={styles.inputRow}>
                            <View style={styles.labelWrapper}>
                                <Ionicons name="barbell-outline" size={20} color="#FF9500" />
                                <Text style={styles.inputLabel}>Active Burn</Text>
                            </View>
                            <View style={styles.inputFieldWrapper}>
                                <TextInput
                                    style={styles.input}
                                    keyboardType="numeric"
                                    value={activeCalories}
                                    onChangeText={setActiveCalories}
                                    placeholder="500"
                                />
                                <Text style={styles.unitText}>kcal</Text>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.inputRow}>
                            <View style={styles.labelWrapper}>
                                <Ionicons name="footsteps-outline" size={20} color="#007AFF" />
                                <Text style={styles.inputLabel}>Steps</Text>
                            </View>
                            <View style={styles.inputFieldWrapper}>
                                <TextInput
                                    style={styles.input}
                                    keyboardType="numeric"
                                    value={steps}
                                    onChangeText={setSteps}
                                    placeholder="10000"
                                />
                                <Text style={styles.unitText}>steps</Text>
                            </View>
                        </View>
                    </View>

                    {/* Save Button */}
                    <TouchableOpacity style={styles.submitButton} onPress={handleSave} activeOpacity={0.8}>
                        <Text style={styles.submitButtonText}>Update Goals</Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F2F7',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#C6C6C8',
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        width: 80,
    },
    backText: {
        fontSize: 16,
        color: '#007AFF',
        marginLeft: -2,
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: '#000000',
    },
    saveHeaderButton: {
        width: 80,
        alignItems: 'flex-end',
    },
    saveHeaderText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#007AFF',
    },
    scrollContent: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#6C6C70',
        textTransform: 'uppercase',
        marginBottom: 8,
        marginLeft: 4,
        letterSpacing: -0.1,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingHorizontal: 16,
        marginBottom: 24,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
    },
    labelWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: '#1C1C1E',
    },
    inputFieldWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    input: {
        fontSize: 16,
        fontWeight: '600',
        color: '#007AFF',
        textAlign: 'right',
        minWidth: 60,
    },
    unitText: {
        fontSize: 14,
        color: '#8E8E93',
    },
    divider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: '#C6C6C8',
    },
    submitButton: {
        backgroundColor: '#007AFF',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 8,
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});