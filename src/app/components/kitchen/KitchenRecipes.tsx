import { RecipeDetailModal } from '@/modals/RecipeDetailsModal';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Recipe, useRecipeStore } from '../../../data/dataStores/recipeStore/useRecipeStore';

interface KitchenRecipesProps {
  searchQuery: string;
}

export const KitchenRecipes: React.FC<KitchenRecipesProps> = ({ searchQuery }) => {
  const recipes = useRecipeStore((state) => state.recipes);
  const removeRecipe = useRecipeStore((state) => state.deleteRecipe);

  // States to handle visibility and the context of the active model sheet
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

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

  return (
    <View style={styles.wrapper}>
      <FlatList
        data={filteredRecipes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listPadding}
        renderItem={({ item }) => (
          /* Entire item card is now an interactive trigger */
          <TouchableOpacity
            style={styles.itemCard}
            activeOpacity={0.7}
            onPress={() => handleOpenDetails(item)}
          >
            <View style={styles.cardContent}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemDetails}>
                Totals: {item.totalCalories} kcal | P: {item.totalProtein}g | F: {item.totalFiber}g
              </Text>
            </View>

            {/* Trash button stops bubble propagation to ensure deletion doesn't fire modal open */}
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={(e) => {
                e.stopPropagation();
                removeRecipe(item.id);
              }}
              activeOpacity={0.6}
            >
              <Ionicons name="trash-outline" size={20} color="#FF3B30" />
            </TouchableOpacity>
          </TouchableOpacity>
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