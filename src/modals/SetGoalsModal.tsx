import { useGoalsStore } from '@/data/dataStores/useGoalStore';
import React, { useEffect, useState } from 'react';
import {
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';

interface SetGoalsModalProps {
    isVisible: boolean;
    onClose: () => void;
}

export const SetGoalsModal: React.FC<SetGoalsModalProps> = ({ isVisible, onClose }) => {
    const { dailyCaloriesTarget, dailyProteinTarget, dailyFiberTarget, setTargets } = useGoalsStore();

    const [calories, setCalories] = useState(dailyCaloriesTarget.toString());
    const [protein, setProtein] = useState(dailyProteinTarget.toString());
    const [fiber, setFiber] = useState(dailyFiberTarget.toString());

    // Keep fields synchronized with the store state whenever opened
    useEffect(() => {
        if (isVisible) {
            setCalories(dailyCaloriesTarget.toString());
            setProtein(dailyProteinTarget.toString());
            setFiber(dailyFiberTarget.toString());
        }
    }, [isVisible, dailyCaloriesTarget, dailyProteinTarget, dailyFiberTarget]);

    const handleSaveGoals = () => {
        const parsedCal = parseInt(calories, 10) || 0;
        const parsedPro = parseFloat(protein) || 0;
        const parsedFib = parseFloat(fiber) || 0;

        if (parsedCal <= 0 || parsedPro <= 0 || parsedFib <= 0) {
            alert('Please enter valid baseline numbers greater than 0.');
            return;
        }

        setTargets({
            calories: parsedCal,
            protein: parseFloat(parsedPro.toFixed(1)),
            fiber: parseFloat(parsedFib.toFixed(1)),
        });

        onClose();
    };

    return (
        <Modal visible={isVisible} animationType="fade" transparent onRequestClose={onClose}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.modalOverlay}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={styles.modalContainer}
                    >
                        <Text style={styles.modalTitle}>Set Macro Targets</Text>

                        <Text style={styles.inputLabel}>Daily Calories Target (kcal)</Text>
                        <TextInput
                            style={styles.textInput}
                            keyboardType="numeric"
                            value={calories}
                            onChangeText={setCalories}
                            placeholder="e.g., 2000"
                        />

                        <Text style={styles.inputLabel}>Daily Protein Target (g)</Text>
                        <TextInput
                            style={styles.textInput}
                            keyboardType="numeric"
                            value={protein}
                            onChangeText={setProtein}
                            placeholder="e.g., 130"
                        />

                        <Text style={styles.inputLabel}>Daily Fiber Target (g)</Text>
                        <TextInput
                            style={styles.textInput}
                            keyboardType="numeric"
                            value={fiber}
                            onChangeText={setFiber}
                            placeholder="e.g., 30"
                        />

                        <View style={styles.actionRow}>
                            <TouchableOpacity style={[styles.btn, styles.btnCancel]} onPress={onClose}>
                                <Text style={styles.btnCancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.btn, styles.btnSave]} onPress={handleSaveGoals}>
                                <Text style={styles.btnSaveText}>Save Goals</Text>
                            </TouchableOpacity>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.4)', justifyContent: 'center', alignItems: 'center' },
    modalContainer: { backgroundColor: '#FFF', borderRadius: 20, width: '85%', maxWidth: 360, paddingHorizontal: 24, paddingTop: 24, paddingBottom: 28, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 10, elevation: 6 },
    modalTitle: { fontSize: 20, fontWeight: '700', color: '#111', marginBottom: 20, textAlign: 'center' },
    inputLabel: { fontSize: 14, fontWeight: '600', color: '#444', marginBottom: 6 },
    textInput: { backgroundColor: '#F5F5F7', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, color: '#000', marginBottom: 16, borderWidth: 1, borderColor: '#E5E5EA' },
    actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
    btn: { flex: 0.48, borderRadius: 12, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
    btnCancel: { backgroundColor: '#F2F2F7' },
    btnCancelText: { fontSize: 16, fontWeight: '600', color: '#FF3B30' },
    btnSave: { backgroundColor: '#007AFF' },
    btnSaveText: { fontSize: 16, fontWeight: '600', color: '#FFF' },
});