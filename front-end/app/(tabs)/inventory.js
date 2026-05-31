import React, { useState, useContext, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, ActivityIndicator, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { InventoryContext } from '../../context/InventoryContext';
import InventoryItem from '../../components/InventoryItem';
import { getSyncQueue } from '../../utils/syncQueue';
import { Ionicons } from '@expo/vector-icons';

export default function InventoryScreen() {
  const { items, isLoading, fetchItems, editItem, deleteItem } = useContext(InventoryContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [pendingSyncs, setPendingSyncs] = useState(0);
  
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' (soonest) or 'desc' (furthest)
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    const checkQueue = async () => {
      const queue = await getSyncQueue();
      setPendingSyncs(queue.length);
    };
    checkQueue();
  }, [items]);

  let inventoryItems = items.filter(item => !item.inShoppingList);

  if (activeCategory !== 'All') {
    inventoryItems = inventoryItems.filter(item => item.category === activeCategory);
  }

  if (searchQuery.trim() !== '') {
    inventoryItems = inventoryItems.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  inventoryItems.sort((a, b) => {
    const dateA = new Date(a.expiryDate).getTime();
    const dateB = new Date(b.expiryDate).getTime();
    
    if (sortOrder === 'asc') {
      return dateA - dateB; 
    } else {
      return dateB - dateA; 
    }
  });

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  return (
    <View style={styles.container}>
      {pendingSyncs > 0 && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>
            Offline Mode: {pendingSyncs} action{pendingSyncs > 1 ? 's' : ''} waiting to sync.
          </Text>
        </View>
      )}

      <View style={styles.header}>
        <Text style={styles.title}>Inventory</Text>
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#8E8E93" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search items or storage..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={styles.sortButton} onPress={toggleSortOrder}>
          <Ionicons 
            name={sortOrder === 'asc' ? 'arrow-down-outline' : 'arrow-up-outline'} 
            size={22} 
            color="#ffffff" 
          />
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        {['All', 'Fridge', 'Pantry', 'Freezer'].map((cat) => (
          <TouchableOpacity 
            key={cat} 
            style={[styles.filterBtn, activeCategory === cat && styles.activeFilterBtn]} 
            onPress={() => setActiveCategory(cat)}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterText, activeCategory === cat && styles.activeFilterText]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={inventoryItems}
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
            refreshing={isLoading && inventoryItems.length > 0}
            onRefresh={() => fetchItems()}
            tintColor="#007AFF"
          />
        }
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator size="small" color="#007AFF" style={{ marginVertical: 20 }} />
          ) : (
            <Text style={styles.emptyText}>No items found in this category.</Text>
          )
        }
        contentContainerStyle={{ paddingBottom: 100 }} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F2F2F7', paddingTop: 60 },
  offlineBanner: { backgroundColor: '#FFF4CE', padding: 10, borderRadius: 8, marginBottom: 16, borderWidth: 1, borderColor: '#FFD60A' },
  offlineText: { color: '#8A6D00', fontSize: 14, fontWeight: '600', textAlign: 'center' },
  header: { marginBottom: 16 },
  title: { fontSize: 34, fontWeight: 'bold', color: '#1C1C1E' },
  searchRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  searchContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', borderRadius: 12, paddingHorizontal: 12, height: 44, marginRight: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 16, color: '#1C1C1E', height: '100%' },
  sortButton: { width: 44, height: 44, backgroundColor: '#007AFF', borderRadius: 12, justifyContent: 'center', alignItems: 'center', shadowColor: '#007AFF', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 4 },
  filterContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  filterBtn: { flex: 1, paddingVertical: 8, marginHorizontal: 4, borderRadius: 20, backgroundColor: '#ffffff', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  activeFilterBtn: { backgroundColor: '#007AFF' },
  filterText: { color: '#8E8E93', fontWeight: '600', fontSize: 13 },
  activeFilterText: { color: '#ffffff', fontWeight: 'bold' },
  emptyText: { textAlign: 'center', color: '#8E8E93', marginVertical: 20, fontStyle: 'italic' }
});