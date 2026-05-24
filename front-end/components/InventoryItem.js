import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';

export default function InventoryItem({ item, onEdit, onDelete }) {
  const handleIncrement = () => onEdit(item._id, { quantity: item.quantity + 1 });
  const handleDecrement = () => {
    if (item.quantity <= 1) {
      Alert.alert('Remove Item', 'Do you want to delete this item completely?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => onDelete(item._id) },
      ]);
    } else {
      onEdit(item._id, { quantity: item.quantity - 1 });
    }
  };

  return (
    <View style={styles.itemRow}>
      <View style={styles.infoSide}>
        <Text style={styles.itemNameText}>{item.name}</Text>
        <Text style={styles.itemMetaText}>
          {item.category} • Expires: {new Date(item.expiryDate).toLocaleDateString()}
        </Text>
      </View>

      <View style={styles.controlSide}>
        {/* edit controls */}
        <View style={styles.quantityContainer}>
          <TouchableOpacity style={styles.qtyBtn} onPress={handleDecrement}>
            <Text style={styles.qtyBtnText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.quantityText}>{item.quantity}</Text>
          <TouchableOpacity style={styles.qtyBtn} onPress={handleIncrement}>
            <Text style={styles.qtyBtnText}>+</Text>
          </TouchableOpacity>
        </View>

        {/* delete */}
        <TouchableOpacity style={styles.deleteBtn} onPress={() => onDelete(item._id)}>
          <Text style={styles.deleteBtnText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E5E5EA' },
  infoSide: { flex: 1, paddingRight: 8 },
  itemNameText: { fontSize: 16, fontWeight: '600', color: '#1C1C1E' },
  itemMetaText: { fontSize: 12, color: '#8E8E93', marginTop: 2 },
  controlSide: { flexDirection: 'row', alignItems: 'center' },
  quantityContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F2F2F7', borderRadius: 6, marginRight: 12, padding: 2 },
  qtyBtn: { width: 28, height: 28, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff', borderRadius: 4 },
  qtyBtnText: { fontSize: 16, fontWeight: 'bold', color: '#007AFF' },
  quantityText: { fontSize: 14, fontWeight: '600', horizontalPadding: 8, minWidth: 24, textAlign: 'center', marginHorizontal: 6 },
  deleteBtn: { padding: 6 },
  deleteBtnText: { fontSize: 16 }
});