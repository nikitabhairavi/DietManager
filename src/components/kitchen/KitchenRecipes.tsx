import { useRecipeStore } from '@/data/dataStores/recipeStore/useRecipeStore';
import { RecipeDetailModal } from '@/modals/RecipeDetailModal';
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
  // 1. ALL HOOKS DECLARED AT TOP LEVEL
  const recipes = useRecipeStore((state) => state.recipes);
  const isInitialLoading = useRecipeStore((state) => state.isInitialLoading);
  const isRefreshing = useRecipeStore((state) => state.isRefreshing);
  const loadInitialRecipes = useRecipeStore((state) => state.loadInitialRecipes);
  const fetchRecipes = useRecipeStore((state) => state.fetchRecipes);
  const removeRecipe = useRecipeStore((state) => state.deleteRecipe);

  // States to handle visibility and the context of the active modal sheet
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    loadInitialRecipes();
  }, [loadInitialRecipes]);

  // 2. EARLY RETURNS / CONDITIONAL RENDERING GO AFTER ALL HOOKS
  if (isInitialLoading) {
    return (
      <View style={[styles.wrapper, styles.centerContent]}>
        <ActivityIndicator size="large" color="#000000" />
      </View>
    );
  }

  // 3. EVENT HANDLERS & COMPUTED VALUES
  const filteredRecipes = recipes.filter((rec) =>
    rec.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenDetails = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedRecipe(null);
  };

  // 4. MAIN JSX RENDER WITH REFRESH CONTROL
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
            onPress={handleOpenDetails}
            onDelete={removeRecipe}
          />
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {searchQuery ? 'No matching recipes found.' : 'No recipes created yet. Tap + to build one.'}
          </Text>
        }
      />

      {/* Embedded Portal Layer for Recipe Specific Updates */}
      <RecipeDetailModal
        recipe={selectedRecipe}
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