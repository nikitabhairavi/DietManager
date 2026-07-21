import { AddIngredientModal } from '@/modals/AddIngredientModal';
import { AddRecipeModal } from '@/modals/AddRecipeModal';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { KitchenIngredients } from '../../components/kitchen/KitchenIngredients';
import { KitchenRecipes } from '../../components/kitchen/KitchenRecipes';

export default function MyKitchenScreen() {
  const [activeTab, setActiveTab] = useState<'ingredients' | 'recipes'>('ingredients');
  const [searchQuery, setSearchQuery] = useState('');
  const [isIngredientModalOpen, setIsIngredientModalOpen] = useState(false);
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);

  const handleFabPress = () => {
    if (activeTab === 'ingredients') {
      setIsIngredientModalOpen(true);
    } else {
      setIsRecipeModalOpen(true);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Title */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>My Kitchen</Text>
      </View>

      {/* Modern iOS Segmented Control */}
      <View style={styles.segmentedControlWrapper}>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'ingredients' && styles.activeTabButton]}
            onPress={() => {
              setActiveTab('ingredients');
              setSearchQuery('');
            }}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeTab === 'ingredients' && styles.activeTabText]}>
              Ingredients
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'recipes' && styles.activeTabButton]}
            onPress={() => {
              setActiveTab('recipes');
              setSearchQuery('');
            }}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeTab === 'recipes' && styles.activeTabText]}>
              Recipes
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Styled Search Bar with Clear Button */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color="#8E8E93" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={activeTab === 'ingredients' ? 'Search ingredients...' : 'Search recipes...'}
            placeholderTextColor="#8E8E93"
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing" // iOS native clear button
          />
          {/* Custom Clear fallback for Android / Cross-platform */}
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-circle" size={18} color="#C7C7CC" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* List Content Area */}
      <View style={styles.contentContainer}>
        {activeTab === 'ingredients' ? (
          <KitchenIngredients searchQuery={searchQuery} />
        ) : (
          <KitchenRecipes searchQuery={searchQuery} />
        )}
      </View>

      {/* Polished Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={handleFabPress}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Creation Modals */}
      <AddIngredientModal
        isVisible={isIngredientModalOpen}
        onClose={() => setIsIngredientModalOpen(false)}
      />

      <AddRecipeModal
        isVisible={isRecipeModalOpen}
        onClose={() => setIsRecipeModalOpen(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7', // Standard Apple grouping background
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1C1C1E',
    letterSpacing: -0.5,
  },
  segmentedControlWrapper: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#7676801F', // Translucent native gray tint
    borderRadius: 12,
    padding: 3,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
  },
  activeTabButton: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#636366',
  },
  activeTabText: {
    color: '#1C1C1E',
    fontWeight: '700',
  },
  searchWrapper: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7676801F',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1C1C1E',
    paddingVertical: 0,
  },
  contentContainer: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    backgroundColor: '#007AFF',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    // Soft floating shadow
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
});