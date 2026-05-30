import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, FlatList, RefreshControl, Alert } from 'react-native';
import api from '../../api';

export default function HouseholdScreen() {
  const [household, setHousehold] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchHousehold = async () => {
    try {
      // backend automatically populates the members and owner fields
      const response = await api.get('/households');
      setHousehold(response.data);
    } catch (error) {
      Alert.alert('Error', 'Could not fetch household data. Are you online?');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHousehold();
  }, []);

  const renderMember = ({ item }) => (
    <View style={styles.memberRow}>
      <View style={styles.avatar}>
        {/* grabs the first letter of their name for a simple avatar */}
        <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
      </View>
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{item.name}</Text>
        <Text style={styles.memberEmail}>{item.email}</Text>
      </View>
      {/* show a badge if this user is the creator of the household */}
      {household?.owner?._id === item._id && (
        <View style={styles.ownerBadge}>
          <Text style={styles.ownerBadgeText}>Owner</Text>
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

  if (!household) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>You are not in a household.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{household.name}</Text>
        <Text style={styles.subtitle}>Manage your shared kitchen</Text>
      </View>

      <View style={styles.codeCard}>
        <Text style={styles.codeLabel}>INVITE CODE</Text>
        <Text style={styles.codeText}>{household.inviteCode}</Text>
        <Text style={styles.codeHint}>Share this code with roommates or family so they can join this household.</Text>
      </View>

      <Text style={styles.sectionTitle}>Members ({household.members.length})</Text>

      <FlatList
        data={household.members}
        keyExtractor={(item) => item._id}
        renderItem={renderMember}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={fetchHousehold}
            tintColor="#007AFF"
          />
        }
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#ffffff', paddingTop: 50 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff' },
  header: { marginBottom: 24 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#1C1C1E' },
  subtitle: { fontSize: 16, color: '#8E8E93', marginTop: 4 },
  codeCard: { backgroundColor: '#F2F2F7', padding: 20, borderRadius: 16, alignItems: 'center', marginBottom: 32, borderWidth: 1, borderColor: '#E5E5EA' },
  codeLabel: { fontSize: 12, fontWeight: 'bold', color: '#8E8E93', letterSpacing: 1.5, marginBottom: 8 },
  codeText: { fontSize: 40, fontWeight: '900', color: '#007AFF', letterSpacing: 4, marginBottom: 8 },
  codeHint: { fontSize: 13, color: '#666666', textAlign: 'center', paddingHorizontal: 10 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1C1C1E', marginBottom: 16 },
  memberRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F2F2F7' },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E5F1FF', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { fontSize: 18, fontWeight: 'bold', color: '#007AFF' },
  memberInfo: { flex: 1 },
  memberName: { fontSize: 16, fontWeight: '600', color: '#1C1C1E' },
  memberEmail: { fontSize: 13, color: '#8E8E93', marginTop: 2 },
  ownerBadge: { backgroundColor: '#1C1C1E', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  ownerBadgeText: { fontSize: 11, fontWeight: 'bold', color: '#ffffff' },
  emptyText: { fontSize: 16, color: '#8E8E93' }
});