import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, FlatList, RefreshControl, Alert, TextInput, TouchableOpacity } from 'react-native';
import api from '../../api';
import { saveCache, getCache } from '../../utils/cache';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HouseholdScreen() {
  const [household, setHousehold] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [newHouseholdName, setNewHouseholdName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchHousehold = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/households');
      setHousehold(response.data);
      await saveCache('@homi_household', response.data); 
    } catch (error) {
      if (error.response?.status === 404) {
        setHousehold(null);
        await AsyncStorage.removeItem('@homi_household'); 
      } else {
        const cachedHousehold = await getCache('@homi_household');
        if (cachedHousehold) {
          setHousehold(cachedHousehold);
        } else {
          Alert.alert('Error', 'Could not fetch household data and no offline data found.');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHousehold();
  }, []);

const handleCreateHousehold = async () => {
    if (!newHouseholdName.trim()) return Alert.alert('Error', 'Household name is required.');
    setIsSubmitting(true);
    try {
      await api.post('/households', { name: newHouseholdName });
      await fetchHousehold(); 
    } catch (error) {
      Alert.alert('Error', 'Failed to create household.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJoinHousehold = async () => {
    if (!joinCode.trim()) return Alert.alert('Error', 'Invite code is required.');
    setIsSubmitting(true);
    try {
      await api.post('/households/join', { inviteCode: joinCode });
      await fetchHousehold(); 
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Invalid invite code.');
    } finally {
      setIsSubmitting(false);
    }
  };

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

  if (!household) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Home</Text>
          <Text style={styles.subtitle}>Create or join a household to start adding items.</Text>
        </View>

        <View style={styles.setupCard}>
          <Text style={styles.sectionTitle}>CREATE NEW HOUSEHOLD</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., The Apartment, Smith Family"
            value={newHouseholdName}
            onChangeText={setNewHouseholdName}
            editable={!isSubmitting}
          />
          <TouchableOpacity style={styles.button} onPress={handleCreateHousehold} disabled={isSubmitting}>
            <Text style={styles.buttonText}>Create Household</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.setupCard}>
          <Text style={styles.sectionTitle}>JOIN EXISTING HOUSEHOLD</Text>
          <TextInput
            style={styles.input}
            placeholder="6-Character Invite Code"
            value={joinCode}
            onChangeText={setJoinCode}
            autoCapitalize="characters"
            editable={!isSubmitting}
          />
          <TouchableOpacity style={[styles.button, styles.joinButton]} onPress={handleJoinHousehold} disabled={isSubmitting}>
            <Text style={styles.joinButtonText}>Join Household</Text>
          </TouchableOpacity>
        </View>
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
  subtitle: { fontSize: 16, color: '#8E8E93', marginTop: 8 },
  
  setupCard: { backgroundColor: '#ffffff', padding: 20, borderRadius: 16, marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  input: { height: 50, borderColor: '#E5E5EA', borderWidth: 1, borderRadius: 8, paddingHorizontal: 16, marginBottom: 16, fontSize: 16, backgroundColor: '#F2F2F7' },
  button: { height: 50, backgroundColor: '#007AFF', justifyContent: 'center', alignItems: 'center', borderRadius: 8 },
  buttonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  joinButton: { backgroundColor: '#E5F1FF' },
  joinButtonText: { color: '#007AFF', fontSize: 16, fontWeight: 'bold' },
  codeCard: { backgroundColor: '#ffffff', padding: 24, borderRadius: 20, alignItems: 'center', marginBottom: 32, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3 },
  codeLabel: { fontSize: 12, fontWeight: 'bold', color: '#8E8E93', letterSpacing: 1.5, marginBottom: 8 },
  codeText: { fontSize: 42, fontWeight: '900', color: '#1C1C1E', marginBottom: 8 },
  codeHint: { fontSize: 14, color: '#8E8E93', textAlign: 'center', paddingHorizontal: 20 },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: '#8E8E93', marginLeft: 4, marginBottom: 12, letterSpacing: 0.5 },
  memberCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', padding: 16, borderRadius: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  avatar: { width: 48, height: 48, borderRadius: 14, backgroundColor: '#E5F1FF', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  avatarText: { fontSize: 20, fontWeight: 'bold', color: '#007AFF' },
  memberInfo: { flex: 1 },
  memberName: { fontSize: 16, fontWeight: '700', color: '#1C1C1E' },
  memberEmail: { fontSize: 14, color: '#8E8E93', marginTop: 2 },
  ownerBadge: { backgroundColor: '#E5F1FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  ownerBadgeText: { fontSize: 10, fontWeight: 'bold', color: '#007AFF' }
});