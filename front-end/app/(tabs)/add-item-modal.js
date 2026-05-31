import React, { useState, useContext } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { InventoryContext } from '../../context/InventoryContext';
import { Ionicons } from '@expo/vector-icons';

export default function AddItemScreen() {
  const router = useRouter();
  const { addItem } = useContext(InventoryContext);

  const [name, setName] = useState('');
  const [category, setCategory] = useState('Fridge');
  const [expiryDays, setExpiryDays] = useState('');
  const [quantity, setQuantity] = useState('1');

  const CATEGORIES = ['Fridge', 'Pantry', 'Freezer'];

  const handleAdd = async () => {
    const qty = parseInt(quantity, 10);
    const days = parseInt(expiryDays, 10);

    if (!name.trim()) return Alert.alert('Error', 'Item name is required.');
    if (isNaN(qty) || qty < 1) return Alert.alert('Error', 'Quantity must be at least 1.');
    if (qty > 9999) return Alert.alert('Error', 'Quantity cannot exceed 9999.'); 
    if (isNaN(days) || days < 0) return Alert.alert('Error', 'Please enter valid days until expiry.');

    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + days);

    try {
      await addItem({
        name: name.trim(),
        category,
        expiryDate: targetDate.toISOString(),
        quantity: qty,
        inShoppingList: false
      });
      
      setName('');
      setCategory('Fridge');
      setExpiryDays('');
      setQuantity('1');
      
      router.navigate('/inventory');
    } catch (error) {
      const validationErrors = error.response?.data?.errors;
      const errorMessage = validationErrors 
        ? validationErrors.map(err => err.message).join('\n')
        : error.response?.data?.message || 'Failed to add item. Please try again.';
      
      Alert.alert('Wait a second...', errorMessage);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        
        <View style={styles.header}>
          <Text style={styles.title}>Add Item</Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.label}>Item Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Organic Milk"
            placeholderTextColor="#C7C7CC"
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>Storage Location</Text>
          <View style={styles.categoryContainer}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.catBtn, category === cat && styles.activeCatBtn]}
                onPress={() => setCategory(cat)}
                activeOpacity={0.7}
              >
                <Text style={[styles.catText, category === cat && styles.activeCatText]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.rowInputs}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.label}>Expires In (days)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 7"
                placeholderTextColor="#C7C7CC"
                value={expiryDays}
                onChangeText={setExpiryDays}
                keyboardType="number-pad"
              />
            </View>

            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.label}>Quantity</Text>
              <TextInput
                style={styles.input}
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="number-pad"
              />
            </View>
          </View>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.cancelBtn} onPress={() => router.navigate('/inventory')}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.saveBtn} onPress={handleAdd} activeOpacity={0.8}>
            <Ionicons name="checkmark-circle" size={22} color="#ffffff" style={{ marginRight: 6 }} />
            <Text style={styles.saveBtnText}>Save Item</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  scrollContent: { padding: 20, paddingTop: 60, paddingBottom: 100 },
  
  header: { marginBottom: 24 },
  title: { fontSize: 34, fontWeight: 'bold', color: '#1C1C1E' },
  subtitle: { fontSize: 16, color: '#8E8E93', marginTop: 4, fontWeight: '500' },
  
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 24
  },
  
  label: { fontSize: 14, fontWeight: '700', color: '#8E8E93', marginBottom: 8, marginTop: 16 },
  input: { height: 50, borderColor: '#E5E5EA', borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, backgroundColor: '#F2F2F7', fontSize: 16, color: '#1C1C1E' },
  
  rowInputs: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  
  categoryContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  catBtn: { flex: 1, paddingVertical: 12, marginHorizontal: 4, borderRadius: 12, backgroundColor: '#F2F2F7', alignItems: 'center', borderWidth: 1, borderColor: '#E5E5EA' },
  activeCatBtn: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  catText: { color: '#8E8E93', fontWeight: '600', fontSize: 15 },
  activeCatText: { color: '#ffffff', fontWeight: 'bold' },
  
  actionRow: { flexDirection: 'row', justifyContent: 'space-between' },
  cancelBtn: { flex: 1, backgroundColor: '#ffffff', paddingVertical: 16, borderRadius: 16, alignItems: 'center', marginRight: 8, borderWidth: 1, borderColor: '#E5E5EA' },
  cancelBtnText: { color: '#8E8E93', fontSize: 17, fontWeight: 'bold' },
  saveBtn: { flex: 2, flexDirection: 'row', backgroundColor: '#007AFF', paddingVertical: 16, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginLeft: 8, shadowColor: '#007AFF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  saveBtnText: { color: '#ffffff', fontSize: 17, fontWeight: 'bold' }
});