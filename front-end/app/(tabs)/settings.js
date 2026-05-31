import React, { useState, useContext } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AuthContext } from '../../context/AuthContext'; 

const SettingRow = ({ icon, iconBg, label, value, type = 'link', onPress, isLast = false, toggleValue, onToggle }) => (
  <TouchableOpacity 
    style={[styles.row, !isLast && styles.rowBorder]} 
    onPress={onPress} 
    activeOpacity={type === 'link' ? 0.7 : 1}
    disabled={type === 'toggle'}
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
    
    {type === 'toggle' && (
      <Switch
        value={toggleValue}
        onValueChange={onToggle}
        trackColor={{ false: '#E5E5EA', true: '#34C759' }}
      />
    )}
  </TouchableOpacity>
);

export default function SettingsScreen() {
  const router = useRouter();
  
  const { user, logout } = useContext(AuthContext); 
  
  const [notifications, setNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out of Homi?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Log Out', 
        style: 'destructive', 
        onPress: async () => {
          if (logout) await logout(); 
          router.replace('/'); 
        } 
      }
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <Text style={styles.sectionTitle}>ACCOUNT</Text>
      <View style={styles.sectionGroup}>
        <SettingRow 
          icon="person" 
          iconBg="#007AFF" 
          label="Profile" 
          value={user?.name || 'User'} 
          onPress={() => Alert.alert('Coming Soon')} 
        />
        <SettingRow 
          icon="home" 
          iconBg="#5856D6" 
          label="Household" 
          value={user?.householdName || 'My Household'}
          isLast={true}
          onPress={() => router.navigate('/household')} 
        />
      </View>

      <Text style={styles.sectionTitle}>PREFERENCES</Text>
      <View style={styles.sectionGroup}>
        <SettingRow 
          icon="notifications" 
          iconBg="#FF2D55" 
          label="Push Notifications" 
          type="toggle"
          toggleValue={notifications}
          onToggle={setNotifications}
        />
        <SettingRow 
          icon="moon" 
          iconBg="#1C1C1E" 
          label="Dark Mode" 
          type="toggle"
          toggleValue={darkMode}
          onToggle={setDarkMode}
          isLast={true}
        />
      </View>

      <Text style={styles.sectionTitle}>SUPPORT</Text>
      <View style={styles.sectionGroup}>
        <SettingRow 
          icon="help-buoy" 
          iconBg="#34C759" 
          label="Help & FAQ" 
          onPress={() => Alert.alert('Coming Soon')} 
        />
        <SettingRow 
          icon="star" 
          iconBg="#FF9500" 
          label="Rate Homi" 
          isLast={true}
          onPress={() => Alert.alert('Coming Soon')} 
        />
      </View>

      <View style={[styles.sectionGroup, { marginTop: 16 }]}>
        <SettingRow 
          icon="log-out" 
          iconBg="#FF3B30" 
          label="Log Out" 
          type="destructive"
          isLast={true}
          onPress={handleLogout} 
        />
      </View>
      
      <Text style={styles.versionText}>Homi Version 1.0.0</Text>
    </ScrollView>
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
  versionText: { textAlign: 'center', color: '#8E8E93', fontSize: 13, marginTop: 32, marginBottom: 20 }
});