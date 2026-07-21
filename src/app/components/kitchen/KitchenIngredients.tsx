import { useIngredientsStore } from '@/data/dataStores/ingredientsStore/useIngredientStore';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface KitchenIngredientsProps {
  searchQuery: string;
}

export const KitchenIngredients: React.FC<KitchenIngredientsProps> = ({ searchQuery }) => {
  // 1. ALL HOOKS DECLARED FIRST
  const ingredients = useIngredientsStore((state) => state.ingredients);
  const isInitialLoading = useIngredientsStore((state) => state.isInitialLoading);
  const isRefreshing = useIngredientsStore((state) => state.isRefreshing);
  const loadInitialIngredients = useIngredientsStore((state) => state.loadInitialIngredients);
  const fetchIngredients = useIngredientsStore((state) => state.fetchIngredients);
  const removeIngredient = useIngredientsStore((state) => state.deleteIngredient);

  useEffect(() => {
    loadInitialIngredients();
  }, [loadInitialIngredients]);

  // 2. EARLY RETURNS AFTER ALL HOOKS
  if (isInitialLoading) {
    return (
      <View style={[styles.wrapper, styles.centerContent]}>
        <ActivityIndicator size="large" color="#000000" />
      </View>
    );
  }

  // 3. COMPUTED VALUES
  const filteredIngredients = ingredients.filter((ing) => {
    if (ing?.name) {
      return ing.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return false;
  });

  return (
    <View style={styles.wrapper}>
      <FlatList
        data={filteredIngredients}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listPadding}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={fetchIngredients} />
        }
        renderItem={({ item }) => (
          <View style={styles.itemCard}>
            <View style={styles.cardContent}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemDetails}>
                Per unit: {item.quantityPerUnit} | {item.caloriesPerUnit} kcal | P: {item.proteinPerUnit}g | F: {item.fiberPerUnit}g
              </Text>
            </View>

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
            {searchQuery
              ? 'No matching ingredients found.'
              : 'No ingredients in your kitchen. Tap + to add.'}
          </Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  listPadding: {
    paddingHorizontal: 20,
    paddingBottom: 90,
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardContent: {
    flex: 1,
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