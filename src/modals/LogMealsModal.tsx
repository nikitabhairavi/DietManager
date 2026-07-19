import { useMealsStore } from '@/data/dataStores/meals/useMealsStore';
import { Recipe, useRecipeStore } from '@/data/dataStores/recipeStore/useRecipeStore';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
    FlatList,
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

interface LogMealModalProps {
    isVisible: boolean;
    onClose: () => void;
    targetDateString: string; // The formatted YYYY-MM-DD date key from the calendar strip
}

export const LogMealModal: React.FC<LogMealModalProps> = ({ isVisible, onClose, targetDateString }) => {
    const recipes = useRecipeStore((state) => state.recipes);
    const logMeal = useMealsStore((state) => state.logMeal);

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
    const [portionSize, setPortionSize] = useState('1.0'); // Default to 1 full standard serving
    const [showDropdown, setShowDropdown] = useState(false);

    // Filter available kitchen recipes dynamically matching user text query
    const filteredRecipes = useMemo(() => {
        if (!searchQuery.trim()) return recipes;
        return recipes.filter((rec) =>
            rec.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [recipes, searchQuery]);

    const handleSelectRecipe = (recipe: Recipe) => {
        setSelectedRecipe(recipe);
        setSearchQuery(recipe.name);
        setShowDropdown(false);
        Keyboard.dismiss();
    };

    const handleLogMealSubmit = () => {
        if (!selectedRecipe) {
            alert('Please select a recipe first.');
            return;
        }

        const parsedPortion = parseFloat(portionSize);
        if (isNaN(parsedPortion) || parsedPortion <= 0) {
            alert('Please enter a valid portion size greater than 0.');
            return;
        }

        // Capture present hours and minutes for chronological timeline tracking
        const now = new Date();
        const timeStr = now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });

        // Commit to daily storage tracking matrix
        logMeal(
            targetDateString,
            {
                recipeId: selectedRecipe.id,
                name: selectedRecipe.name,
                portionSize: parsedPortion,
                loggedAtTime: timeStr,
            },
            {
                calories: selectedRecipe.totalCalories,
                protein: selectedRecipe.totalProtein,
                fiber: selectedRecipe.totalFiber,
            }
        );

        // Reset Sandbox Context Shell
        setSelectedRecipe(null);
        setSearchQuery('');
        setPortionSize('1.0');
        onClose();
    };

    return (
        <Modal visible={isVisible} animationType="slide" transparent onRequestClose={onClose}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.modalOverlay}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={styles.modalContainer}
                    >
                        <Text style={styles.modalTitle}>Log Kitchen Meal</Text>

                        {/* Step 1: Search and Select Recipe Input */}
                        <Text style={styles.inputLabel}>Choose Recipe</Text>
                        <View style={styles.searchBarWrapper}>
                            <TextInput
                                style={[styles.textInput, { marginBottom: 0, flex: 1, paddingRight: 40 }]}
                                placeholder="Type to search your recipes..."
                                placeholderTextColor="#999"
                                value={searchQuery}
                                onChangeText={(text) => {
                                    setSearchQuery(text);
                                    setSelectedRecipe(null); // Clear item lock if typing new queries
                                    setShowDropdown(true);
                                }}
                                onFocus={() => setShowDropdown(true)}
                            />
                            {searchQuery.length > 0 && (
                                <TouchableOpacity
                                    style={styles.clearInputButton}
                                    onPress={() => {
                                        setSearchQuery('');
                                        setSelectedRecipe(null);
                                        setShowDropdown(false);
                                    }}
                                >
                                    <Ionicons name="close-circle" size={18} color="#8E8E93" />
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* Filtered Search Selection Popup Dropdown */}
                        {showDropdown && (
                            <View style={styles.dropdownListContainer}>
                                <FlatList
                                    data={filteredRecipes}
                                    keyExtractor={(item) => item.id}
                                    style={{ maxHeight: 140 }}
                                    nestedScrollEnabled
                                    keyboardShouldPersistTaps="handled"
                                    renderItem={({ item }) => (
                                        <TouchableOpacity
                                            style={styles.dropdownItem}
                                            onPress={() => handleSelectRecipe(item)}
                                        >
                                            <Text style={styles.dropdownItemText}>{item.name}</Text>
                                            <Text style={styles.dropdownItemSub}>{item.totalCalories} kcal</Text>
                                        </TouchableOpacity>
                                    )}
                                    ListEmptyComponent={
                                        <Text style={styles.emptyDropdownText}>No matching recipes found.</Text>
                                    }
                                />
                            </View>
                        )}

                        {/* Step 2: Portion Multiplier Field */}
                        <View style={styles.portionRow}>
                            <View style={styles.portionInputContainer}>
                                <Text style={styles.inputLabel}>Portion Size Multiplier</Text>
                                <TextInput
                                    style={[styles.textInput, styles.portionInput]}
                                    keyboardType="numeric"
                                    value={portionSize}
                                    onChangeText={setPortionSize}
                                    placeholder="1.0"
                                />
                            </View>
                            <View style={styles.portionHelp}>
                                <Text style={styles.helpText}>e.g., 0.5 = Half Portion</Text>
                                <Text style={styles.helpText}>e.g., 1.5 = Extra Serving</Text>
                            </View>
                        </View>

                        {/* Step 3: Predictive Scaling Telemetry Preview */}
                        {selectedRecipe && (
                            <View style={styles.previewDashboard}>
                                <Text style={styles.previewTitle}>Scaled Macros Preview</Text>
                                <View style={styles.macroMetricsRow}>
                                    <View style={styles.metricCell}>
                                        <Text style={styles.metricVal}>
                                            {((selectedRecipe.totalCalories * (parseFloat(portionSize) || 0))).toFixed(0)}
                                        </Text>
                                        <Text style={styles.metricLbl}>Calories</Text>
                                    </View>
                                    <View style={styles.metricCell}>
                                        <Text style={styles.metricVal}>
                                            {((selectedRecipe.totalProtein * (parseFloat(portionSize) || 0))).toFixed(1)}g
                                        </Text>
                                        <Text style={styles.metricLbl}>Protein</Text>
                                    </View>
                                    <View style={styles.metricCell}>
                                        <Text style={styles.metricVal}>
                                            {((selectedRecipe.totalFiber * (parseFloat(portionSize) || 0))).toFixed(1)}g
                                        </Text>
                                        <Text style={styles.metricLbl}>Fiber</Text>
                                    </View>
                                </View>
                            </View>
                        )}

                        {/* Footer Form Action Buttons Matrix */}
                        <View style={styles.actionRow}>
                            <TouchableOpacity style={[styles.btn, styles.btnCancel]} onPress={onClose}>
                                <Text style={styles.btnCancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.btn, styles.btnSave]} onPress={handleLogMealSubmit}>
                                <Text style={styles.btnSaveText}>Log to Day</Text>
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
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        width: '90%',
        maxWidth: 420,
        paddingHorizontal: 24,
        paddingTop: 26,
        paddingBottom: 28,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 6,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111',
        marginBottom: 16,
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
        borderWidth: 1,
        borderColor: '#E5E5EA',
    },
    searchBarWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative',
        marginBottom: 14,
    },
    clearInputButton: {
        position: 'absolute',
        right: 12,
        padding: 4,
    },
    dropdownListContainer: {
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#E5E5EA',
        borderRadius: 10,
        marginTop: -10,
        marginBottom: 14,
        maxHeight: 145,
        overflow: 'hidden',
        zIndex: 10,
    },
    dropdownItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F2F2F7',
    },
    dropdownItemText: {
        fontSize: 15,
        color: '#000',
        fontWeight: '500',
    },
    dropdownItemSub: {
        fontSize: 13,
        color: '#8E8E93',
    },
    emptyDropdownText: {
        padding: 12,
        color: '#8E8E93',
        textAlign: 'center',
        fontSize: 14,
    },
    portionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    portionInputContainer: {
        flex: 0.55,
    },
    portionInput: {
        textAlign: 'center',
        fontWeight: '600',
    },
    portionHelp: {
        flex: 0.4,
        justifyContent: 'center',
        paddingTop: 18,
    },
    helpText: {
        fontSize: 11,
        color: '#8E8E93',
        lineHeight: 14,
    },
    previewDashboard: {
        backgroundColor: '#F2F2F7',
        borderRadius: 12,
        padding: 12,
        marginBottom: 20,
    },
    previewTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: '#666',
        textAlign: 'center',
        marginBottom: 6,
        textTransform: 'uppercase',
    },
    macroMetricsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    metricCell: {
        alignItems: 'center',
    },
    metricVal: {
        fontSize: 16,
        fontWeight: '700',
        color: '#007AFF',
    },
    metricLbl: {
        fontSize: 11,
        color: '#666',
        marginTop: 2,
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