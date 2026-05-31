import React, { useState, useContext, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, ActivityIndicator, FlatList, RefreshControl, TouchableOpacity, Alert, Modal } from 'react-native';
import { InventoryContext } from '../../context/InventoryContext';
import InventoryItem from '../../components/InventoryItem';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import axios from 'axios';
import { WebView } from 'react-native-webview';

export default function ShoppingListScreen() {
  const { items, isLoading, fetchItems, addItem, editItem, deleteItem } = useContext(InventoryContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const [isMapVisible, setIsMapVisible] = useState(false);
  const [isFetchingMap, setIsFetchingMap] = useState(false);
  const [htmlContent, setHtmlContent] = useState('');

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

  const openMap = async () => {
    setIsFetchingMap(true);
    setIsMapVisible(true);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location is required.');
        setIsMapVisible(false);
        setIsFetchingMap(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const userLat = loc.coords.latitude;
      const userLon = loc.coords.longitude;

      const query = `[out:json];nwr["shop"="supermarket"](around:5000,${userLat},${userLon});out center;`;
      const response = await axios.post(
        'https://overpass-api.de/api/interpreter',
        `data=${encodeURIComponent(query)}`,
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'HomiApp/1.0'
          },
          timeout: 10000
        }
      );

      if (response.data && response.data.elements) {
        const supermarkets = response.data.elements;
        
        const mapHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
            <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
            <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
            <style>
              body { padding: 0; margin: 0; background-color: #F2F2F7; }
              html, body, #map { height: 100%; width: 100%; }
              
              /* Homi-style Popups */
              .leaflet-popup-content-wrapper { 
                border-radius: 16px; 
                padding: 4px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
              }
              .leaflet-popup-content { 
                font-family: -apple-system, system-ui, sans-serif; 
                margin: 12px; 
              }
              .store-title { font-weight: 700; font-size: 16px; color: #1C1C1E; margin-bottom: 2px; }
              .store-brand { color: #007AFF; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
              
              /* Hide Leaflet Attribution for cleaner look */
              .leaflet-control-attribution { display: none; }
            </style>
          </head>
          <body>
            <div id="map"></div>
            <script>
              var map = L.map('map', { zoomControl: false }).setView([${userLat}, ${userLon}], 14);
              
              L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

              var userIcon = L.icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
              });
              
              L.marker([${userLat}, ${userLon}], {icon: userIcon}).addTo(map)
                .bindPopup('<div class="store-title">You</div>').openPopup();

              const stores = ${JSON.stringify(supermarkets)};
              stores.forEach(store => {
                const lat = store.lat || (store.center && store.center.lat);
                const lon = store.lon || (store.center && store.center.lon);

                if(lat && lon) {
                  const name = store.tags.name || 'Supermarket';
                  const brand = store.tags.brand || 'Grocery';
                  const popupHtml = '<div class="store-brand">' + brand + '</div><div class="store-title">' + name + '</div>';
                  L.marker([lat, lon]).addTo(map).bindPopup(popupHtml);
                }
              });
            </script>
          </body>
          </html>
        `;
        setHtmlContent(mapHtml);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load map data.');
      setIsMapVisible(false);
    } finally {
      setIsFetchingMap(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Shopping List</Text>
          <Text style={styles.subtitle}>{shoppingItems.length} items needed</Text>
        </View>
        <TouchableOpacity style={styles.mapButton} onPress={openMap} activeOpacity={0.8}>
          <Ionicons name="map" size={22} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* SEARCH */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#8E8E93" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search or add items..."
          placeholderTextColor="#8E8E93"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={shoppingItems}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <InventoryItem item={item} onEdit={editItem} onDelete={deleteItem} />
        )}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchItems} tintColor="#007AFF" />}
        ListEmptyComponent={
          !isLoading && searchQuery.trim() !== '' ? (
            <TouchableOpacity style={styles.quickAddCard} onPress={handleQuickAdd}>
              <View style={styles.quickAddIconContainer}><Ionicons name="add" size={24} color="#ffffff" /></View>
              <Text style={styles.quickAddText}>Add "<Text style={{ fontWeight: 'bold' }}>{searchQuery}</Text>"</Text>
            </TouchableOpacity>
          ) : !isLoading && <Text style={styles.emptyText}>You're fully stocked!</Text>
        }
        contentContainerStyle={{ paddingBottom: 100 }} 
      />

      <Modal visible={isMapVisible} animationType="slide" transparent={true} onRequestClose={() => setIsMapVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            
            <View style={styles.sheetHandle} />

            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Nearby Stores</Text>
                <Text style={styles.modalSubtitle}>OpenStreetMap Data</Text>
              </View>
              <TouchableOpacity style={styles.closeCircle} onPress={() => setIsMapVisible(false)}>
                <Ionicons name="close" size={24} color="#8E8E93" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.mapContainer}>
              {isFetchingMap ? (
                <View style={styles.center}>
                  <ActivityIndicator size="large" color="#007AFF" />
                  <Text style={styles.loadingText}>Fetching stores...</Text>
                </View>
              ) : (
                <WebView 
                  originWhitelist={['*']}
                  source={{ html: htmlContent }}
                  style={styles.webview}
                />
              )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F2F2F7', paddingTop: 60 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 34, fontWeight: 'bold', color: '#1C1C1E' },
  subtitle: { fontSize: 15, color: '#8E8E93', fontWeight: '500' },
  mapButton: { width: 48, height: 48, backgroundColor: '#007AFF', borderRadius: 24, justifyContent: 'center', alignItems: 'center', shadowColor: '#007AFF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', borderRadius: 14, paddingHorizontal: 12, height: 50, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 17, color: '#1C1C1E' },
  emptyText: { textAlign: 'center', color: '#8E8E93', marginTop: 40, fontStyle: 'italic' },
  quickAddCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', padding: 16, borderRadius: 16, marginTop: 10, borderWidth: 1, borderColor: '#E5F1FF' },
  quickAddIconContainer: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#007AFF', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  quickAddText: { color: '#1C1C1E', fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { 
    backgroundColor: '#F2F2F7', 
    height: '85%', 
    borderTopLeftRadius: 30, 
    borderTopRightRadius: 30, 
    overflow: 'hidden' 
  },
  sheetHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#C7C7CC',
    borderRadius: 2.5,
    alignSelf: 'center',
    marginTop: 10
  },
  modalHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 24, 
    paddingVertical: 20,
    backgroundColor: '#F2F2F7'
  },
  modalTitle: { fontSize: 24, fontWeight: 'bold', color: '#1C1C1E' },
  modalSubtitle: { fontSize: 13, color: '#8E8E93', fontWeight: '600', textTransform: 'uppercase' },
  closeCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#E5E5EA', justifyContent: 'center', alignItems: 'center' },
  mapContainer: { flex: 1, backgroundColor: '#ffffff', marginHorizontal: 15, marginBottom: 30, borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: '#E5E5EA' },
  webview: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#8E8E93', fontWeight: '600' }
});