import React from 'react';
import { Tabs } from 'expo-router';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CustomAddButton = ({ onPress }) => (
  <TouchableOpacity style={styles.fabContainer} onPress={onPress} activeOpacity={0.8}>
    <View style={styles.fabButton}>
      <Ionicons name="add" size={36} color="#ffffff" />
    </View>
  </TouchableOpacity>
);

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false, 
        tabBarShowLabel: true, 
        tabBarActiveTintColor: '#007AFF', 
        tabBarInactiveTintColor: '#8E8E93', 
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tabs.Screen 
        name="inventory" 
        options={{ 
          title: 'Inventory',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'cube' : 'cube-outline'} size={24} color={color} />
          )
        }} 
      />
      
      <Tabs.Screen 
        name="shopping-list" 
        options={{ 
          title: 'Shopping',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'cart' : 'cart-outline'} size={24} color={color} />
          )
        }} 
      />
      
      <Tabs.Screen 
        name="add-item-modal" 
        options={{ 
          title: '', 
          tabBarButton: (props) => <CustomAddButton {...props} /> 
        }} 
      />
      
      <Tabs.Screen 
        name="household" 
        options={{ 
          title: 'Household',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={color} />
          )
        }} 
      />
      
      <Tabs.Screen 
        name="analytics" 
        options={{ 
          title: 'Analytics',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'bar-chart' : 'bar-chart-outline'} size={24} color={color} />
          )
        }} 
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff', 
    height: 85,
    paddingBottom: 24,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA', 
    elevation: 0,
    shadowOpacity: 0
  },
  tabBarLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 4,
  },
  fabContainer: {
    top: -5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF', 
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#ffffff', 
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  }
});