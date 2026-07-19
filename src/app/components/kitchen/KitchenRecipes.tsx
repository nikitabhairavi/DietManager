import { useRecipesStore } from '@/app/data/dataStores/useRecipeStore';
import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

interface KitchenRecipesProps {
  searchQuery: string;
}

export const KitchenRecipes: React.FC<KitchenRecipesProps> = ({ searchQuery }) => {
  const recipes = useRecipesStore((state) => state.recipes);

  // Filter list matching lowercase search strings
  const filteredRecipes = recipes.filter((rec) =>
    rec.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <FlatList
      data={filteredRecipes}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listPadding}
      renderItem={({ item }) => (
        <View style={styles.itemCard}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemDetails}>
            Totals: {item.totalCalories} kcal | P: {item.totalProtein}g | F: {item.totalFiber}g
          </Text>
        </View>
      )}
      ListEmptyComponent={
        <Text style={styles.emptyText}>
          {searchQuery ? 'No matching recipes found.' : 'No recipes created yet. Tap + to build one.'}
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