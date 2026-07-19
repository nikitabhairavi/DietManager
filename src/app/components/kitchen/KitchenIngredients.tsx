import { useIngredientsStore } from '@/app/data/dataStores/ingredientsStore/useIngredientStore';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface KitchenIngredientsProps {
  searchQuery: string;
}

export const KitchenIngredients: React.FC<KitchenIngredientsProps> = ({ searchQuery }) => {
  // Grab both the ingredients state and the remove action from the store
  const ingredients = useIngredientsStore((state) => state.ingredients);
  const removeIngredient = useIngredientsStore((state) => state.deleteIngredient);

  // Filter list matching lowercase search strings
  const filteredIngredients = ingredients.filter((ing) =>
    ing.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <FlatList
      data={filteredIngredients}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listPadding}
      renderItem={({ item }) => (
        <View style={styles.itemCard}>
          <View style={styles.cardContent}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemDetails}>
              Per unit: {item.quantityPerUnit} | {item.caloriesPerUnit} kcal | P: {item.proteinPerUnit}g | F: {item.fiberPerUnit}g
            </Text>
          </View>
          
          {/* Delete Action Button */}
          <TouchableOpacity 
            style={styles.deleteButton} 
            onPress={() => removeIngredient(item.id)}
            activeOpacity={0.6}
          >
            <Ionicons name="trash-outline" size={20} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      )}
      ListEmptyComponent={
        <Text style={styles.emptyText}>
          {searchQuery ? 'No matching ingredients found.' : 'No ingredients in your kitchen. Tap + to add.'}
        </Text>
      }
    />
  );
};

const styles = StyleSheet.create({
  listPadding: {
    paddingHorizontal: 20,
    paddingBottom: 90,
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row', // Align content and delete button side-by-side
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardContent: {
    flex: 1, // Let text fill the remaining space on the left
  },
  itemName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  itemDetails: {
    fontSize: 14,
    color: '#666666',
  },
  deleteButton: {
    padding: 8,
    marginLeft: 10,
  },
  emptyText: {
    textAlign: 'center',
    color: '#8E8E93',
    fontSize: 15,
    marginTop: 40,
    paddingHorizontal: 20,
  },
});