import React, { useState } from 'react';
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
  View
} from 'react-native';
import { useIngredientsStore } from '../app/data/dataStores/useIngredientStore';

interface AddIngredientModalProps {
  isVisible: boolean;
  onClose: () => void;
}

export const AddIngredientModal: React.FC<AddIngredientModalProps> = ({ isVisible, onClose }) => {
  const addIngredient = useIngredientsStore((state) => state.addIngredient);

  // Form states
  const [name, setName] = useState('');
  const [quantityStr, setQuantityStr] = useState(''); // Managed as a string input per requirements
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [fiber, setFiber] = useState('');

  const handleSave = () => {
    if (!name.trim()) {
      alert('Please enter an ingredient name.');
      return;
    }

    // Safely parse values or fallback to 0
    const quantityPerUnit = parseFloat(quantityStr) || 0;
    const caloriesPerUnit = parseFloat(calories) || 0;
    const proteinPerUnit = parseFloat(protein) || 0;
    const fiberPerUnit = parseFloat(fiber) || 0;

    // Dispatch payload to our persistent MMKV-Zustand store
    addIngredient({
      name: name.trim(),
      quantityPerUnit,
      caloriesPerUnit,
      proteinPerUnit,
      fiberPerUnit,
    });

    // Reset form field inputs
    setName('');
    setQuantityStr('');
    setCalories('');
    setProtein('');
    setFiber('');
    
    onClose();
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContainer}
          >
            <Text style={styles.modalTitle}>Add New Ingredient</Text>

            {/* Ingredient Name */}
            <Text style={styles.inputLabel}>Ingredient Name</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g., Chicken Breast, Avocado"
              placeholderTextColor="#999"
              value={name}
              onChangeText={setName}
            />

            {/* Quantity per Unit */}
            <Text style={styles.inputLabel}>Quantity Per Unit (String Input)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g., 100 for 100g, 1 for single item"
              placeholderTextColor="#999"
              keyboardType="numeric"
              value={quantityStr}
              onChangeText={setQuantityStr}
            />

            {/* Macro Matrix Layout Grid */}
            <View style={styles.macroRow}>
              <View style={styles.macroCol}>
                <Text style={styles.inputLabel}>Calories</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="kcal"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                  value={calories}
                  onChangeText={setCalories}
                />
              </View>

              <View style={styles.macroCol}>
                <Text style={styles.inputLabel}>Protein (g)</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="g"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                  value={protein}
                  onChangeText={setProtein}
                />
              </View>

              <View style={styles.macroCol}>
                <Text style={styles.inputLabel}>Fiber (g)</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="g"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                  value={fiber}
                  onChangeText={setFiber}
                />
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionRow}>
              <TouchableOpacity style={[styles.btn, styles.btnCancel]} onPress={onClose}>
                <Text style={styles.btnCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.btn, styles.btnSave]} onPress={handleSave}>
                <Text style={styles.btnSaveText}>Add to List</Text>
              </TouchableOpacity>
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
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#F5F5F7',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  macroCol: {
    flex: 0.3,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  btn: {
    flex: 0.48,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnCancel: {
    backgroundColor: '#F2F2F7',
  },
  btnCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
  },
  btnSave: {
    backgroundColor: '#007AFF',
  },
  btnSaveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
});