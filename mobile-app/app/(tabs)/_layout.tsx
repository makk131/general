import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

const COLORS = {
  primary: '#6366F1',
  secondary: '#8B5CF6',
  background: '#0F172A',
  card: '#1E293B',
  text: '#F1F5F9',
  textMuted: '#94A3B8',
};

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#A78BFA',
        tabBarInactiveTintColor: '#64748B',
        tabBarStyle: {
          backgroundColor: COLORS.card,
          borderTopWidth: 0,
          height: 85,
          paddingBottom: 30,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Practice',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="musical-notes" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="passages"
        options={{
          title: 'Passages',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="library" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="technical"
        options={{
          title: 'Technical',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="fitness" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          title: 'Journal',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="journal" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
