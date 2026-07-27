import { useRecipeStore } from '@/data/dataStores/recipeStore/useRecipeStore';
import { EditRecipeModal } from '@/modals/EditRecipeModal';
import { Recipe } from '@/types/RecipeTypes';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { RecipeCard } from './RecipeCard';

interface KitchenRecipesProps {
  searchQuery: string;
}

export const KitchenRecipes: React.FC<KitchenRecipesProps> = ({ searchQuery }) => {
  const recipes = useRecipeStore((state) => state.recipes);
  const isInitialLoading = useRecipeStore((state) => state.isInitialLoading);
  const isRefreshing = useRecipeStore((state) => state.isRefreshing);
  const loadInitialRecipes = useRecipeStore((state) => state.loadInitialRecipes);
  const fetchRecipes = useRecipeStore((state) => state.fetchRecipes);
  const removeRecipe = useRecipeStore((state) => state.deleteRecipe);

  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  useEffect(() => {
    loadInitialRecipes();
  }, [loadInitialRecipes]);

  if (isInitialLoading) {
    return (
      <View style={[styles.wrapper, styles.centerContent]}>
        <ActivityIndicator size="large" color="#000000" />
      </View>
    );
  }

  const filteredRecipes = recipes.filter((rec) =>
    rec.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenEditModal = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setIsEditModalVisible(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalVisible(false);
    setSelectedRecipe(null);
  };

  return (
    <View style={styles.wrapper}>
      <FlatList
        data={filteredRecipes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listPadding}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={fetchRecipes} />
        }
        renderItem={({ item }) => (
          <RecipeCard
            item={item}
            onPress={handleOpenEditModal}
            onDelete={removeRecipe}
          />
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {searchQuery ? 'No matching recipes found.' : 'No recipes created yet. Tap + to build one.'}
          </Text>
        }
      />

      {/* Separate Dedicated Edit Recipe Modal */}
      <EditRecipeModal
        recipeToEdit={selectedRecipe}
        isVisible={isEditModalVisible}
        onClose={handleCloseEditModal}
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
    paddingBottom: 100,
  },
  emptyText: {
    textAlign: 'center',
    color: '#8E8E93',
    fontSize: 15,
    marginTop: 40,
    paddingHorizontal: 20,
  },
});