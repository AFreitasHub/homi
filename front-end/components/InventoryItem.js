import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';


export default function InventoryItem({ item, onEdit }) {
  const handleIncrement = () => onEdit(item._id, { quantity: item.quantity + 1 });
  const handleDecrement = () => {
    if (item.quantity > 1) {
      onEdit(item._id, { quantity: item.quantity - 1 });
    }
  };

  return (
    <View style={styles.itemRow}>
      <Text style={styles.itemName}>{item.name}</Text>
      <View style={styles.controls}>
        <TouchableOpacity style={styles.btn} onPress={handleDecrement}>
          <Text>-</Text>
        </TouchableOpacity>
        <Text style={styles.qty}>{item.quantity}</Text>
        <TouchableOpacity style={styles.btn} onPress={handleIncrement}>
          <Text>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 10, borderBottomWidth: 1 },
  controls: { flexDirection: 'row', alignItems: 'center' },
  btn: { padding: 10, backgroundColor: '#ddd', marginHorizontal: 5 }
});