import { useIngredientsStore } from '@/app/data/dataStores/useIngredientStore';
import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

interface KitchenIngredientsProps {
  searchQuery: string;
}

export const KitchenIngredients: React.FC<KitchenIngredientsProps> = ({ searchQuery }) => {
  const ingredients = useIngredientsStore((state) => state.ingredients);

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
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemDetails}>
            Per unit: {item.quantityPerUnit} | {item.caloriesPerUnit} kcal | P: {item.proteinPerUnit}g | F: {item.fiberPerUnit}g
          </Text>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
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
  emptyText: {
    textAlign: 'center',
    color: '#8E8E93',
    fontSize: 15,
    marginTop: 40,
    paddingHorizontal: 20,
  },
});