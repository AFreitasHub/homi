import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, FlatList, RefreshControl, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../api';

export default function HouseholdScreen() {
  const [household, setHousehold] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchHousehold = async () => {
    try {
      const response = await api.get('/households');
      setHousehold(response.data);
    } catch (error) {
      Alert.alert('Error', 'Could not fetch household data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHousehold();
  }, []);

  const renderMember = ({ item }) => (
    <View style={styles.memberCard}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
      </View>
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{item.name}</Text>
        <Text style={styles.memberEmail}>{item.email}</Text>
      </View>
      {household?.owner?._id === item._id && (
        <View style={styles.ownerBadge}>
          <Text style={styles.ownerBadgeText}>OWNER</Text>
        </View>
      )}
    </View>
  );

  if (isLoading && !household) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Household</Text>
      </View>

      <View style={styles.codeCard}>
        <Text style={styles.codeLabel}>INVITE CODE</Text>
        <Text style={styles.codeText}>{household?.inviteCode || '----'}</Text>
        <Text style={styles.codeHint}>Share this code to add roommates or family members.</Text>
      </View>

      <Text style={styles.sectionTitle}>MEMBERS ({household?.members.length || 0})</Text>

      <FlatList
        data={household?.members || []}
        keyExtractor={(item) => item._id}
        renderItem={renderMember}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchHousehold} tintColor="#007AFF" />}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F2F2F7', paddingTop: 60 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { marginBottom: 24 },
  title: { fontSize: 34, fontWeight: 'bold', color: '#1C1C1E' },
  subtitle: { fontSize: 17, color: '#007AFF', fontWeight: '600', marginTop: 4 },
  
  codeCard: { 
    backgroundColor: '#ffffff', 
    padding: 24, 
    borderRadius: 20, 
    alignItems: 'center', 
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3
  },
  codeLabel: { fontSize: 12, fontWeight: 'bold', color: '#8E8E93', letterSpacing: 1.5, marginBottom: 8 },
  codeText: { fontSize: 42, fontWeight: '900', color: '#1C1C1E', marginBottom: 8 },
  codeHint: { fontSize: 14, color: '#8E8E93', textAlign: 'center', paddingHorizontal: 20 },
  
  sectionTitle: { fontSize: 13, fontWeight: '600', color: '#8E8E93', marginLeft: 4, marginBottom: 12, letterSpacing: 0.5 },
  
  memberCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2
  },
  avatar: { width: 48, height: 48, borderRadius: 14, backgroundColor: '#E5F1FF', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  avatarText: { fontSize: 20, fontWeight: 'bold', color: '#007AFF' },
  memberInfo: { flex: 1 },
  memberName: { fontSize: 16, fontWeight: '700', color: '#1C1C1E' },
  memberEmail: { fontSize: 14, color: '#8E8E93', marginTop: 2 },
  ownerBadge: { backgroundColor: '#E5F1FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  ownerBadgeText: { fontSize: 10, fontWeight: 'bold', color: '#007AFF' }
});