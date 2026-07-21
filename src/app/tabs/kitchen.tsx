import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { KitchenIngredients } from '../../components/kitchen/KitchenIngredients';
import { KitchenRecipes } from '../../components/kitchen/KitchenRecipes';
import { AddIngredientModal } from '../../modals/AddIngredientModal';

// Modular Child Target Imports


export default function MyKitchenScreen() {
  const [activeTab, setActiveTab] = useState<'ingredients' | 'recipes'>('ingredients');
  const [searchQuery, setSearchQuery] = useState('');
  const [isIngredientModalOpen, setIsIngredientModalOpen] = useState(false);

  const handleFabPress = () => {
    if (activeTab === 'ingredients') {
      setIsIngredientModalOpen(true);
    } else {
      console.log('Open Recipe flow modal here');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Title */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>My Kitchen</Text>
      </View>

      {/* Segmented Tabs */}
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

      {/* Search Bar Container */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#8E8E93" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={activeTab === 'ingredients' ? "Search ingredients..." : "Search recipes..."}
          placeholderTextColor="#8E8E93"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Dynamic Tab Switchboard Context */}
      <View style={styles.contentContainer}>
        {activeTab === 'ingredients' ? (
          <KitchenIngredients searchQuery={searchQuery} />
        ) : (
          <KitchenRecipes searchQuery={searchQuery} />
        )}
      </View>

      {/* Floating Action Button (+) */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.8}
        onPress={handleFabPress}
      >
        <Ionicons name="add" size={30} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Global Add Overlays */}
      <AddIngredientModal
        isVisible={isIngredientModalOpen}
        onClose={() => setIsIngredientModalOpen(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#000000',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#E5E5EA',
    borderRadius: 8,
    marginHorizontal: 20,
    marginVertical: 10,
    padding: 2,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  activeTabButton: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 1,
    elevation: 1,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#8E8E93',
  },
  activeTabText: {
    color: '#000000',
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5E5EA',
    borderRadius: 10,
    marginHorizontal: 20,
    marginVertical: 10,
    paddingHorizontal: 10,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 17,
    color: '#000000',
  },
  contentContainer: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    backgroundColor: '#007AFF',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});