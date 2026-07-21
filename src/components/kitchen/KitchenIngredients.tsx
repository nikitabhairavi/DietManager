import { Ingredient, useIngredientsStore } from '@/data/dataStores/ingredientsStore/useIngredientStore';
import { IngredientDetailsModal } from '@/modals/IngredientDetailsModal';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { IngredientCard } from './IngredientCard';

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

  // States to handle visibility and context of active ingredient modal
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

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

  // 3. EVENT HANDLERS & COMPUTED VALUES
  const filteredIngredients = ingredients.filter((ing) => {
    if (ing?.name) {
      return ing.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return false;
  });

  const handleOpenDetails = (ingredient: Ingredient) => {
    setSelectedIngredient(ingredient);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedIngredient(null);
  };

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
          <IngredientCard
            item={item}
            onPress={handleOpenDetails}
            onDelete={removeIngredient}
          />
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {searchQuery
              ? 'No matching ingredients found.'
              : 'No ingredients in your kitchen. Tap + to add.'}
          </Text>
        }
      />

      {/* Separate Modal Layer for Ingredient Specific Updates */}
      <IngredientDetailsModal
        ingredient={selectedIngredient}
        isVisible={isModalVisible}
        onClose={handleCloseModal}
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
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 100, // Extra clearance for floating elements
  },
  emptyText: {
    textAlign: 'center',
    color: '#8E8E93',
    fontSize: 15,
    marginTop: 40,
    paddingHorizontal: 20,
  },
});