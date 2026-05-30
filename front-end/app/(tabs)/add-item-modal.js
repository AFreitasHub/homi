import React, { useState, useContext } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { InventoryContext } from '../../context/InventoryContext';

export default function AddItemScreen() {
  const router = useRouter();
  const { addItem } = useContext(InventoryContext);

  // form states
  const [itemName, setItemName] = useState('');
  const [itemCategory, setItemCategory] = useState('Fridge'); 
  const [expiryDays, setExpiryDays] = useState(''); 
  const [itemQuantity, setItemQuantity] = useState('1');

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
        inShoppingList: false // Explicitly state this goes to the inventory
      });
      
      // reset form
      setItemName('');
      setExpiryDays('');
      setItemQuantity('1');
      setItemCategory('Fridge');

      // send the user back to the inventory
      router.push('/(tabs)/inventory');
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to add item.');
    }
  };

  const handleCancel = () => {
    router.push('/(tabs)/inventory');
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>New Item</Text>
          <Text style={styles.subtitle}>What are we adding to the kitchen?</Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.label}>Item Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Milk, Apples, Bread"
            value={itemName}
            onChangeText={setItemName}
            autoFocus
          />

          <View style={styles.rowInputs}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.label}>Expires in (days)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 7"
                value={expiryDays}
                onChangeText={setExpiryDays}
                keyboardType="number-pad"
              />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.label}>Quantity</Text>
              <TextInput
                style={styles.input}
                placeholder="Qty"
                value={itemQuantity}
                onChangeText={setItemQuantity}
                keyboardType="number-pad"
              />
            </View>
          </View>
          
          <Text style={styles.label}>Storage Category</Text>
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
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.addButton} onPress={handleAddItem}>
            <Text style={styles.addButtonText}>Save Item</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, backgroundColor: '#ffffff', paddingTop: 60, paddingBottom: 120 },
  header: { marginBottom: 24 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#1C1C1E' },
  subtitle: { fontSize: 16, color: '#8E8E93', marginTop: 4 },
  formCard: { marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '600', color: '#1C1C1E', marginBottom: 8, marginTop: 12 },
  input: { height: 48, borderColor: '#E5E5EA', borderWidth: 1, borderRadius: 10, paddingHorizontal: 16, backgroundColor: '#F2F2F7', fontSize: 16 },
  rowInputs: { flexDirection: 'row', justifyContent: 'space-between' },
  segmentContainer: { flexDirection: 'row', backgroundColor: '#E5E5EA', borderRadius: 10, padding: 4, marginTop: 4 },
  segmentButton: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  segmentButtonActive: { backgroundColor: '#ffffff', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  segmentText: { fontSize: 14, color: '#8E8E93', fontWeight: '600' },
  segmentTextActive: { color: '#007AFF', fontWeight: 'bold' },
  actionButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  cancelButton: { flex: 1, height: 50, backgroundColor: '#F2F2F7', justifyContent: 'center', alignItems: 'center', borderRadius: 12, marginRight: 8 },
  cancelButtonText: { color: '#FF3B30', fontSize: 16, fontWeight: 'bold' },
  addButton: { flex: 2, height: 50, backgroundColor: '#007AFF', justifyContent: 'center', alignItems: 'center', borderRadius: 12, marginLeft: 8 },
  addButtonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
});