import { useGoalsStore } from '@/data/dataStores/useGoalStore';
import React, { useEffect, useState } from 'react';
import {
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface SetGoalsModalProps {
    isVisible: boolean;
    onClose: () => void;
}

export const SetGoalsModal: React.FC<SetGoalsModalProps> = ({ isVisible, onClose }) => {
    const {
        dailyCaloriesTarget,
        dailyProteinTarget,
        dailyFiberTarget,
        dailyActiveCaloriesTarget,
        dailyStepsTarget,
        setTargets,
    } = useGoalsStore();

    const [calories, setCalories] = useState('');
    const [protein, setProtein] = useState('');
    const [fiber, setFiber] = useState('');
    const [activeCalories, setActiveCalories] = useState('');
    const [steps, setSteps] = useState('');

    // Prefill active goals when opening modal
    useEffect(() => {
        if (isVisible) {
            setCalories(dailyCaloriesTarget.toString());
            setProtein(dailyProteinTarget.toString());
            setFiber(dailyFiberTarget.toString());
            setActiveCalories((dailyActiveCaloriesTarget || 500).toString());
            setSteps((dailyStepsTarget || 10000).toString());
        }
    }, [
        isVisible,
        dailyCaloriesTarget,
        dailyProteinTarget,
        dailyFiberTarget,
        dailyActiveCaloriesTarget,
        dailyStepsTarget,
    ]);

    const handleSave = () => {
        const parsedCalories = parseFloat(calories) || dailyCaloriesTarget;
        const parsedProtein = parseFloat(protein) || dailyProteinTarget;
        const parsedFiber = parseFloat(fiber) || dailyFiberTarget;
        const parsedActiveCalories = parseFloat(activeCalories) || dailyActiveCaloriesTarget;
        const parsedSteps = parseInt(steps, 10) || dailyStepsTarget;

        setTargets({
            calories: parsedCalories,
            protein: parsedProtein,
            fiber: parsedFiber,
            activeCalories: parsedActiveCalories,
            steps: parsedSteps,
        });

        onClose();
    };

    return (
        <Modal
            visible={isVisible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>Set Daily Targets</Text>

                    {/* Calories Target */}
                    <View style={styles.inputRow}>
                        <Text style={styles.inputLabel}>Calories Consumed (kcal)</Text>
                        <TextInput
                            style={styles.input}
                            keyboardType="numeric"
                            value={calories}
                            onChangeText={setCalories}
                            placeholder="e.g. 2000"
                        />
                    </View>

                    {/* Protein Target */}
                    <View style={styles.inputRow}>
                        <Text style={styles.inputLabel}>Protein Goal (g)</Text>
                        <TextInput
                            style={styles.input}
                            keyboardType="numeric"
                            value={protein}
                            onChangeText={setProtein}
                            placeholder="e.g. 130"
                        />
                    </View>

                    {/* Fiber Target */}
                    <View style={styles.inputRow}>
                        <Text style={styles.inputLabel}>Fiber Goal (g)</Text>
                        <TextInput
                            style={styles.input}
                            keyboardType="numeric"
                            value={fiber}
                            onChangeText={setFiber}
                            placeholder="e.g. 30"
                        />
                    </View>

                    {/* Active Calories Burned Goal */}
                    <View style={styles.inputRow}>
                        <Text style={styles.inputLabel}>Active Burn Goal (kcal)</Text>
                        <TextInput
                            style={styles.input}
                            keyboardType="numeric"
                            value={activeCalories}
                            onChangeText={setActiveCalories}
                            placeholder="e.g. 500"
                        />
                    </View>

                    {/* Steps Goal */}
                    <View style={styles.inputRow}>
                        <Text style={styles.inputLabel}>Daily Steps Goal</Text>
                        <TextInput
                            style={styles.input}
                            keyboardType="numeric"
                            value={steps}
                            onChangeText={setSteps}
                            placeholder="e.g. 10000"
                        />
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.buttonRow}>
                        <TouchableOpacity style={[styles.button, styles.cancelBtn]} onPress={onClose}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.button, styles.saveBtn]} onPress={handleSave}>
                            <Text style={styles.saveText}>Save Targets</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '88%',
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 22,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1C1C1E',
        marginBottom: 18,
        textAlign: 'center',
    },
    inputRow: {
        marginBottom: 14,
    },
    inputLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#3A3A3C',
        marginBottom: 6,
    },
    input: {
        backgroundColor: '#F2F2F7',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 15,
        color: '#1C1C1E',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    button: {
        flex: 0.48,
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
    },
    cancelBtn: {
        backgroundColor: '#E5E5EA',
    },
    cancelText: {
        color: '#1C1C1E',
        fontWeight: '600',
    },
    saveBtn: {
        backgroundColor: '#007AFF',
    },
    saveText: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
});