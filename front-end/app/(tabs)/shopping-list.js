import React, { useState, useContext } from 'react';
import { StyleSheet, Text, View, TextInput, ActivityIndicator, FlatList, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { InventoryContext } from '../../context/InventoryContext';
import InventoryItem from '../../components/InventoryItem';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

export default function ShoppingListScreen() {
  const { items, isLoading, fetchItems, addItem, editItem, deleteItem } = useContext(InventoryContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  let shoppingItems = items.filter(item => item.inShoppingList);

  if (searchQuery.trim() !== '') {
    shoppingItems = shoppingItems.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  const handleQuickAdd = async () => {
    const cleanName = searchQuery.trim();
    if (!cleanName) return;

    setIsSubmitting(true);
    try {
      await addItem({
        name: cleanName,
        category: 'Pantry', 
        expiryDate: new Date().toISOString(), 
        quantity: 0, 
        inShoppingList: true 
      });
      setSearchQuery(''); 
    } catch (error) {
      Alert.alert('Error', 'Failed to add item to shopping list.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFindSupermarkets = async () => {
    setIsLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'We need your location to find nearby supermarkets.');
        setIsLocating(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      console.log('Successfully fetched coordinates:', location.coords);
      
      Alert.alert(
        'Location Found!', 
        `Latitude: ${location.coords.latitude}\nLongitude: ${location.coords.longitude}\n\nReady for the Map!`
      );
      
    } catch (error) {
      Alert.alert('Error', 'Could not fetch your location. Please ensure GPS is enabled.');
    } finally {
      setIsLocating(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Shopping List</Text>
      </View>

      <TouchableOpacity 
        style={styles.mapButton} 
        onPress={handleFindSupermarkets}
        disabled={isLocating}
        activeOpacity={0.8}
      >
        {isLocating ? (
          <ActivityIndicator color="#ffffff" size="small" />
        ) : (
          <>
            <Ionicons name="location" size={20} color="#ffffff" style={styles.mapIcon} />
            <Text style={styles.mapButtonText}>Find Supermarkets Near Me</Text>
          </>
        )}
      </TouchableOpacity>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#8E8E93" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search or add items..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={shoppingItems}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <InventoryItem
            item={item}
            onEdit={editItem}
            onDelete={deleteItem}
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={isLoading && shoppingItems.length > 0}
            onRefresh={() => fetchItems()}
            tintColor="#007AFF"
          />
        }
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator size="small" color="#007AFF" style={{ marginVertical: 20 }} />
          ) : searchQuery.trim() !== '' ? (
            <TouchableOpacity 
              style={styles.quickAddCard} 
              onPress={handleQuickAdd}
              disabled={isSubmitting}
              activeOpacity={0.7}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#007AFF" />
              ) : (
                <>
                  <View style={styles.quickAddIconContainer}>
                    <Ionicons name="add" size={24} color="#ffffff" />
                  </View>
                  <Text style={styles.quickAddText}>
                    Add "<Text style={{ fontWeight: 'bold' }}>{searchQuery}</Text>" to list
                  </Text>
                </>
              )}
            </TouchableOpacity>
          ) : (
            <Text style={styles.emptyText}>Nothing to buy! You're fully stocked.</Text>
          )
        }
        contentContainerStyle={{ paddingBottom: 100 }} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F2F2F7', paddingTop: 60 },
  header: { marginBottom: 16 },
  title: { fontSize: 34, fontWeight: 'bold', color: '#1C1C1E' },
  
  mapButton: {
    flexDirection: 'row',
    backgroundColor: '#34C759',
    paddingVertical: 14,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#34C759',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  mapIcon: { marginRight: 8 },
  mapButtonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },

  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', borderRadius: 12, paddingHorizontal: 12, height: 48, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 16, color: '#1C1C1E', height: '100%' },
  emptyText: { textAlign: 'center', color: '#8E8E93', marginVertical: 30, fontStyle: 'italic', fontSize: 15 },
  quickAddCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', padding: 16, borderRadius: 16, marginVertical: 12, shadowColor: '#007AFF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4, borderWidth: 1, borderColor: '#E5F1FF' },
  quickAddIconContainer: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#007AFF', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  quickAddText: { color: '#1C1C1E', fontSize: 16, flex: 1 }
});