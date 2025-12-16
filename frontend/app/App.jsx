import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'react-native';

import AccountsTab from './(tabs)/AccountsTab';
import PaymentsTab from './(tabs)/PaymentsTab';
import RemindersTab from './(tabs)/RemindersTab';
import SettingsTab from './(tabs)/SettingsTab';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#7C3AED" />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;
              
              if (route.name === 'Accounts') {
                iconName = focused ? 'people' : 'people-outline';
              } else if (route.name === 'Payments') {
                iconName = focused ? 'card' : 'card-outline';
              } else if (route.name === 'Reminders') {
                iconName = focused ? 'notifications' : 'notifications-outline';
              } else if (route.name === 'Settings') {
                iconName = focused ? 'settings' : 'settings-outline';
              }
              
              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#7C3AED',
            tabBarInactiveTintColor: 'gray',
            headerShown: false,
            tabBarStyle: {
              paddingBottom: 8,
              paddingTop: 8,
              height: 60,
            },
          })}
        >
          <Tab.Screen name="Accounts" component={AccountsTab} />
          <Tab.Screen name="Payments" component={PaymentsTab} />
          <Tab.Screen name="Reminders" component={RemindersTab} />
          <Tab.Screen name="Settings" component={SettingsTab} />
        </Tab.Navigator>
      </NavigationContainer>
    </>
  );
}