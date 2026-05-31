import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function InventoryItem({ item, onEdit, onDelete }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [editName, setEditName] = useState(item.name);
  const [editQuantity, setEditQuantity] = useState(item.quantity.toString());
  
  const getDaysLeftNum = () => {
    const days = Math.ceil((new Date(item.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
    return days > 0 ? days.toString() : '0';
  };
  const [editExpiryDays, setEditExpiryDays] = useState(getDaysLeftNum());

  const getExpiryBadge = () => {
    if (item.inShoppingList) return { text: 'Needs Restock', color: '#10171e', bg: '#E5F1FF' };
    
    const days = Math.ceil((new Date(item.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
    if (days < 0) return { text: 'Expired', color: '#FF3B30', bg: '#FFEBEA' };
    if (days === 0) return { text: 'Expires Today', color: '#FF9500', bg: '#FFF4CE' };
    if (days === 1) return { text: 'Expires Tomorrow', color: '#FF9500', bg: '#FFF4CE' };
    if (days <= 3) return { text: `Expires in ${days} days`, color: '#FF9500', bg: '#FFF4CE' };
    
    const dateStr = new Date(item.expiryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return { text: `Expires ${dateStr}`, color: '#34C759', bg: '#E8F8F5' };
  };

  const badge = getExpiryBadge();

  const showErrorAlert = (error) => {
    const validationErrors = error.response?.data?.errors;
    const errorMessage = validationErrors 
      ? validationErrors.map(err => err.message).join('\n')
      : error.response?.data?.message || 'Action failed. The change was undone.';
    
    Alert.alert('Wait a second...', errorMessage);
  };
  
  const handleIncrement = async () => {
    if (item.inShoppingList) {
      setEditQuantity((item.quantity + 1).toString());
      setEditExpiryDays(''); 
      setModalVisible(true);
    } else {
      try {
        await onEdit(item._id, { quantity: item.quantity + 1 });
      } catch (error) {
        showErrorAlert(error);
      }
    }
  };

const handleDecrement = async () => {
    try {
      if (item.quantity <= 1) {
        await onEdit(item._id, { quantity: 0, inShoppingList: true });
      } else {
        await onEdit(item._id, { quantity: item.quantity - 1 });
      }
    } catch (error) {
      showErrorAlert(error);
    }
  };

  const handleSaveEdit = async () => {
    const qty = parseInt(editQuantity, 10);
    const days = parseInt(editExpiryDays, 10);

    if (!editName.trim()) return Alert.alert('Error', 'Item name cannot be empty.');
    if (isNaN(qty) || qty < 0) return Alert.alert('Error', 'Quantity must be a valid number.');
    if (qty > 9999) return Alert.alert('Error', 'Quantity cannot exceed 9999.'); // Local check
    if (isNaN(days) || days < 0) return Alert.alert('Error', 'Expiry days must be a valid number.');

    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + days);

    try {
      await onEdit(item._id, { 
        name: editName, 
        quantity: qty,
        expiryDate: targetDate.toISOString(),
        inShoppingList: qty === 0 ? true : item.inShoppingList 
      });
      setModalVisible(false);
    } catch (error) {
      showErrorAlert(error);
    }
  };

  const handleDeletePress = () => {
    setModalVisible(false);
    if (!item.inShoppingList) {
      Alert.alert('Remove Item', 'Add to shopping list or delete completely?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'To Shopping List', onPress: () => onEdit(item._id, { quantity: 0, inShoppingList: true }) },
        { text: 'Delete Completely', onPress: () => onDelete(item._id), style: 'destructive' },
      ]);
    } else {
      Alert.alert('Delete Item', 'Permanently remove this item?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', onPress: () => onDelete(item._id), style: 'destructive' },
      ]);
    }
  };

  return (
    <View style={styles.cardContainer}>
      <TouchableOpacity 
        style={styles.card} 
        activeOpacity={0.7}
        onPress={() => {
          setEditName(item.name);
          setEditQuantity(item.quantity.toString());
          setEditExpiryDays(item.inShoppingList ? '' : getDaysLeftNum());
          setModalVisible(true);
        }}
      >
        <View style={styles.infoSide}>
          <View style={styles.titleRow}>
            <Text style={styles.itemNameText}>{item.name}</Text>
            <View style={[styles.badge, { backgroundColor: badge.bg }]}>
              <Text style={[styles.badgeText, { color: badge.color }]}>{badge.text}</Text>
            </View>
          </View>
          <Text style={styles.itemMetaText}>{item.category} • {item.quantity} units</Text>
        </View>

        <View style={styles.controlSide}>
          <View style={styles.quantityContainer}>
            <TouchableOpacity style={styles.qtyBtn} onPress={handleDecrement}>
              <Ionicons name="remove" size={20} color="#007AFF" />
            </TouchableOpacity>
            
            <Text style={styles.quantityText}>{item.quantity}</Text>
            
            <TouchableOpacity style={styles.qtyBtn} onPress={handleIncrement}>
              <Ionicons name="add" size={20} color="#007AFF" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>

      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalTitleRow}>
              <Ionicons 
                name={item.inShoppingList ? 'cart' : 'pencil'} 
                size={24} 
                color="#1C1C1E" 
              />
              <Text style={styles.modalTitleText}>
                {item.inShoppingList ? 'Restock Item' : 'Edit Item'}
              </Text>
            </View>
            <Text style={styles.label}>Name</Text>
            <TextInput style={styles.input} value={editName} onChangeText={setEditName} />
            <View style={styles.rowInputs}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.label}>Expires in (days)</Text>
                <TextInput style={styles.input} placeholder="e.g., 7" value={editExpiryDays} onChangeText={setEditExpiryDays} keyboardType="number-pad" />
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.label}>Quantity</Text>
                <TextInput style={styles.input} value={editQuantity} onChangeText={setEditQuantity} keyboardType="number-pad" />
              </View>
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.btn, styles.deleteBtn]} onPress={handleDeletePress}>
                <Text style={styles.deleteBtnText}>Remove</Text>
              </TouchableOpacity>
              <View style={styles.rightActions}>
                <TouchableOpacity style={[styles.btn, styles.cancelBtn]} onPress={() => setModalVisible(false)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btn, styles.saveBtn]} onPress={handleSaveEdit}>
                  <Text style={styles.saveBtnText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    paddingHorizontal: 4,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3, 
  },
  
  infoSide: { flex: 1, paddingRight: 12 },
  titleRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginBottom: 4 },
  itemNameText: { fontSize: 17, fontWeight: '700', color: '#1C1C1E', marginRight: 8 },
  itemMetaText: { fontSize: 13, color: '#8E8E93', fontWeight: '500' },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginTop: 2 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  controlSide: { flexDirection: 'row', alignItems: 'center' },
  quantityContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F2F2F7', borderRadius: 12, padding: 4 },
  qtyBtn: { width: 32, height: 32, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff', borderRadius: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 1 },
  quantityText: { fontSize: 15, fontWeight: '700', minWidth: 28, textAlign: 'center', marginHorizontal: 4, color: '#1C1C1E' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#ffffff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalTitleRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 16,
    gap: 8
  },
  modalTitleText: { 
    fontSize: 22, 
    fontWeight: '800', 
    color: '#1C1C1E' 
  },
  rowInputs: { flexDirection: 'row', justifyContent: 'space-between' },
  label: { fontSize: 14, fontWeight: '600', color: '#8E8E93', marginBottom: 6, marginTop: 12 },
  input: { height: 48, borderColor: '#E5E5EA', borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, backgroundColor: '#F2F2F7', fontSize: 16 },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 32, alignItems: 'center' },
  rightActions: { flexDirection: 'row' },
  btn: { paddingVertical: 14, paddingHorizontal: 20, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  deleteBtn: { backgroundColor: '#FFEBEA' },
  deleteBtnText: { color: '#FF3B30', fontWeight: 'bold', fontSize: 16 },
  cancelBtn: { backgroundColor: '#F2F2F7', marginRight: 12 },
  cancelBtnText: { color: '#8E8E93', fontWeight: 'bold', fontSize: 16 },
  saveBtn: { backgroundColor: '#007AFF', minWidth: 100 },
  saveBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 16 }
});