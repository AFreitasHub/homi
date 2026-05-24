import React, { useState, useContext, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { AuthContext } from '../context/AuthContext';
import api from '../api';

export default function HomeScreen() {
  const { user, logout } = useContext(AuthContext);
  const [household, setHousehold] = useState(null);
  const [isLoadingHousehold, setIsLoadingHousehold] = useState(true);
  
  const [householdName, setHouseholdName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  const checkUserHousehold = async () => {
    try {
      const response = await api.get('/households');
      setHousehold(response.data);
    } catch (error) {
      if (error.response?.status !== 404) {
        Alert.alert('Server Error', 'Failed to retrieve household configurations.');
      }
    } finally {
      setIsLoadingHousehold(false);
    }
  };

  useEffect(() => {
    checkUserHousehold();
  }, []);

  const handleCreateHousehold = async () => {
    if (!householdName.trim()) {
      Alert.alert('Validation Error', 'Household name cannot be blank.');
      return;
    }

    setIsProcessingAction(true);
    try {
      await api.post('/households', { name: householdName });
      Alert.alert('Success', 'Household created successfully!');
      await checkUserHousehold();
    } catch (error) {
      Alert.alert('Creation Failed', error.response?.data?.message || 'Server error.');
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleJoinHousehold = async () => {
    if (!inviteCode.trim()) {
      Alert.alert('Validation Error', 'Please enter a valid invite code string.');
      return;
    }

    setIsProcessingAction(true);
    try {
      await api.post('/households/join', { inviteCode });
      Alert.alert('Success', 'Successfully joined household network!');
      await checkUserHousehold();
    } catch (error) {
      Alert.alert('Join Failed', error.response?.data?.message || 'Invalid code.');
    } finally {
      setIsProcessingAction(false);
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
        <Text style={styles.title}>Welcome to Homi, {user?.name}!</Text>
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{household.name}</Text>
          <Text style={styles.cardSubtitle}>
            Invite Code: <Text style={styles.codeHighlight}>{household.inviteCode}</Text>
          </Text>
          <Text style={styles.cardMeta}>Active Members: {household.members?.length || 1}</Text>
        </View>

        <Text style={styles.infoPlaceholder}>
          Connection success.
        </Text>

        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutText}>Log Out Account</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Setup Household</Text>
      <Text style={styles.subtitle}>To prevent food waste, create a household or join an existing group channel.</Text>

      {/* Create household */}
      <View style={styles.actionCard}>
        <Text style={styles.cardHeading}>Start a New Household</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Our Apartment, Kitchen 1"
          value={householdName}
          onChangeText={setHouseholdName}
          editable={!isProcessingAction}
        />
        <TouchableOpacity 
          style={[styles.button, isProcessingAction && styles.buttonDisabled]} 
          onPress={handleCreateHousehold}
          disabled={isProcessingAction}
        >
          <Text style={styles.buttonText}>Create Household</Text>
        </TouchableOpacity>
      </View>

      {/* Join household */}
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
        <TouchableOpacity 
          style={[styles.button, styles.joinButton, isProcessingAction && styles.buttonDisabled]} 
          onPress={handleJoinHousehold}
          disabled={isProcessingAction}
        >
          <Text style={styles.buttonText}>Join Group</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Log Out Account</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#ffffff', justifyContent: 'center' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1C1C1E', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 15, color: '#666666', textAlign: 'center', marginBottom: 28 },
  card: { backgroundColor: '#F2F2F7', padding: 20, borderRadius: 12, marginVertical: 16, borderLeftWidth: 5, borderLeftColor: '#007AFF' },
  cardTitle: { fontSize: 22, fontWeight: 'bold', color: '#1C1C1E' },
  cardSubtitle: { fontSize: 16, color: '#3A3A3C', marginTop: 6 },
  codeHighlight: { fontWeight: 'bold', color: '#007AFF' },
  cardMeta: { fontSize: 14, color: '#8E8E93', marginTop: 10 },
  actionCard: { backgroundColor: '#F2F2F7', padding: 16, borderRadius: 12, marginBottom: 16 },
  cardHeading: { fontSize: 16, fontWeight: 'bold', color: '#1C1C1E', marginBottom: 12 },
  input: { height: 46, borderColor: '#E5E5EA', borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, marginBottom: 12, backgroundColor: '#ffffff', fontSize: 16 },
  button: { height: 46, backgroundColor: '#007AFF', justifyContent: 'center', alignItems: 'center', borderRadius: 8 },
  joinButton: { backgroundColor: '#34C759' },
  buttonDisabled: { backgroundColor: '#A3D1FF' },
  buttonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  infoPlaceholder: { fontSize: 15, color: '#8E8E93', textAlign: 'center', fontStyle: 'italic', marginVertical: 24, paddingHorizontal: 16 },
  logoutButton: { marginTop: 20, alignSelf: 'center', padding: 12 },
  logoutText: { color: '#FF3B30', fontSize: 16, fontWeight: '600' }
});