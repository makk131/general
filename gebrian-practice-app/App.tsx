import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';

import { HomeScreen } from './screens/HomeScreen';
import { AddSegmentScreen } from './screens/AddSegmentScreen';
import { PerformanceReadyScreen } from './screens/PerformanceReadyScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#667eea',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e2e8f0',
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Practice"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color }) => <TabIcon icon="📚" color={color} />,
        }}
      />
      <Tab.Screen
        name="Ready"
        component={PerformanceReadyScreen}
        options={{
          tabBarIcon: ({ color }) => <TabIcon icon="✓" color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

function TabIcon({ icon, color }: { icon: string; color: string }) {
  return <Text style={{ fontSize: 24, color }}>{icon}</Text>;
}

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Home" component={HomeTabs} />
        <Stack.Screen
          name="AddSegment"
          component={AddSegmentScreen}
          options={{
            presentation: 'modal',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
