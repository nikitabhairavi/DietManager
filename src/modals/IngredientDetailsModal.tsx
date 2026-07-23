import { FoodImage } from '@/components/kitchen/FoodImage';
import { Ingredient, useIngredientsStore } from '@/data/dataStores/ingredientsStore/useIngredientStore';
import React, { useEffect, useState } from 'react';
import {
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';

interface IngredientDetailsModalProps {
    ingredient: Ingredient | null;
    isVisible: boolean;
    onClose: () => void;
}

export const IngredientDetailsModal: React.FC<IngredientDetailsModalProps> = ({
    ingredient,
    isVisible,
    onClose,
}) => {
    const updateIngredient = useIngredientsStore((state) => state.updateIngredient);

    const [quantity, setQuantity] = useState('');
    const [calories, setCalories] = useState('');
    const [protein, setProtein] = useState('');
    const [fiber, setFiber] = useState('');

    useEffect(() => {
        if (ingredient && isVisible) {
            setQuantity(ingredient.quantityPerUnit || '');
            setCalories(ingredient.caloriesPerUnit?.toString() || '');
            setProtein(ingredient.proteinPerUnit?.toString() || '');
            setFiber(ingredient.fiberPerUnit?.toString() || '');
        }
    }, [ingredient, isVisible]);

    if (!ingredient) return null;

    const handleSave = async () => {
        await updateIngredient(ingredient.id, {
            quantityPerUnit: quantity,
            caloriesPerUnit: parseFloat(calories) || 0,
            proteinPerUnit: parseFloat(protein) || 0,
            fiberPerUnit: parseFloat(fiber) || 0,
        });
        onClose();
    };

    return (
        <Modal visible={isVisible} transparent animationType="slide" onRequestClose={onClose}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.modalOverlay}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={styles.keyboardView}
                    >
                        <View style={styles.modalContainer}>
                            <ScrollView
                                showsVerticalScrollIndicator={false}
                                contentContainerStyle={styles.scrollContent}
                                keyboardShouldPersistTaps="handled"
                            >
                                {/* Ingredient Image Preview */}
                                <View style={styles.imageHeaderContainer}>
                                    <FoodImage name={ingredient.name} size={72} />
                                </View>

                                <Text style={styles.modalTitle}>{ingredient.name}</Text>

                                <View style={styles.inputRow}>
                                    <Text style={styles.inputLabel}>Serving Quantity Unit</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={quantity}
                                        onChangeText={setQuantity}
                                        placeholder="e.g. 100g, 1 cup"
                                    />
                                </View>

                                <View style={styles.inputRow}>
                                    <Text style={styles.inputLabel}>Calories per Unit (kcal)</Text>
                                    <TextInput
                                        style={styles.input}
                                        keyboardType="numeric"
                                        value={calories}
                                        onChangeText={setCalories}
                                        placeholder="e.g. 150"
                                    />
                                </View>

                                <View style={styles.inputRow}>
                                    <Text style={styles.inputLabel}>Protein per Unit (g)</Text>
                                    <TextInput
                                        style={styles.input}
                                        keyboardType="numeric"
                                        value={protein}
                                        onChangeText={setProtein}
                                        placeholder="e.g. 20"
                                    />
                                </View>

                                <View style={styles.inputRow}>
                                    <Text style={styles.inputLabel}>Fiber per Unit (g)</Text>
                                    <TextInput
                                        style={styles.input}
                                        keyboardType="numeric"
                                        value={fiber}
                                        onChangeText={setFiber}
                                        placeholder="e.g. 5"
                                    />
                                </View>

                                <View style={styles.buttonRow}>
                                    <TouchableOpacity style={[styles.button, styles.cancelBtn]} onPress={onClose}>
                                        <Text style={styles.cancelText}>Cancel</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity style={[styles.button, styles.saveBtn]} onPress={handleSave}>
                                        <Text style={styles.saveText}>Save Changes</Text>
                                    </TouchableOpacity>
                                </View>
                            </ScrollView>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </TouchableWithoutFeedback>
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
    keyboardView: {
        width: '100%',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '90%',
        maxHeight: '90%',
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        paddingHorizontal: 22,
        paddingTop: 22,
        paddingBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 10,
    },
    imageHeaderContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
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
        marginTop: 16,
        marginBottom: 6,
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