import React, { useState, useContext } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, Modal, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AuthContext } from '../../context/AuthContext'; 

const SettingRow = ({ icon, iconBg, label, value, type = 'link', onPress, isLast = false }) => (
  <TouchableOpacity 
    style={[styles.row, !isLast && styles.rowBorder]} 
    onPress={onPress} 
    activeOpacity={0.7}
  >
    <View style={styles.rowLeft}>
      <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={18} color="#ffffff" />
      </View>
      <Text style={[styles.rowLabel, type === 'destructive' && { color: '#FF3B30' }]}>{label}</Text>
    </View>
    
    {type === 'link' && (
      <View style={styles.rowRight}>
        {value && <Text style={styles.rowValue}>{value}</Text>}
        <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
      </View>
    )}
  </TouchableOpacity>
);

export default function SettingsScreen() {
  const router = useRouter();
  const { user, logout, updateProfile, deleteAccount } = useContext(AuthContext); 
  
  const [modalVisible, setModalVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const openEditModal = () => {
    setEditName(user?.name || '');
    setEditEmail(user?.email || '');
    setEditPassword('');
    setModalVisible(true);
  };

  const handleSaveProfile = async () => {
    if (!editName.trim() || !editEmail.trim()) {
      return Alert.alert('Error', 'Name and Email cannot be empty.');
    }
    
    setIsSaving(true);
    try {
      const updates = { name: editName, email: editEmail };
      if (editPassword.trim().length >= 6) {
        updates.password = editPassword;
      } else if (editPassword.trim().length > 0) {
        setIsSaving(false);
        return Alert.alert('Error', 'Password must be at least 6 characters.');
      }

      await updateProfile(updates);
      setModalVisible(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      const msg = error.response?.data?.errors?.[0]?.message || error.response?.data?.message || 'Failed to update profile.';
      Alert.alert('Error', msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out of Homi?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: async () => { await logout(); router.replace('/'); } }
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account', 
      'This action is PERMANENT. Your account and personal data will be erased. Are you absolutely sure?', 
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete Forever', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await deleteAccount();
              router.replace('/');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete account.');
            }
          } 
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </View>

        <Text style={styles.sectionTitle}>ACCOUNT</Text>
        <View style={styles.sectionGroup}>
          <SettingRow 
            icon="person" 
            iconBg="#007AFF" 
            label="Edit Profile" 
            value={user?.name || 'User'} 
            onPress={openEditModal} 
          />
          <SettingRow 
            icon="home" 
            iconBg="#5856D6" 
            label="Manage Household"
            isLast={true}
            onPress={() => router.navigate('/household')} 
          />
        </View>

        <View style={[styles.sectionGroup, { marginTop: 32 }]}>
          <SettingRow icon="log-out" iconBg="#FF9500" label="Log Out" onPress={handleLogout} />
          <SettingRow 
            icon="trash" 
            iconBg="#FF3B30" 
            label="Delete Account" 
            type="destructive"
            isLast={true}
            onPress={handleDeleteAccount} 
          />
        </View>
        
        <Text style={styles.versionText}>Homi Version 1.0.0</Text>
      </ScrollView>

      {/* EDIT PROFILE MODAL */}
      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            
            <Text style={styles.label}>Full Name</Text>
            <TextInput style={styles.input} value={editName} onChangeText={setEditName} maxLength={50} />

            <Text style={styles.label}>Email Address</Text>
            <TextInput style={styles.input} value={editEmail} onChangeText={setEditEmail} keyboardType="email-address" autoCapitalize="none" maxLength={100} />

            <Text style={styles.label}>New Password (Optional)</Text>
            <TextInput style={styles.input} value={editPassword} onChangeText={setEditPassword} secureTextEntry placeholder="Leave blank to keep current" placeholderTextColor="#C7C7CC" />

            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.btn, styles.cancelBtn]} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, styles.saveBtn]} onPress={handleSaveProfile} disabled={isSaving}>
                {isSaving ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.saveBtnText}>Save</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  content: { padding: 20, paddingTop: 60, paddingBottom: 120 },
  header: { marginBottom: 24 },
  title: { fontSize: 34, fontWeight: 'bold', color: '#1C1C1E' },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: '#8E8E93', marginLeft: 16, marginBottom: 8, marginTop: 24, textTransform: 'uppercase' },
  sectionGroup: { backgroundColor: '#ffffff', borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 16, backgroundColor: '#ffffff' },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: '#E5E5EA' },
  rowLeft: { flexDirection: 'row', alignItems: 'center' },
  iconContainer: { width: 30, height: 30, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  rowLabel: { fontSize: 16, color: '#1C1C1E', fontWeight: '500' },
  rowRight: { flexDirection: 'row', alignItems: 'center' },
  rowValue: { fontSize: 16, color: '#8E8E93', marginRight: 8 },
  versionText: { textAlign: 'center', color: '#8E8E93', fontSize: 13, marginTop: 32, marginBottom: 20 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end'},
  modalContent: { backgroundColor: '#ffffff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalTitle: { fontSize: 22, fontWeight: '800', color: '#1C1C1E', marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#8E8E93', marginBottom: 6, marginTop: 12 },
  input: { height: 48, borderColor: '#E5E5EA', borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, backgroundColor: '#F2F2F7', fontSize: 16, color: '#1C1C1E' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 32 },
  btn: { paddingVertical: 14, paddingHorizontal: 20, borderRadius: 12, justifyContent: 'center', alignItems: 'center', minWidth: 100 },
  cancelBtn: { backgroundColor: '#F2F2F7', marginRight: 12 },
  cancelBtnText: { color: '#8E8E93', fontWeight: 'bold', fontSize: 16 },
  saveBtn: { backgroundColor: '#007AFF' },
  saveBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 16 }
});