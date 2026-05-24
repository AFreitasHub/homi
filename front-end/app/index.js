import React, { useState, useContext, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ActivityIndicator, FlatList, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { AuthContext } from '../context/AuthContext';
import { InventoryContext } from '../context/InventoryContext';
import InventoryItem from '../components/InventoryItem';
import api from '../api';

export default function HomeScreen() {
  const { user, logout } = useContext(AuthContext);
  const { items, isLoading, fetchItems, addItem, editItem, deleteItem } = useContext(InventoryContext);
  const [household, setHousehold] = useState(null);
  const [isLoadingHousehold, setIsLoadingHousehold] = useState(true);
  
  // household form states
  const [householdName, setHouseholdName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  // add item form states
  const [itemName, setItemName] = useState('');
  const [itemCategory, setItemCategory] = useState('Fridge'); // default
  const [expiryDays, setExpiryDays] = useState(''); 
  const [itemQuantity, setItemQuantity] = useState('1');
  const [searchQuery, setSearchQuery] = useState('');

  const checkUserHousehold = async () => {
    try {
      const response = await api.get('/households');
      setHousehold(response.data);
      if (response.data) {
        await fetchItems();
      }
    } catch (error) {
      if (error.response?.status !== 404) {
        Alert.alert('Server Error', 'Failed to retrieve household data.');
      }
    } finally {
      setIsLoadingHousehold(false);
    }
  };

  useEffect(() => {
    checkUserHousehold();
  }, [fetchItems]);

  useEffect(() => {
    if (household) {
      const delayDebounceFn = setTimeout(() => {
        fetchItems({ search: searchQuery });
      }, 300); 

      return () => clearTimeout(delayDebounceFn);
    }
  }, [searchQuery, fetchItems]);

  const handleCreateHousehold = async () => {
    if (!householdName.trim()) return Alert.alert('Error', 'Household name cannot be blank.');
    setIsProcessingAction(true);
    try {
      await api.post('/households', { name: householdName });
      await checkUserHousehold();
    } catch (error) {
      Alert.alert('Failed', error.response?.data?.message || 'Server error.');
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleJoinHousehold = async () => {
    if (!inviteCode.trim()) return Alert.alert('Error', 'Please enter an invite code.');
    setIsProcessingAction(true);
    try {
      await api.post('/households/join', { inviteCode });
      await checkUserHousehold();
    } catch (error) {
      Alert.alert('Failed', error.response?.data?.message || 'Invalid code.');
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleAddItem = async () => {
    if (!itemName.trim() || !expiryDays.trim()) {
      Alert.alert('Validation Error', 'Item name and expiry days are required.');
      return;
    }

    const days = parseInt(expiryDays, 10);
    if (isNaN(days) || days < 0) {
      Alert.alert('Validation Error', 'Expiry days must be a positive number.');
      return;
    }

    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + days);

    try {
      await addItem({
        name: itemName,
        category: itemCategory,
        expiryDate: targetDate.toISOString(),
        quantity: parseInt(itemQuantity, 10) || 1,
      });
      
      Alert.alert('Success', `${itemName} added to ${itemCategory}!`);
      // reset form
      setItemName('');
      setExpiryDays('');
      setItemQuantity('1');
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to add item.');
    }
  };

  if (isLoadingHousehold) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (household) {
    return (
      <View style={styles.container}>
        <Text style={styles.headerTitle}>Homi Inventory</Text>
        <Text style={styles.subtitle}>Managing {household.name} (Code: {household.inviteCode})</Text>

        {/* add item form */}
        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Add Food Item</Text>
          <TextInput
            style={styles.input}
            placeholder="Item Name (e.g., Milk, Apples)"
            value={itemName}
            onChangeText={setItemName}
          />
          <View style={styles.rowInputs}>
            <TextInput
              style={[styles.input, { flex: 1, marginRight: 8 }]}
              placeholder="Expires in (days)"
              value={expiryDays}
              onChangeText={setExpiryDays}
              keyboardType="number-pad"
            />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Qty"
              value={itemQuantity}
              onChangeText={setItemQuantity}
              keyboardType="number-pad"
            />
          </View>
          
          {/* pick category */}
          <View style={styles.segmentContainer}>
            {['Fridge', 'Freezer', 'Pantry'].map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.segmentButton, itemCategory === cat && styles.segmentButtonActive]}
                onPress={() => setItemCategory(cat)}
              >
                <Text style={[styles.segmentText, itemCategory === cat && styles.segmentTextActive]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.addButton} onPress={handleAddItem}>
            <Text style={styles.buttonText}>Add to Inventory</Text>
          </TouchableOpacity>
        </View>

        {/* search bar */}
        <TextInput
          style={styles.searchInput}
          placeholder="Search items by name..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        {/* live inventory list */}
        {isLoading ? (
          <ActivityIndicator size="small" color="#007AFF" style={{ marginVertical: 12 }} />
        ) : (
          <FlatList
            data={items}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <InventoryItem
                item={item}
                onEdit={editItem}
                onDelete={deleteItem}
              />
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No food items tracked yet.</Text>
            }
          />
        )}

        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutText}>Log Out Account</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.centerScroll}>
      <Text style={styles.title}>Setup Household</Text>
      <Text style={styles.subtitle}>To prevent food waste, create a household or join an existing group channel.</Text>

      <View style={styles.actionCard}>
        <Text style={styles.cardHeading}>Start a New Household</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Our Apartment, Kitchen 1"
          value={householdName}
          onChangeText={setHouseholdName}
          editable={!isProcessingAction}
        />
        <TouchableOpacity style={[styles.button, isProcessingAction && styles.buttonDisabled]} onPress={handleCreateHousehold} disabled={isProcessingAction}>
          <Text style={styles.buttonText}>Create Household</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.actionCard}>
        <Text style={styles.cardHeading}>Join via Code String</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., A1B2C3"
          value={inviteCode}
          onChangeText={setInviteCode}
          autoCapitalize="characters"
          editable={!isProcessingAction}
        />
        <TouchableOpacity style={[styles.button, styles.joinButton, isProcessingAction && styles.buttonDisabled]} onPress={handleJoinHousehold} disabled={isProcessingAction}>
          <Text style={styles.buttonText}>Join Group</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Log Out Account</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#ffffff', paddingTop: 40 },
  centerScroll: { padding: 24, flexGrow: 1, justifyContent: 'center', backgroundColor: '#ffffff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff' },
  headerTitle: { fontSize: 26, fontWeight: 'bold', color: '#1C1C1E' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1C1C1E', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#666666', marginBottom: 16 },
  formCard: { backgroundColor: '#F2F2F7', padding: 14, borderRadius: 12, marginBottom: 16 },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', color: '#1C1C1E', marginBottom: 8 },
  actionCard: { backgroundColor: '#F2F2F7', padding: 16, borderRadius: 12, marginBottom: 16, width: '100%' },
  cardHeading: { fontSize: 16, fontWeight: 'bold', color: '#1C1C1E', marginBottom: 12 },
  input: { height: 40, borderColor: '#E5E5EA', borderWidth: 1, borderRadius: 6, paddingHorizontal: 10, marginBottom: 8, backgroundColor: '#ffffff', fontSize: 15 },
  rowInputs: { flexDirection: 'row', marginBottom: 8 },
  segmentContainer: { flexDirection: 'row', backgroundColor: '#E5E5EA', borderRadius: 6, padding: 2, marginBottom: 10 },
  segmentButton: { flex: 1, paddingVertical: 6, alignItems: 'center', borderRadius: 4 },
  segmentButtonActive: { backgroundColor: '#ffffff' },
  segmentText: { fontSize: 13, color: '#666666', fontWeight: '500' },
  segmentTextActive: { color: '#007AFF', fontWeight: 'bold' },
  addButton: { height: 38, backgroundColor: '#007AFF', justifyContent: 'center', alignItems: 'center', borderRadius: 6 },
  button: { height: 40, backgroundColor: '#007AFF', justifyContent: 'center', alignItems: 'center', borderRadius: 6 },
  joinButton: { backgroundColor: '#34C759' },
  buttonDisabled: { backgroundColor: '#A3D1FF' },
  buttonText: { color: '#ffffff', fontSize: 15, fontWeight: 'bold' },
  searchInput: { height: 38, borderColor: '#E5E5EA', borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, marginBottom: 12, backgroundColor: '#F2F2F7', fontSize: 14 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#E5E5EA' },
  itemNameText: { fontSize: 15, fontWeight: '600', color: '#1C1C1E' },
  itemMetaText: { fontSize: 12, color: '#8E8E93', marginTop: 2 },
  badge: { backgroundColor: '#E5F1FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  badgeExpired: { backgroundColor: '#FFEBEA' },
  badgeText: { fontSize: 11, color: '#007AFF', fontWeight: '600' },
  emptyText: { textAlign: 'center', color: '#8E8E93', marginVertical: 20, fontStyle: 'italic' },
  logoutButton: { marginTop: 16, alignSelf: 'center', padding: 8 },
  logoutText: { color: '#FF3B30', fontSize: 14, fontWeight: '600' }
});